import { z } from "zod";
import { assistOperationsReport, assistTripPlanning, classifyReportDescription } from "../aiAssistant";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";

export const aiRouter = router({
  classifyReport: protectedProcedure
    .input(z.object({ description: z.string().trim().min(10).max(5000) }))
    .mutation(({ input }) => classifyReportDescription(input.description)),
  assistOperations: protectedProcedure
    .input(z.object({ title: z.string().trim().min(1).max(180), description: z.string().trim().min(1).max(5000), category: z.string().trim().min(1).max(80), status: z.string().trim().min(1).max(50) }))
    .mutation(({ ctx, input }) => {
      if (!["staff", "field", "supervisor", "admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
      return assistOperationsReport(input);
    }),
  assistTripPlanning: protectedProcedure
    .input(z.object({ accessNeeds: z.array(z.string().trim().min(1).max(80)).max(10), stops: z.array(z.object({ id: z.string().trim().min(1).max(80), name: z.string().trim().min(1).max(120), summary: z.string().trim().min(1).max(300), verificationNote: z.string().trim().min(1).max(300) })).min(1).max(12) }))
    .mutation(({ input }) => assistTripPlanning(input)),
});

export type AiRouter = typeof aiRouter;
