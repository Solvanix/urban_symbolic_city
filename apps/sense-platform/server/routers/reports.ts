import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { addReportEvent, attachReportEvidence, createNotification, createReport, getReportById, getReportKpiData, listOperationalReports, listReportsForUser, updateReportStatus } from "../db";
import { calculateReportKpis } from "../reportKpis";
import { storagePut } from "../storage";
import { protectedProcedure, router } from "../_core/trpc";
import { evidenceContentTypes, isEvidenceSizeAllowed, isSupportedEvidenceType, canTransitionReport, isOperationalRole, filterQueueForRole } from "../reportWorkflow";

const statusValues = ["draft", "submitted", "review", "needs_info", "rejected", "assigned", "in_progress", "awaiting_approval", "closed", "reopened"] as const;
const statusSchema = z.enum(statusValues);

function requireRole(role: string, allowed: readonly string[]) {
  if (!allowed.includes(role)) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية لهذا الإجراء" });
}

export const reportsRouter = router({
  create: protectedProcedure
    .input(z.object({
      title: z.string().trim().min(3).max(180),
      description: z.string().trim().min(10).max(5000),
      category: z.enum(["accessibility", "road", "lighting", "waste", "transport", "other"]).default("accessibility"),
      priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
      latitude: z.string().max(32).optional(),
      longitude: z.string().max(32).optional(),
      address: z.string().max(255).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const report = await createReport({ ...input, reporterId: ctx.user.id, status: "submitted" });
      await addReportEvent({ reportId: report.id, actorId: ctx.user.id, fromStatus: null, toStatus: "submitted", note: "تم إنشاء البلاغ من المواطن" });
      await createNotification({ userId: ctx.user.id, kind: "report", title: "تم استلام البلاغ", body: `استلمنا بلاغك «${report.title}» وسيظهر لك كل تحديث في مركز التنبيهات.`, href: "/reports", sourceType: "report", sourceId: report.id });
      return report;
    }),

  mine: protectedProcedure.query(({ ctx }) => listReportsForUser(ctx.user.id)),

  queue: protectedProcedure.query(async ({ ctx }) => {
    requireRole(ctx.user.role, ["staff", "field", "supervisor", "admin"]);
    const reports = await listOperationalReports(ctx.user.id);
    return filterQueueForRole(ctx.user.role, ctx.user.id, reports);
  }),

  kpis: protectedProcedure.query(async ({ ctx }) => {
    requireRole(ctx.user.role, ["supervisor", "admin"]);
    const data = await getReportKpiData();
    return calculateReportKpis(data.reports, data.events);
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const report = await getReportById(input.id);
      if (!report) throw new TRPCError({ code: "NOT_FOUND", message: "البلاغ غير موجود" });
      const canOperate = isOperationalRole(ctx.user.role);
      if (report.reporterId !== ctx.user.id && report.assignedToId !== ctx.user.id && !canOperate) {
        throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية عرض هذا البلاغ" });
      }
      return report;
    }),

  uploadEvidence: protectedProcedure
    .input(z.object({
      reportId: z.number().int().positive(),
      fileName: z.string().trim().min(1).max(180),
      contentType: z.enum(evidenceContentTypes),
      base64: z.string().min(1).max(8_000_000),
    }))
    .mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, ["field", "supervisor", "admin"]);
      const report = await getReportById(input.reportId);
      if (!report) throw new TRPCError({ code: "NOT_FOUND", message: "البلاغ غير موجود" });
      if (ctx.user.role === "field" && report.assignedToId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "لا يمكنك رفع دليل لبلاغ غير مسند إليك" });
      }
      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-120) || "evidence";
      if (!isSupportedEvidenceType(input.contentType)) throw new TRPCError({ code: "BAD_REQUEST", message: "نوع الدليل غير مدعوم" });
      const bytes = Buffer.from(input.base64, "base64");
      if (!isEvidenceSizeAllowed(bytes.length)) throw new TRPCError({ code: "BAD_REQUEST", message: "حجم الدليل غير صالح (الحد 6MB)" });
      const uploaded = await storagePut(`reports/${input.reportId}/${ctx.user.id}-${safeName}`, bytes, input.contentType);
      const updated = await attachReportEvidence(input.reportId, uploaded.url);
      await addReportEvent({ reportId: input.reportId, actorId: ctx.user.id, fromStatus: report.status, toStatus: report.status, note: "تم رفع دليل للبلاغ", evidenceUrl: uploaded.url });
      await createNotification({ userId: report.reporterId, kind: "report", title: "أضيف دليل إلى البلاغ", body: `تم تحديث البلاغ «${report.title}» بدليل ميداني جديد.`, href: "/reports", sourceType: "report", sourceId: report.id });
      return updated;
    }),

  transition: protectedProcedure
    .input(z.object({
      id: z.number().int().positive(),
      toStatus: statusSchema,
      note: z.string().trim().max(2000).optional(),
      assignedToId: z.number().int().positive().nullable().optional(),
      evidenceUrl: z.string().url().max(2000).nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, ["staff", "field", "supervisor", "admin"]);
      const current = await getReportById(input.id);
      if (!current) throw new TRPCError({ code: "NOT_FOUND", message: "البلاغ غير موجود" });
      const role = ctx.user.role as Parameters<typeof canTransitionReport>[0];
      if (!canTransitionReport(role, current.status, input.toStatus, current.assignedToId, ctx.user.id)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "هذا الدور لا يستطيع تنفيذ هذا التحول" });
      }
      const updated = await updateReportStatus(input.id, input.toStatus, input.assignedToId, input.evidenceUrl);
      await addReportEvent({ reportId: input.id, actorId: ctx.user.id, fromStatus: current.status, toStatus: input.toStatus, note: input.note, evidenceUrl: input.evidenceUrl });
      await createNotification({ userId: current.reporterId, kind: "report", title: "تحديث حالة البلاغ", body: `تغيرت حالة البلاغ «${current.title}» إلى «${input.toStatus}».`, href: "/reports", sourceType: "report", sourceId: current.id });
      if (input.assignedToId && input.assignedToId !== current.reporterId && input.assignedToId !== ctx.user.id) {
        await createNotification({ userId: input.assignedToId, kind: "report", title: "أُسند إليك بلاغ", body: `تم إسناد البلاغ «${current.title}» إلى حسابك للمراجعة أو المتابعة.`, href: "/ops/reports", sourceType: "report", sourceId: current.id });
      }
      return updated;
    }),
});

export type ReportsRouter = typeof reportsRouter;
