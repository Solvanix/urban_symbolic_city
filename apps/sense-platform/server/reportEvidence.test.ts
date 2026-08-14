import { describe, expect, it } from "vitest";
import { isEvidenceSizeAllowed, isSupportedEvidenceType } from "./reportWorkflow";

describe("report evidence validation", () => {
  it("accepts supported image and PDF content types", () => {
    expect(isSupportedEvidenceType("image/jpeg")).toBe(true);
    expect(isSupportedEvidenceType("application/pdf")).toBe(true);
    expect(isSupportedEvidenceType("text/html")).toBe(false);
  });

  it("enforces a positive six megabyte evidence limit", () => {
    expect(isEvidenceSizeAllowed(1)).toBe(true);
    expect(isEvidenceSizeAllowed(6_000_000)).toBe(true);
    expect(isEvidenceSizeAllowed(0)).toBe(false);
    expect(isEvidenceSizeAllowed(6_000_001)).toBe(false);
  });
});
