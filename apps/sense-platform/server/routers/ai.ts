import { z } from "zod";
import { classifyReportDescription } from "../aiAssistant";
import { protectedProcedure, router } from "../_core/trpc";

export const aiRouter = router({
  classifyReport: protectedProcedure
    .input(z.object({ description: z.string().trim().min(10).max(5000) }))
    .mutation(({ input }) => classifyReportDescription(input.description)),
});

export type AiRouter = typeof aiRouter;
