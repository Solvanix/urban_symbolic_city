/**
 * Commerce router — backend-agnostic tRPC surface for the storefront.
 *
 * The router is intentionally thin: zod validates input, then delegates to the
 * named functions exported from `server/_core/shopify`. If we ever swap
 * commerce backends, only `_core/shopify.ts` + `_core/shopifyNormalize.ts`
 * change — this router stays put.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { addInternalCartLine, createInternalCart, createInternalOrderFromCart, getInternalCart, getInternalOrderForUser, getPublishedCommerceCatalogItemBySlug, listInternalOrdersForAdmin, listInternalOrdersForUser, listPublishedCommerceCatalog, removeInternalCartLine, updateInternalCartLine, updateInternalCatalogInventory, updateInternalOrderStatus } from "../db";

const cartLineInputSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

const cartLineUpdateSchema = z.object({
  lineId: z.string().min(1),
  /** 0 means "remove this line" — the route forwards to removeLines. */
  quantity: z.number().int().min(0).max(99),
});

function toInternalStorefrontProduct(item: Awaited<ReturnType<typeof getPublishedCommerceCatalogItemBySlug>>) {
  if (!item) return null;
  const price = (item.priceMinor / 100).toFixed(2);
  const variantId = `sense-variant:${item.id}`;
  return {
    id: `sense-product:${item.id}`,
    handle: item.slug,
    title: item.name,
    description: item.description ?? "",
    productType: item.sourceType === "service" ? "خدمة" : "منتج",
    tags: [] as string[],
    priceRange: { min: { amount: price, currencyCode: item.currency }, max: { amount: price, currencyCode: item.currency } },
    variants: [{ id: variantId, availableForSale: item.inventoryQuantity === null || item.inventoryQuantity > 0, price: { amount: price, currencyCode: item.currency } }],
    images: item.imageUrl ? [{ url: item.imageUrl, altText: item.name }] : [],
  };
}

