import { describe, expect, it } from "vitest";
import { calculateReportKpis, filterReportKpiData } from "./reportKpis";
import type { Report, ReportEvent, ReportRating } from "../drizzle/schema";

const report = (overrides: Partial<Report>): Report => ({
  id: 1,
  reporterId: 10,
  assignedToId: null,
  title: "إتاحة",
  description: "وصف كافٍ للبلاغ",
  category: "accessibility",
  status: "submitted",
  priority: "normal",
  latitude: null,
  longitude: null,
  address: null,
  evidenceUrl: null,
  createdAt: new Date("2026-08-14T00:00:00Z"),
  updatedAt: new Date("2026-08-14T00:00:00Z"),
  ...overrides,
});

const event = (overrides: Partial<ReportEvent>): ReportEvent => ({
  id: 1,
  reportId: 1,
  actorId: 20,
  fromStatus: "in_progress",
  toStatus: "closed",
  note: null,
  evidenceUrl: null,
  createdAt: new Date("2026-08-14T10:00:00Z"),
  ...overrides,
});

describe("calculateReportKpis", () => {
  it("calculates closure, assignment, evidence, reopen rates and P90", () => {
    const reports = [
      report({ id: 1, assignedToId: 20, evidenceUrl: "https://evidence/1", status: "closed" }),
      report({ id: 2, assignedToId: 21, status: "reopened" }),
      report({ id: 3, status: "submitted" }),
      report({ id: 4, status: "closed" }),
    ];
    const events = [
      event({ id: 1, reportId: 1, createdAt: new Date("2026-08-14T10:00:00Z") }),
      event({ id: 2, reportId: 4, createdAt: new Date("2026-08-14T20:00:00Z") }),
      event({ id: 3, reportId: 2, toStatus: "reopened", createdAt: new Date("2026-08-14T12:00:00Z") }),
    ];
    const result = calculateReportKpis(reports, events, new Date("2026-08-15T00:00:00Z"));

    expect(result.total).toBe(4);
    expect(result.closedReports).toBe(2);
    expect(result.assignedRate).toBe(50);
    expect(result.evidenceRate).toBe(25);
    expect(result.reopenRate).toBe(25);
    expect(result.p90ClosureHours).toBe(20);
    expect(result.averageUserRating).toBeNull();
    expect(result.unavailable).toContain("حوادث الصلاحيات");
  });

  it("filters KPI data by category and inclusive date range", () => {
    const reports = [
      report({ id: 1, category: "accessibility", createdAt: new Date("2026-08-10T12:00:00Z") }),
      report({ id: 2, category: "road", createdAt: new Date("2026-08-12T12:00:00Z") }),
      report({ id: 3, category: "accessibility", createdAt: new Date("2026-08-20T12:00:00Z") }),
    ];
    const events = [event({ id: 1, reportId: 1 }), event({ id: 2, reportId: 2 })];
    const filtered = filterReportKpiData(reports, events, { category: "accessibility", startAt: new Date("2026-08-09T00:00:00Z").getTime(), endAt: new Date("2026-08-15T23:59:59Z").getTime() });
    expect(filtered.reports.map(item => item.id)).toEqual([1]);
    expect(filtered.events.map(item => item.reportId)).toEqual([1]);
  });

  it("calculates the average citizen rating only for selected reports", () => {
    const ratings: ReportRating[] = [
      { id: 1, reportId: 1, citizenId: 10, rating: 5, comment: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, reportId: 2, citizenId: 11, rating: 3, comment: null, createdAt: new Date(), updatedAt: new Date() },
    ];
    const result = calculateReportKpis([report({ id: 1 }), report({ id: 2 })], [], new Date("2026-08-15T00:00:00Z"), ratings);
    expect(result.averageUserRating).toBe(4);
  });

  it("returns null P90 and zero rates for an empty dataset", () => {
    const result = calculateReportKpis([], [], new Date("2026-08-15T00:00:00Z"));
    expect(result).toMatchObject({ total: 0, closedReports: 0, assignedRate: 0, evidenceRate: 0, reopenRate: 0, p90ClosureHours: null });
  });
});
