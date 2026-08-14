import { z } from "zod";
import { listNotificationsForUser, markAllNotificationsRead, markNotificationRead } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

export function notificationBelongsToUser(notificationUserId: number, requesterId: number) {
  return notificationUserId === requesterId;
}

export const notificationsRouter = router({
  mine: protectedProcedure.query(({ ctx }) => listNotificationsForUser(ctx.user.id)),

  markRead: protectedProcedure
    .input(z.object({ notificationId: z.number().int().positive() }))
    .mutation(({ ctx, input }) => markNotificationRead(ctx.user.id, input.notificationId)),

  markAllRead: protectedProcedure.mutation(({ ctx }) => markAllNotificationsRead(ctx.user.id)),
});