export const commerceRouter = router({
  products: router({
    list: publicProcedure
      .input(
        z
          .object({
            first: z.number().int().min(1).max(100).optional(),
            collectionHandle: z.string().min(1).optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const items = await listPublishedCommerceCatalog({ limit: input?.first });
        return items.map((item) => toInternalStorefrontProduct(item)).filter((product): product is NonNullable<typeof product> => product !== null);
      }),
    byHandle: publicProcedure
      .input(z.object({ handle: z.string().min(1) }))
      .query(async ({ input }) => {
        const internal = toInternalStorefrontProduct(await getPublishedCommerceCatalogItemBySlug(input.handle));
        return internal;
      }),
  }),
  collections: router({
    list: publicProcedure
      .input(z.object({ first: z.number().int().min(1).max(50).optional() }).optional())
      .query(async ({ input }) => {
        return [];
      }),
    byHandle: publicProcedure
      .input(z.object({ handle: z.string().min(1) }))
      .query(async ({ input }) => {
        return null;
      }),
  }),
  checkout: router({
    createOrder: protectedProcedure
      .input(z.object({ cartId: z.string().startsWith("sense-cart:"), shippingName: z.string().trim().min(2).max(180), shippingPhone: z.string().trim().min(7).max(40), shippingAddress: z.string().trim().min(8).max(1000) }))
      .mutation(async ({ ctx, input }) => {
        const order = await createInternalOrderFromCart({ ...input, userId: ctx.user.id });
        if (!order) throw new TRPCError({ code: "BAD_REQUEST", message: "السلة فارغة أو لم تعد متاحة." });
        return order;
      }),
    mine: protectedProcedure.query(({ ctx }) => listInternalOrdersForUser(ctx.user.id)),
    byId: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ ctx, input }) => getInternalOrderForUser(ctx.user.id, input.id)),
    adminHandoffs: adminProcedure.query(() => listInternalOrdersForAdmin()),
    updateInventory: adminProcedure
      .input(z.object({ catalogItemId: z.number().int().positive(), inventoryQuantity: z.number().int().nonnegative().nullable() }))
      .mutation(async ({ input }) => {
        const item = await updateInternalCatalogInventory(input);
        if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "عنصر الكتالوج غير موجود" });
        return { item, availableForSale: item.inventoryQuantity === null || item.inventoryQuantity > 0 };
      }),
    receiveStatusEvent: adminProcedure
      .input(z.object({
        orderId: z.number().int().positive(),
        status: z.enum(["pending_payment", "paid", "processing", "shipped", "delivered", "cancelled", "refunded", "requires_review"]),
        paymentStatus: z.enum(["pending", "authorized", "paid", "failed", "refunded"]).optional(),
        fulfillmentStatus: z.enum(["unfulfilled", "partial", "fulfilled", "cancelled"]).optional(),
        externalPaymentReference: z.string().trim().max(255).nullable().optional(),
        externalShipmentReference: z.string().trim().max(255).nullable().optional(),
        externalEventId: z.string().trim().min(1).max(255),
        provider: z.enum(["payment", "logistics", "store_sync", "software_partner"]),
        eventType: z.string().trim().min(1).max(100),
        payloadHash: z.string().trim().min(1).max(128),
      }))
      .mutation(async ({ input }) => {
        const result = await updateInternalOrderStatus(input);
        if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود" });
        return result;
      }),
  }),
  cart: router({
    create: publicProcedure
      .input(z.object({ lines: z.array(cartLineInputSchema).min(1).max(50) }))
      .mutation(async ({ input }) => {
        const [first, ...rest] = input.lines;
        let cart = await createInternalCart(first.variantId, first.quantity);
        for (const line of rest) cart = cart ? await addInternalCartLine(cart.id, line.variantId, line.quantity) : null;
        if (!cart) throw new TRPCError({ code: "BAD_REQUEST", message: "تعذر إنشاء السلة من الكتالوج الداخلي." });
        return cart;
      }),
    get: publicProcedure
      .input(z.object({ cartId: z.string().min(1) }))
      .query(async ({ input }) => {
        return getInternalCart(input.cartId);
      }),
    addLines: publicProcedure
      .input(
        z.object({
          cartId: z.string().min(1),
          lines: z.array(cartLineInputSchema).min(1).max(50),
        })
      )
      .mutation(async ({ input }) => {
        let cart = await getInternalCart(input.cartId);
        for (const line of input.lines) cart = cart ? await addInternalCartLine(input.cartId, line.variantId, line.quantity) : null;
        if (!cart) throw new TRPCError({ code: "BAD_REQUEST", message: "السلة أو المنتج غير متاح." });
        return cart;
      }),
    updateLines: publicProcedure
      .input(
        z.object({
          cartId: z.string().min(1),
          lines: z.array(cartLineUpdateSchema).min(1).max(50),
        })
      )
      .mutation(async ({ input }) => {
        // qty 0 means "remove this line" — split the request so the client
        // never has to call two procedures for a single user gesture.
        const toRemove = input.lines.filter(l => l.quantity === 0).map(l => l.lineId);
        const toUpdate = input.lines.filter(l => l.quantity > 0);

        let cart = await getInternalCart(input.cartId);
        for (const line of toUpdate) cart = cart ? await updateInternalCartLine(input.cartId, line.lineId, line.quantity) : null;
        for (const lineId of toRemove) cart = cart ? await removeInternalCartLine(input.cartId, lineId) : null;
        if (!cart) throw new TRPCError({ code: "BAD_REQUEST", message: "تعذر تحديث السلة الداخلية." });
        return cart;
      }),
    removeLines: publicProcedure
      .input(
        z.object({
          cartId: z.string().min(1),
          lineIds: z.array(z.string().min(1)).min(1).max(50),
        })
      )
      .mutation(async ({ input }) => {
        let cart = await getInternalCart(input.cartId);
        for (const lineId of input.lineIds) cart = cart ? await removeInternalCartLine(input.cartId, lineId) : null;
        if (!cart) throw new TRPCError({ code: "BAD_REQUEST", message: "تعذر حذف عناصر السلة الداخلية." });
        return cart;
      }),
  }),
});

export type CommerceRouter = typeof commerceRouter;
