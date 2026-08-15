import { z } from "zod";

export const integrationProviderSchema = z.enum(["payment", "logistics", "store_sync", "software_partner"]);
export type IntegrationProvider = z.infer<typeof integrationProviderSchema>;

export const commerceIntegrationEnvelopeSchema = z.object({
  provider: integrationProviderSchema,
  eventType: z.string().min(1).max(100),
  externalEventId: z.string().min(1).max(255),
  orderNumber: z.string().min(1).max(40).optional(),
  occurredAt: z.coerce.date(),
  payloadHash: z.string().min(16).max(128),
  signature: z.string().min(1),
  schemaVersion: z.string().min(1).max(30),
});
export type CommerceIntegrationEnvelope = z.infer<typeof commerceIntegrationEnvelopeSchema>;

export const paymentEventSchema = z.object({
  provider: z.literal("payment"),
  eventType: z.enum(["payment.authorized", "payment.paid", "payment.failed", "payment.refunded"]),
  externalEventId: z.string().min(1),
  orderNumber: z.string().min(1),
  occurredAt: z.coerce.date(),
  payloadHash: z.string().min(16).max(128),
  signature: z.string().min(1),
  schemaVersion: z.string().min(1),
  amountMinor: z.number().int().nonnegative(),
  currency: z.string().length(3).transform((value) => value.toUpperCase()),
  externalPaymentReference: z.string().min(1).max(255),
});
export type PaymentEvent = z.infer<typeof paymentEventSchema>;

export const logisticsEventSchema = z.object({
  provider: z.literal("logistics"),
  eventType: z.enum(["shipment.created", "shipment.picked_up", "shipment.in_transit", "shipment.delivered", "shipment.failed"]),
  externalEventId: z.string().min(1),
  orderNumber: z.string().min(1),
  occurredAt: z.coerce.date(),
  payloadHash: z.string().min(16).max(128),
  signature: z.string().min(1),
  schemaVersion: z.string().min(1),
  externalShipmentReference: z.string().min(1).max(255),
  trackingUrl: z.string().url().optional(),
});
export type LogisticsEvent = z.infer<typeof logisticsEventSchema>;

export type InternalOrderState = {
  status: "pending_payment" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" | "requires_review";
  paymentStatus: "pending" | "authorized" | "paid" | "failed" | "refunded";
  fulfillmentStatus: "unfulfilled" | "partial" | "fulfilled" | "cancelled";
  totalMinor: number;
  currency: string;
};

/**
 * Deterministic guard used by adapters before a verified event reaches the DB.
 * It never marks an order paid from a browser redirect or an unverified payload.
 */
export function applyVerifiedPaymentEvent(order: InternalOrderState, event: PaymentEvent): InternalOrderState {
  if (event.amountMinor !== order.totalMinor || event.currency !== order.currency.toUpperCase()) {
    return { ...order, status: "requires_review" };
  }
  if (event.eventType === "payment.authorized") return { ...order, paymentStatus: "authorized" };
  if (event.eventType === "payment.paid") return { ...order, status: "paid", paymentStatus: "paid" };
  if (event.eventType === "payment.failed") return { ...order, status: "requires_review", paymentStatus: "failed" };
  return { ...order, status: "refunded", paymentStatus: "refunded" };
}

export function applyVerifiedLogisticsEvent(order: InternalOrderState, event: LogisticsEvent): InternalOrderState {
  if (event.eventType === "shipment.delivered") return { ...order, status: "delivered", fulfillmentStatus: "fulfilled" };
  if (event.eventType === "shipment.failed") return { ...order, status: "requires_review" };
  if (event.eventType === "shipment.in_transit" || event.eventType === "shipment.picked_up") {
    return { ...order, status: "shipped", fulfillmentStatus: "partial" };
  }
  return { ...order, status: "processing" };
}
