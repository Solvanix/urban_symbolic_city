import { describe, expect, it } from "vitest";
import { canProviderMember, canPublishProviderContent, shouldExposeProviderContent } from "./providerAccess";

describe("provider access policy", () => {
  it("keeps finance data away from content editors", () => {
    expect(canProviderMember("editor", "manage_content")).toBe(true);
    expect(canProviderMember("editor", "view_payouts")).toBe(false);
    expect(canProviderMember("finance_viewer", "view_payouts")).toBe(true);
  });

  it("requires provider approval before publishing content", () => {
    expect(canPublishProviderContent("pending_review", "published")).toBe(false);
    expect(canPublishProviderContent("approved", "pending_review")).toBe(true);
    expect(shouldExposeProviderContent("approved", "published", null)).toBe(true);
    expect(shouldExposeProviderContent("approved", "published", new Date())).toBe(false);
  });
});
