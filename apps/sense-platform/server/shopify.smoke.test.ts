import { describe, expect, it } from "vitest";

/**
 * Shopify is intentionally outside the approved SENSE commerce architecture.
 * The internal catalog and checkout are covered by commerce.router.test.ts,
 * commerce.checkout.test.ts, and commerce.integrationContracts.test.ts.
 *
 * This placeholder remains so historical references are explicit rather than
 * silently removed; it must not call an external store or require credentials.
 */
describe("legacy Shopify smoke", () => {
  it.skip("superseded by the SENSE internal catalog and checkout", () => {
    expect(true).toBe(true);
  });
});

it("documents the active commerce source of truth", () => {
  expect("SENSE internal catalog").toBe("SENSE internal catalog");
});
