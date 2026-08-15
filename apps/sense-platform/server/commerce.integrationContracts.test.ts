import { describe, expect, it } from "vitest";
import { applyVerifiedLogisticsEvent, applyVerifiedPaymentEvent, logisticsEventSchema, paymentEventSchema, type InternalOrderState } from "./commerce/integrationContracts";

const order: InternalOrderState = {
  status: "pending_payment",
  paymentStatus: "pending",
  fulfillmentStatus: "unfulfilled",
  totalMinor: 12500,
  currency: "SAR",
};

const paymentBase = {
  provider: "payment" as const,
  externalEventId: "evt-payment-1",
  orderNumber: "SENSE-1001",
  occurredAt: new Date("2026-08-15T00:00:00Z"),
  payloadHash: "1234567890abcdef",
  signature: "verified-by-adapter",
  schemaVersion: "v1",
  amountMinor: 12500,
  currency: "sar",
  externalPaymentReference: "pay-1",
};

describe("internal commerce integration contracts", () => {
  it("normalizes currency and accepts a valid payment event", () => {
    const event = paymentEventSchema.parse({ ...paymentBase, eventType: "payment.paid" });
    expect(event.currency).toBe("SAR");
    expect(applyVerifiedPaymentEvent(order, event)).toMatchObject({ status: "paid", paymentStatus: "paid" });
  });

  it("moves mismatched amount to manual review", () => {
    const event = paymentEventSchema.parse({ ...paymentBase, eventType: "payment.paid", amountMinor: 1 });
    expect(applyVerifiedPaymentEvent(order, event).status).toBe("requires_review");
  });

  it("does not treat a failed payment as a paid order", () => {
    const event = paymentEventSchema.parse({ ...paymentBase, eventType: "payment.failed" });
    expect(applyVerifiedPaymentEvent(order, event)).toMatchObject({ status: "requires_review", paymentStatus: "failed" });
  });

  it("maps verified logistics progression to internal fulfillment states", () => {
    const event = logisticsEventSchema.parse({
      provider: "logistics",
      eventType: "shipment.delivered",
      externalEventId: "evt-shipment-1",
      orderNumber: "SENSE-1001",
      occurredAt: new Date("2026-08-15T00:00:00Z"),
      payloadHash: "abcdef1234567890",
      signature: "verified-by-adapter",
      schemaVersion: "v1",
      externalShipmentReference: "ship-1",
    });
    expect(applyVerifiedLogisticsEvent({ ...order, status: "shipped" }, event)).toMatchObject({ status: "delivered", fulfillmentStatus: "fulfilled" });
  });
});
