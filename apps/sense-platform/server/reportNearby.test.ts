import { describe, expect, it } from "vitest";
import { filterNearbyReportsForRole, isNearbyRadiusAllowed } from "./reportWorkflow";

describe("nearby report visibility", () => {
  const reports = [
    { id: 1, status: "assigned" as const, assignedToId: 7, latitude: "24.7136", longitude: "46.6753" },
    { id: 2, status: "assigned" as const, assignedToId: 8, latitude: "24.7137", longitude: "46.6754" },
    { id: 3, status: "assigned" as const, assignedToId: 7, latitude: null, longitude: null },
    { id: 4, status: "closed" as const, assignedToId: 7, latitude: "24.7136", longitude: "46.6753" },
  ];

  it("limits field workers to their assigned nearby reports", () => {
    const result = filterNearbyReportsForRole("field", 7, reports, 24.7136, 46.6753, 1);
    expect(result.map((report) => report.id)).toEqual([1]);
  });

  it("keeps the operational status and role filters before distance filtering", () => {
    const result = filterNearbyReportsForRole("admin", 99, reports, 24.7136, 46.6753, 1);
    expect(result.map((report) => report.id)).toEqual([1, 2]);
  });

  it("rejects invalid search radius", () => {
    expect(isNearbyRadiusAllowed(0)).toBe(false);
    expect(isNearbyRadiusAllowed(51)).toBe(false);
    expect(isNearbyRadiusAllowed(5)).toBe(true);
  });
});
