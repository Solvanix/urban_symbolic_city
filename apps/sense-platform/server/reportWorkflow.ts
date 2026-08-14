export type ReportRole = "user" | "citizen" | "staff" | "field" | "supervisor" | "admin";
export type ReportStatus = "draft" | "submitted" | "review" | "needs_info" | "rejected" | "assigned" | "in_progress" | "awaiting_approval" | "closed" | "reopened";

export function canCitizenRateReport(status: string, reporterId: number, citizenId: number) {
  return status === "closed" && reporterId === citizenId;
}

export const evidenceContentTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
export type EvidenceContentType = (typeof evidenceContentTypes)[number];

export function isSupportedEvidenceType(contentType: string): contentType is EvidenceContentType {
  return (evidenceContentTypes as readonly string[]).includes(contentType);
}

export function isEvidenceSizeAllowed(size: number) {
  return Number.isFinite(size) && size > 0 && size <= 6_000_000;
}

const nextByStatus: Record<ReportStatus, readonly ReportStatus[]> = {
  draft: ["submitted"],
  submitted: ["review"],
  review: ["needs_info", "rejected", "assigned", "reopened"],
  needs_info: ["review", "rejected"],
  rejected: ["reopened"],
  assigned: ["in_progress", "reopened"],
  in_progress: ["awaiting_approval", "reopened"],
  awaiting_approval: ["closed", "reopened"],
  closed: ["reopened"],
  reopened: ["review"],
};

const allowedByRole: Record<ReportRole, readonly ReportStatus[]> = {
  user: [],
  citizen: [],
  staff: ["review", "needs_info", "rejected", "assigned", "in_progress", "reopened"],
  field: ["in_progress", "awaiting_approval", "reopened"],
  supervisor: ["assigned", "awaiting_approval", "closed", "reopened"],
  admin: ["review", "needs_info", "rejected", "assigned", "in_progress", "awaiting_approval", "closed", "reopened"],
};

export function canTransitionReport(
  role: ReportRole,
  current: ReportStatus,
  next: ReportStatus,
  assignedToId?: number | null,
  actorId?: number,
) {
  if (current === next || !nextByStatus[current].includes(next)) return false;
  if (!allowedByRole[role].includes(next)) return false;
  if (role === "field" && assignedToId !== actorId) return false;
  if (next === "closed" && !["supervisor", "admin"].includes(role)) return false;
  return true;
}

export function isOperationalRole(role: string): role is Exclude<ReportRole, "user" | "citizen"> {
  return ["staff", "field", "supervisor", "admin"].includes(role);
}

export type QueueReport = { status: ReportStatus; assignedToId?: number | null };

export function filterQueueForRole<T extends QueueReport>(role: string, userId: number, reports: T[]): T[] {
  if (role === "admin") return reports;
  if (role === "field") return reports.filter((report) => report.assignedToId === userId && ["assigned", "in_progress", "reopened", "awaiting_approval"].includes(report.status));
  if (role === "supervisor") return reports.filter((report) => ["assigned", "awaiting_approval", "reopened"].includes(report.status));
  if (role === "staff") return reports.filter((report) => ["submitted", "review", "reopened"].includes(report.status));
  return [];
}
