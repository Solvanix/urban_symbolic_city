import { describe, expect, it } from "vitest";
import { canCitizenRateReport } from "./reportWorkflow";

describe("canCitizenRateReport", () => {
  it("allows only the reporter to rate a closed report", () => {
    expect(canCitizenRateReport("closed", 7, 7)).toBe(true);
    expect(canCitizenRateReport("closed", 7, 8)).toBe(false);
    expect(canCitizenRateReport("in_progress", 7, 7)).toBe(false);
  });
});
