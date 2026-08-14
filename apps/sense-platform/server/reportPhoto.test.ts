import { describe, expect, it } from "vitest";
import { isCitizenPhotoSizeAllowed, isSupportedCitizenPhotoType } from "./reportWorkflow";

describe("citizen report photo policy", () => {
  it("allows supported image types only", () => {
    expect(isSupportedCitizenPhotoType("image/jpeg")).toBe(true);
    expect(isSupportedCitizenPhotoType("image/png")).toBe(true);
    expect(isSupportedCitizenPhotoType("application/pdf")).toBe(false);
    expect(isSupportedCitizenPhotoType("image/svg+xml")).toBe(false);
  });

  it("enforces a positive five megabyte limit", () => {
    expect(isCitizenPhotoSizeAllowed(1)).toBe(true);
    expect(isCitizenPhotoSizeAllowed(5 * 1024 * 1024)).toBe(true);
    expect(isCitizenPhotoSizeAllowed(0)).toBe(false);
    expect(isCitizenPhotoSizeAllowed(5 * 1024 * 1024 + 1)).toBe(false);
  });
});

export {};
