import { describe, expect, it } from "vitest";
import { canProviderMember } from "./providerAccess";
import { canTransitionReport, filterQueueForRole } from "./reportWorkflow";

describe("SENSE RBAC policy", () => {
  it("keeps citizen and field access scoped to their permitted report actions", () => {
    expect(canTransitionReport("citizen", "submitted", "review", null, 10)).toBe(false);
    expect(canTransitionReport("field", "assigned", "in_progress", 20, 20)).toBe(true);
    expect(canTransitionReport("field", "assigned", "in_progress", 21, 20)).toBe(false);
    expect(canTransitionReport("field", "awaiting_approval", "closed", 20, 20)).toBe(false);
  });

  it("filters operational queues by role rather than client-selected role", () => {
    const reports = [
      { status: "submitted" as const, assignedToId: null, id: 1 },
      { status: "assigned" as const, assignedToId: 20, id: 2 },
      { status: "awaiting_approval" as const, assignedToId: 20, id: 3 },
    ];
    expect(filterQueueForRole("staff", 10, reports).map(report => report.id)).toEqual([1]);
    expect(filterQueueForRole("field", 20, reports).map(report => report.id)).toEqual([2, 3]);
    expect(filterQueueForRole("field", 21, reports)).toEqual([]);
  });

  it("separates provider finance access from content editing", () => {
    expect(canProviderMember("editor", "manage_content")).toBe(true);
    expect(canProviderMember("editor", "view_payouts")).toBe(false);
    expect(canProviderMember("finance_viewer", "view_payouts")).toBe(true);
    expect(canProviderMember("finance_viewer", "manage_content")).toBe(false);
  });
});
