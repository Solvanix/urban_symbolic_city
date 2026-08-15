import { describe, expect, it } from "vitest";
import { buildKpiInput, isValidKpiDateRange } from "./roleDashboardFilters";

describe("role dashboard KPI filters", () => {
  it("rejects a reversed date range before querying", () => {
    expect(isValidKpiDateRange("2026-08-20", "2026-08-19")).toBe(false);
    expect(isValidKpiDateRange("2026-08-19", "2026-08-20")).toBe(true);
  });

  it("builds stable numeric date bounds and omits empty category", () => {
    const input = buildKpiInput("2026-08-19", "2026-08-20", "");
    expect(input.startAt).toBe(new Date("2026-08-19T00:00:00").getTime());
    expect(input.endAt).toBe(new Date("2026-08-20T23:59:59.999").getTime());
    expect(input.category).toBeUndefined();
  });
});
