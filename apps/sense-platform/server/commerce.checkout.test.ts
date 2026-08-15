import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const { createInternalOrderFromCart } = vi.hoisted(() => ({ createInternalOrderFromCart: vi.fn() }));
vi.mock("./db", () => ({ createInternalOrderFromCart }));

import { commerceRouter } from "./routers/commerce";

function makeCtx(userId: number): TrpcContext {
  return { user: { id: userId, openId: `user-${userId}`, name: "اختبار", email: null, role: "citizen", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as never, res: {} as never };
}

describe("internal commerce checkout", () => {
  it("creates a pending internal order for the authenticated user", async () => {
    createInternalOrderFromCart.mockResolvedValue({ id: 4, orderNumber: "SENSE-TEST-4" });
    const caller = commerceRouter.createCaller(makeCtx(7));
    const result = await caller.checkout.createOrder({ cartId: "sense-cart:abc", shippingName: "اختبار", shippingPhone: "0500000000", shippingAddress: "عنوان تسليم صالح" });
    expect(result.orderNumber).toBe("SENSE-TEST-4");
    expect(createInternalOrderFromCart).toHaveBeenCalledWith(expect.objectContaining({ userId: 7, cartId: "sense-cart:abc" }));
  });

  it("rejects an empty or unavailable internal cart", async () => {
    createInternalOrderFromCart.mockResolvedValue(null);
    const caller = commerceRouter.createCaller(makeCtx(7));
    await expect(caller.checkout.createOrder({ cartId: "sense-cart:missing", shippingName: "اختبار", shippingPhone: "0500000000", shippingAddress: "عنوان تسليم صالح" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
