import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const { createCheckoutHandoff, createNotification, listCheckoutHandoffsForUser } = vi.hoisted(() => ({
  createCheckoutHandoff: vi.fn(),
  createNotification: vi.fn(),
  listCheckoutHandoffsForUser: vi.fn(),
}));

vi.mock("./db", () => ({ createCheckoutHandoff, createNotification, listCheckoutHandoffsForUser }));
vi.mock("./_core/shopify", () => ({
  addCartLines: vi.fn(), createCart: vi.fn(), getCart: vi.fn(), getCollectionByHandle: vi.fn(), getProductByHandle: vi.fn(), listCollections: vi.fn(), listProducts: vi.fn(), removeCartLines: vi.fn(), updateCartLines: vi.fn(),
}));

import { commerceRouter } from "./routers/commerce";

function makeCtx(userId: number): TrpcContext {
  return { user: { id: userId, openId: `user-${userId}`, name: "اختبار", email: null, role: "citizen", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as never, res: {} as never };
}

describe("commerce checkout handoff", () => {
  it("records a handoff and notification for the authenticated user only", async () => {
    createCheckoutHandoff.mockResolvedValue({ id: 4, userId: 7, checkoutId: "cart-7", checkoutUrl: "https://shop.example/checkout", status: "handed_off" });
    const caller = commerceRouter.createCaller(makeCtx(7));
    const result = await caller.checkout.recordHandoff({ checkoutId: "cart-7", checkoutUrl: "https://shop.example/checkout" });
    expect(result?.userId).toBe(7);
    expect(createCheckoutHandoff).toHaveBeenCalledWith(expect.objectContaining({ userId: 7, checkoutId: "cart-7" }));
    expect(createNotification).toHaveBeenCalledWith(expect.objectContaining({ userId: 7, kind: "order", sourceId: 4 }));
    expect(createCheckoutHandoff).not.toHaveBeenCalledWith(expect.objectContaining({ userId: 8 }));
  });
});
