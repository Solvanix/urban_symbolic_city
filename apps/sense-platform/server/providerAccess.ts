export const providerMemberRoles = ["owner", "manager", "editor", "finance_viewer"] as const;
export type ProviderMemberRole = (typeof providerMemberRoles)[number];

export type ProviderAction =
  | "manage_profile"
  | "manage_members"
  | "manage_content"
  | "submit_for_review"
  | "view_payouts";

const actionRoles: Record<ProviderAction, readonly ProviderMemberRole[]> = {
  manage_profile: ["owner", "manager"],
  manage_members: ["owner", "manager"],
  manage_content: ["owner", "manager", "editor"],
  submit_for_review: ["owner", "manager", "editor"],
  view_payouts: ["owner", "manager", "finance_viewer"],
};

export function canProviderMember(role: string, action: ProviderAction) {
  return (actionRoles[action] as readonly string[]).includes(role);
}

export function canPublishProviderContent(providerStatus: string, contentStatus: string) {
  return providerStatus === "approved" && ["pending_review", "published", "paused"].includes(contentStatus);
}

export function shouldExposeProviderContent(providerStatus: string, contentStatus: string, deletedAt: Date | null | undefined) {
  return providerStatus === "approved" && contentStatus === "published" && !deletedAt;
}
