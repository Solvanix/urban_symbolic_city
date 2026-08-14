import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  addProviderAuditEvent,
  archiveProviderProduct,
  archiveProviderService,
  createProvider,
  createProviderProduct,
  createProviderService,
  getProviderById,
  getProviderMember,
  listProviderMembers,
  upsertProviderMember,
  updateProviderMember,
  removeProviderMember,
  listProviderProducts,
  listProvidersForUser,
  listProviderServices,
  listPendingProviders,
  listPublicProviderProducts,
  listPublicProviderServices,
  updateProvider,
  updateProviderProduct,
  updateProviderService,
} from "../db";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { canProviderMember } from "../providerAccess";
import { storagePut } from "../storage";

const providerType = z.enum(["product", "service", "both"]);
const productStatus = z.enum(["draft", "pending_review", "published", "paused", "archived"]);
const serviceStatus = z.enum(["draft", "pending_review", "published", "paused", "archived"]);

async function providerRole(providerId: number, user: { id: number; role: string }) {
  const provider = await getProviderById(providerId);
  if (!provider) throw new TRPCError({ code: "NOT_FOUND", message: "المزود غير موجود" });
  if (user.role === "admin" || provider.ownerUserId === user.id) return { provider, role: "owner" as const };
  const member = await getProviderMember(providerId, user.id);
  if (!member || member.status !== "active") throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية الوصول إلى هذا المزود" });
  return { provider, role: member.role };
}

async function requireProviderAction(providerId: number, user: { id: number; role: string }, action: Parameters<typeof canProviderMember>[1]) {
  const access = await providerRole(providerId, user);
  if (!canProviderMember(access.role, action) && user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية تنفيذ هذا الإجراء" });
  }
  return access;
}

