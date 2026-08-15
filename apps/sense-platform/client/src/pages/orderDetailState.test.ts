import { describe, expect, it } from "vitest";
import { parseOrderId } from "./orderDetailState";

describe("parseOrderId", () => {
  it("accepts positive integer identifiers", () => {
    expect(parseOrderId("17")).toBe(17);
  });

  it("rejects malformed, fractional, and non-positive identifiers", () => {
    expect(parseOrderId(undefined)).toBeNull();
    expect(parseOrderId("abc")).toBeNull();
    expect(parseOrderId("1.5")).toBeNull();
    expect(parseOrderId("0")).toBeNull();
  });
});
