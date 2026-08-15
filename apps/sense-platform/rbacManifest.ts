export type RbacRequirement = "public" | "authenticated" | "role_or_ownership";

export type RbacManifestEntry = {
  procedure: string;
  requirement: RbacRequirement;
  roles?: readonly string[];
  ownership?: string;
};

/** Documentation contract for sensitive procedures. Runtime guards remain in each router. */
export const rbacManifest = [
  { procedure: "reports.create", requirement: "authenticated", ownership: "ctx.user.id is reporterId" },
  { procedure: "reports.mine", requirement: "authenticated", ownership: "ctx.user.id scopes reporterId" },
  { procedure: "reports.rating", requirement: "authenticated", ownership: "reporterId and closed status" },
  { procedure: "reports.rate", requirement: "authenticated", ownership: "reporterId and closed status" },
  { procedure: "reports.queue", requirement: "role_or_ownership", roles: ["staff", "field", "supervisor", "admin"] },
  { procedure: "reports.nearby", requirement: "role_or_ownership", roles: ["staff", "field", "supervisor", "admin"] },
  { procedure: "reports.kpis", requirement: "role_or_ownership", roles: ["supervisor", "admin"] },
  { procedure: "reports.byId", requirement: "role_or_ownership", roles: ["staff", "field", "supervisor", "admin"], ownership: "reporterId or assignedToId for non-operational users" },
  { procedure: "reports.uploadEvidence", requirement: "role_or_ownership", roles: ["field", "supervisor", "admin"], ownership: "field role must match assignedToId" },
  { procedure: "reports.transition", requirement: "role_or_ownership", roles: ["staff", "field", "supervisor", "admin"], ownership: "transition policy and assignment" },
  { procedure: "commerce.checkout.recordHandoff", requirement: "authenticated", ownership: "ctx.user.id" },
  { procedure: "commerce.checkout.mine", requirement: "authenticated", ownership: "ctx.user.id" },
  { procedure: "notifications.mine", requirement: "authenticated", ownership: "ctx.user.id" },
  { procedure: "notifications.markRead", requirement: "authenticated", ownership: "notification.userId" },
  { procedure: "notifications.markAllRead", requirement: "authenticated", ownership: "ctx.user.id" },
  { procedure: "ai.classifyReport", requirement: "authenticated", ownership: "sanitized user-submitted text" },
  { procedure: "providers.mine", requirement: "authenticated", ownership: "provider membership" },
  { procedure: "providers.create", requirement: "authenticated", ownership: "creator becomes owner" },
  { procedure: "providers.get", requirement: "authenticated", ownership: "provider membership or admin review" },
  { procedure: "providers.adminReviewQueue", requirement: "role_or_ownership", roles: ["admin"] },
  { procedure: "providers.adminReview", requirement: "role_or_ownership", roles: ["admin"] },
] as const satisfies readonly RbacManifestEntry[];

export const rbacManifestProcedureNames = rbacManifest.map(entry => entry.procedure);
