import { describe, expect, it } from "vitest";
import { filterQueueForRole } from "./reportWorkflow";

describe("report queue policy", () => {
  const reports = [
    { id: 1, status: "submitted" as const, assignedToId: null },
    { id: 2, status: "assigned" as const, assignedToId: 7 },
    { id: 3, status: "in_progress" as const, assignedToId: 8 },
    { id: 4, status: "awaiting_approval" as const, assignedToId: 7 },
    { id: 5, status: "closed" as const, assignedToId: 7 },
  ];

  it("shows only assigned work to the field user", () => {
    expect(filterQueueForRole("field", 7, reports).map((report) => report.id)).toEqual([2, 4]);
  });

  it("keeps review work for staff and approval work for supervisors", () => {
    expect(filterQueueForRole("staff", 7, reports).map((report) => report.id)).toEqual([1]);
    expect(filterQueueForRole("supervisor", 7, reports).map((report) => report.id)).toEqual([2, 4]);
  });

  it("allows admin to see the operational set without narrowing it", () => {
    expect(filterQueueForRole("admin", 99, reports)).toEqual(reports);
  });
});
