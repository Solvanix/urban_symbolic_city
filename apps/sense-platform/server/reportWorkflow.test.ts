import { describe, expect, it } from "vitest";
import { canTransitionReport, isOperationalRole } from "./reportWorkflow";

describe("report workflow authorization", () => {
  it("allows an assigned field member to submit evidence", () => {
    expect(canTransitionReport("field", "in_progress", "awaiting_approval", 7, 7)).toBe(true);
  });

  it("blocks a field member working on another person's report", () => {
    expect(canTransitionReport("field", "in_progress", "awaiting_approval", 7, 8)).toBe(false);
  });

  it("allows only supervisors and admins to close reports", () => {
    expect(canTransitionReport("staff", "awaiting_approval", "closed", null, 3)).toBe(false);
    expect(canTransitionReport("supervisor", "awaiting_approval", "closed", null, 3)).toBe(true);
  });

  it("accepts the ordered review path and rejects status jumps", () => {
    expect(canTransitionReport("staff", "submitted", "review", null, 3)).toBe(true);
    expect(canTransitionReport("staff", "submitted", "in_progress", null, 3)).toBe(false);
    expect(canTransitionReport("admin", "submitted", "closed", null, 3)).toBe(false);
  });

  it("does not treat citizens as operational roles", () => {
    expect(isOperationalRole("citizen")).toBe(false);
    expect(isOperationalRole("staff")).toBe(true);
  });
});
