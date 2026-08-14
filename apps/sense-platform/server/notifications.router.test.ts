import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const { listNotificationsForUser, markNotificationRead, markAllNotificationsRead } = vi.hoisted(() => ({
  listNotificationsForUser: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
}));

vi.mock("./db", () => ({
  listNotificationsForUser,
  markNotificationRead,
  markAllNotificationsRead,
}));

import { notificationsRouter } from "./routers/notifications";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function makeCtx(userId: number): TrpcContext {
  return {
    user: { id: userId, openId: `user-${userId}`, role: "citizen", name: `User ${userId}`, email: null, loginMethod: null, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() } as AuthenticatedUser,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("notifications privacy", () => {
  beforeEach(() => {
    listNotificationsForUser.mockReset();
    markNotificationRead.mockReset();
    markAllNotificationsRead.mockReset();
  });

  it("passes the authenticated user id to mine and never broadens the query", async () => {
    listNotificationsForUser.mockResolvedValue([{ id: 1, userId: 7, title: "خاص" }]);
    const caller = notificationsRouter.createCaller(makeCtx(7));

    const result = await caller.mine();

    expect(result).toEqual([{ id: 1, userId: 7, title: "خاص" }]);
    expect(listNotificationsForUser).toHaveBeenCalledWith(7);
    expect(listNotificationsForUser).not.toHaveBeenCalledWith(8);
  });

  it("marks only an item through the authenticated user scope", async () => {
    markNotificationRead.mockResolvedValue({ id: 4, userId: 7, readAt: new Date() });
    const caller = notificationsRouter.createCaller(makeCtx(7));

    await caller.markRead({ notificationId: 4 });

    expect(markNotificationRead).toHaveBeenCalledWith(7, 4);
    expect(markNotificationRead).not.toHaveBeenCalledWith(8, 4);
  });
});