export const providersRouter = router({
  mine: protectedProcedure.query(({ ctx }) => listProvidersForUser(ctx.user.id)),

  create: protectedProcedure
    .input(z.object({
      legalName: z.string().trim().min(2).max(180),
      displayName: z.string().trim().min(2).max(180),
      providerType: providerType.default("service"),
      description: z.string().trim().max(5000).optional(),
      phone: z.string().trim().max(40).optional(),
      email: z.string().email().max(320).optional(),
      websiteUrl: z.string().url().max(500).optional(),
      payoutMethod: z.enum(["manual_invoice", "bank_reference", "platform_wallet"]).default("manual_invoice"),
      payoutReference: z.string().trim().max(180).optional(),
      payoutBeneficiaryName: z.string().trim().max(180).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const provider = await createProvider({ ...input, ownerUserId: ctx.user.id, status: "draft" });
      await addProviderAuditEvent({ providerId: provider.id, actorId: ctx.user.id, entityType: "provider", entityId: provider.id, action: "created", summary: "تم إنشاء ملف مزود جديد" });
      return provider;
    }),

  get: protectedProcedure
    .input(z.object({ providerId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => (await providerRole(input.providerId, ctx.user)).provider),

  members: protectedProcedure
    .input(z.object({ providerId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      await requireProviderAction(input.providerId, ctx.user, "manage_members");
      return listProviderMembers(input.providerId);
    }),

  inviteMember: protectedProcedure
    .input(z.object({ providerId: z.number().int().positive(), userId: z.number().int().positive(), role: z.enum(["manager", "editor", "finance_viewer"]).default("editor") }))
    .mutation(async ({ ctx, input }) => {
      await requireProviderAction(input.providerId, ctx.user, "manage_members");
      const member = await upsertProviderMember(input.providerId, input.userId, input.role);
      await addProviderAuditEvent({ providerId: input.providerId, actorId: ctx.user.id, entityType: "member", entityId: member?.id, action: "member_invited", summary: `تمت دعوة المستخدم ${input.userId} بدور ${input.role}` });
      return member;
    }),

  updateMember: protectedProcedure
    .input(z.object({ providerId: z.number().int().positive(), memberId: z.number().int().positive(), role: z.enum(["manager", "editor", "finance_viewer"]).optional(), status: z.enum(["invited", "active", "suspended"]).optional() }))
    .mutation(async ({ ctx, input }) => {
      await requireProviderAction(input.providerId, ctx.user, "manage_members");
      const member = await updateProviderMember(input.memberId, { role: input.role, status: input.status });
      await addProviderAuditEvent({ providerId: input.providerId, actorId: ctx.user.id, entityType: "member", entityId: input.memberId, action: "member_updated", summary: "تم تحديث دور أو حالة عضو المزود" });
      return member;
    }),

  removeMember: protectedProcedure
    .input(z.object({ providerId: z.number().int().positive(), memberId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await requireProviderAction(input.providerId, ctx.user, "manage_members");
      const member = await removeProviderMember(input.memberId);
      await addProviderAuditEvent({ providerId: input.providerId, actorId: ctx.user.id, entityType: "member", entityId: input.memberId, action: "member_suspended", summary: "تم تعليق عضو المزود" });
      return member;
    }),

  uploadLogo: protectedProcedure
    .input(z.object({ providerId: z.number().int().positive(), fileName: z.string().trim().min(1).max(160), contentType: z.enum(["image/png", "image/jpeg", "image/webp"]), dataBase64: z.string().min(100).max(4_000_000) }))
    .mutation(async ({ ctx, input }) => {
      await requireProviderAction(input.providerId, ctx.user, "manage_profile");
      const bytes = Buffer.from(input.dataBase64, "base64");
      if (bytes.length > 2_000_000) throw new TRPCError({ code: "BAD_REQUEST", message: "حجم اللوجو يجب ألا يتجاوز 2MB" });
      const upload = await storagePut(`providers/${input.providerId}/logo-${input.fileName}`, bytes, input.contentType);
      const provider = await updateProvider(input.providerId, { logoUrl: upload.url });
      await addProviderAuditEvent({ providerId: input.providerId, actorId: ctx.user.id, entityType: "provider", entityId: input.providerId, action: "logo_uploaded", summary: "تم تحديث لوجو المزود" });
      return provider;
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      providerId: z.number().int().positive(),
      legalName: z.string().trim().min(2).max(180).optional(),
      displayName: z.string().trim().min(2).max(180).optional(),
      providerType: providerType.optional(),
      description: z.string().trim().max(5000).nullable().optional(),
      logoUrl: z.string().url().max(2000).nullable().optional(),
      phone: z.string().trim().max(40).nullable().optional(),
      email: z.string().email().max(320).nullable().optional(),
      websiteUrl: z.string().url().max(500).nullable().optional(),
      payoutMethod: z.enum(["manual_invoice", "bank_reference", "platform_wallet"]).optional(),
      payoutReference: z.string().trim().max(180).nullable().optional(),
      payoutBeneficiaryName: z.string().trim().max(180).nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { provider } = await requireProviderAction(input.providerId, ctx.user, "manage_profile");
      const { providerId, ...changes } = input;
      const updated = await updateProvider(providerId, changes);
      await addProviderAuditEvent({ providerId, actorId: ctx.user.id, entityType: "provider", entityId: providerId, action: "profile_updated", summary: "تم تحديث ملف المزود وبياناته" });
      return updated;
    }),

  products: protectedProcedure
    .input(z.object({ providerId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      await providerRole(input.providerId, ctx.user);
      return listProviderProducts(input.providerId);
    }),

  createProduct: protectedProcedure
    .input(z.object({
      providerId: z.number().int().positive(),
      name: z.string().trim().min(2).max(180),
      slug: z.string().trim().min(2).max(220),
      description: z.string().trim().max(5000).optional(),
      priceMinor: z.number().int().nonnegative().optional(),
      currency: z.string().length(3).default("SAR"),
      inventoryQuantity: z.number().int().nonnegative().optional(),
      imageUrl: z.string().url().max(2000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireProviderAction(input.providerId, ctx.user, "manage_content");
      const product = await createProviderProduct({ ...input, status: "draft" });
      await addProviderAuditEvent({ providerId: input.providerId, actorId: ctx.user.id, entityType: "product", entityId: product.id, action: "created", summary: "تم إنشاء منتج كمسودة" });
      return product;
    }),

  updateProduct: protectedProcedure
    .input(z.object({
      providerId: z.number().int().positive(),
      productId: z.number().int().positive(),
      name: z.string().trim().min(2).max(180).optional(),
      slug: z.string().trim().min(2).max(220).optional(),
      description: z.string().trim().max(5000).nullable().optional(),
      priceMinor: z.number().int().nonnegative().nullable().optional(),
      inventoryQuantity: z.number().int().nonnegative().nullable().optional(),
      imageUrl: z.string().url().max(2000).nullable().optional(),
      status: productStatus.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireProviderAction(input.providerId, ctx.user, "manage_content");
      const { providerId, productId, ...changes } = input;
      const product = await updateProviderProduct(productId, changes);
      await addProviderAuditEvent({ providerId, actorId: ctx.user.id, entityType: "product", entityId: productId, action: "updated", summary: "تم تحديث منتج المزود" });
      return product;
    }),

  services: protectedProcedure
    .input(z.object({ providerId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      await providerRole(input.providerId, ctx.user);
      return listProviderServices(input.providerId);
    }),

  createService: protectedProcedure
    .input(z.object({
      providerId: z.number().int().positive(),
      name: z.string().trim().min(2).max(180),
      slug: z.string().trim().min(2).max(220),
      description: z.string().trim().max(5000).optional(),
      priceMinor: z.number().int().nonnegative().optional(),
      currency: z.string().length(3).default("SAR"),
      accessibilityNotes: z.string().trim().max(5000).optional(),
      serviceArea: z.string().trim().max(180).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireProviderAction(input.providerId, ctx.user, "manage_content");
      const service = await createProviderService({ ...input, status: "draft" });
      await addProviderAuditEvent({ providerId: input.providerId, actorId: ctx.user.id, entityType: "service", entityId: service.id, action: "created", summary: "تم إنشاء خدمة كمسودة" });
      return service;
    }),

  updateService: protectedProcedure
    .input(z.object({
      providerId: z.number().int().positive(),
      serviceId: z.number().int().positive(),
      name: z.string().trim().min(2).max(180).optional(),
      slug: z.string().trim().min(2).max(220).optional(),
      description: z.string().trim().max(5000).nullable().optional(),
      priceMinor: z.number().int().nonnegative().nullable().optional(),
      accessibilityNotes: z.string().trim().max(5000).nullable().optional(),
      serviceArea: z.string().trim().max(180).nullable().optional(),
      status: serviceStatus.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireProviderAction(input.providerId, ctx.user, "manage_content");
      const { providerId, serviceId, ...changes } = input;
      const service = await updateProviderService(serviceId, changes);
      await addProviderAuditEvent({ providerId, actorId: ctx.user.id, entityType: "service", entityId: serviceId, action: "updated", summary: "تم تحديث خدمة المزود" });
      return service;
    }),

  archiveProduct: protectedProcedure
    .input(z.object({ providerId: z.number().int().positive(), productId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await requireProviderAction(input.providerId, ctx.user, "manage_content");
      const product = await archiveProviderProduct(input.productId);
      await addProviderAuditEvent({ providerId: input.providerId, actorId: ctx.user.id, entityType: "product", entityId: input.productId, action: "archived", summary: "تم أرشفة المنتج" });
      return product;
    }),

  archiveService: protectedProcedure
    .input(z.object({ providerId: z.number().int().positive(), serviceId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await requireProviderAction(input.providerId, ctx.user, "manage_content");
      const service = await archiveProviderService(input.serviceId);
      await addProviderAuditEvent({ providerId: input.providerId, actorId: ctx.user.id, entityType: "service", entityId: input.serviceId, action: "archived", summary: "تم أرشفة الخدمة" });
      return service;
    }),

  publicCatalog: publicProcedure.query(async () => ({
    products: await listPublicProviderProducts(),
    services: await listPublicProviderServices(),
  })),

  adminReviewQueue: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "هذه القائمة للمراجعين الإداريين فقط" });
    return listPendingProviders();
  }),

  adminReview: protectedProcedure
    .input(z.object({ providerId: z.number().int().positive(), decision: z.enum(["approved", "rejected"]), note: z.string().trim().max(2000).optional() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "المراجعة الإدارية تتطلب دور المدير" });
      const provider = await updateProvider(input.providerId, { status: input.decision });
      await addProviderAuditEvent({ providerId: input.providerId, actorId: ctx.user.id, entityType: "provider", entityId: input.providerId, action: `review_${input.decision}`, summary: input.note || `تمت مراجعة الملف: ${input.decision}` });
      return provider;
    }),

  submitForReview: protectedProcedure
    .input(z.object({ providerId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await requireProviderAction(input.providerId, ctx.user, "submit_for_review");
      const provider = await updateProvider(input.providerId, { status: "pending_review" });
      await addProviderAuditEvent({ providerId: input.providerId, actorId: ctx.user.id, entityType: "provider", entityId: input.providerId, action: "submitted_for_review", summary: "تم إرسال ملف المزود للمراجعة" });
      return provider;
    }),
});

export type ProvidersRouter = typeof providersRouter;
