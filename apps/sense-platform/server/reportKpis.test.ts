import { describe, expect, it } from "vitest";
import { calculateReportKpis } from "./reportKpis";
import type { Report, ReportEvent } from "../drizzle/schema";

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
    expect(result.unavailable).toContain("تقييم المستخدم");
  });

  it("returns null P90 and zero rates for an empty dataset", () => {
    const result = calculateReportKpis([], [], new Date("2026-08-15T00:00:00Z"));
    expect(result).toMatchObject({ total: 0, closedReports: 0, assignedRate: 0, evidenceRate: 0, reopenRate: 0, p90ClosureHours: null });
  });
});
