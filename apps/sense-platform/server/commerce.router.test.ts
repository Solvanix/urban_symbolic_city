import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;
function makeCtx(user: AuthenticatedUser | null = null): TrpcContext {
  return { user, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"] };
}

describe("internal commerce", () => {
  it("returns the internal catalog contract without Shopify GraphQL edges", async () => {
    const products = await appRouter.createCaller(makeCtx()).commerce.products.list();
    expect(Array.isArray(products)).toBe(true);
    for (const product of products) {
      expect(product.id).toMatch(/^sense-product:/);
      expect(product.variants[0]?.id).toMatch(/^sense-variant:/);
      expect(JSON.stringify(product)).not.toContain("gid://shopify");
    }
  });

  it("does not resolve a missing internal handle", async () => {
    await expect(appRouter.createCaller(makeCtx()).commerce.products.byHandle({ handle: "missing-sense-product" })).resolves.toBeNull();
  });

  it("rejects external merchandise identifiers for internal cart creation", async () => {
    await expect(appRouter.createCaller(makeCtx()).commerce.cart.create({ lines: [{ variantId: "gid://shopify/ProductVariant/1", quantity: 1 }] })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("requires authentication before creating an internal order", async () => {
    await expect(appRouter.createCaller(makeCtx()).commerce.checkout.createOrder({ cartId: "sense-cart:missing", shippingName: "اسم صحيح", shippingPhone: "0500000000", shippingAddress: "عنوان تسليم صالح" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
