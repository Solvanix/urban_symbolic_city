import type { Report, ReportEvent, ReportRating } from "../drizzle/schema";

export type ReportKpiFilter = {
  startAt?: number;
  endAt?: number;
  category?: string;
};

export type ReportKpiSnapshot = {
  total: number;
  newReports: number;
  closedReports: number;
  assignedRate: number;
  evidenceRate: number;
  reopenRate: number;
  p90ClosureHours: number | null;
  averageUserRating: number | null;
  unavailable: string[];
};

export function filterReportKpiData(reports: Report[], events: ReportEvent[], filter: ReportKpiFilter = {}, ratings: ReportRating[] = []) {
  const filteredReports = reports.filter(report => {
    const createdAt = new Date(report.createdAt).getTime();
    if (filter.startAt !== undefined && createdAt < filter.startAt) return false;
    if (filter.endAt !== undefined && createdAt > filter.endAt) return false;
    if (filter.category && report.category !== filter.category) return false;
    return true;
  });
  const ids = new Set(filteredReports.map(report => report.id));
  return { reports: filteredReports, events: events.filter(event => ids.has(event.reportId)), ratings: ratings.filter(rating => ids.has(rating.reportId)) };
}

function percentile90(values: number[]) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.9) - 1);
  return sorted[index] ?? null;
}

export function calculateReportKpis(reports: Report[], events: ReportEvent[], now = new Date(), ratings: ReportRating[] = []): ReportKpiSnapshot {
  const closedEvents = new Map<number, ReportEvent>();
  for (const event of events) {
    if (event.toStatus === "closed" && !closedEvents.has(event.reportId)) closedEvents.set(event.reportId, event);
  }
  const closureHours = reports.flatMap((report) => {
    const event = closedEvents.get(report.id);
    if (!event) return [];
    const hours = (new Date(event.createdAt).getTime() - new Date(report.createdAt).getTime()) / 3_600_000;
    return Number.isFinite(hours) && hours >= 0 ? [hours] : [];
  });
  const total = reports.length;
  const closedReports = reports.filter((report) => report.status === "closed" || closedEvents.has(report.id)).length;
  const assigned = reports.filter((report) => report.assignedToId !== null).length;
  const withEvidence = reports.filter((report) => Boolean(report.evidenceUrl)).length;
  const reopened = reports.filter((report) => report.status === "reopened" || events.some((event) => event.reportId === report.id && event.toStatus === "reopened")).length;
  const selectedRatings = ratings.filter((rating) => reports.some((report) => report.id === rating.reportId));
  const averageUserRating = selectedRatings.length === 0 ? null : Math.round((selectedRatings.reduce((sum, rating) => sum + rating.rating, 0) / selectedRatings.length) * 10) / 10;
  const recentCutoff = now.getTime() - 24 * 3_600_000;
  const newReports = reports.filter((report) => new Date(report.createdAt).getTime() >= recentCutoff).length;
  const rate = (value: number) => total === 0 ? 0 : Math.round((value / total) * 1000) / 10;
  return {
    total,
    newReports,
    closedReports,
    assignedRate: rate(assigned),
    evidenceRate: rate(withEvidence),
    reopenRate: rate(reopened),
    p90ClosureHours: percentile90(closureHours) === null ? null : Math.round((percentile90(closureHours) as number) * 10) / 10,
    averageUserRating,
    unavailable: ["نسبة الإسناد الخاطئ", "حوادث الصلاحيات"],
  };
}
