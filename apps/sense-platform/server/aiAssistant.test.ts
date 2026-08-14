import { describe, expect, it } from "vitest";
import { redactPersonalData } from "./aiAssistant";

describe("report assistant privacy", () => {
  it("redacts common personal identifiers before model input", () => {
    const safe = redactPersonalData("اسمي: أحمد، هاتفي 050 123 4567، بريدي test@example.com، والموقع https://example.com");
    expect(safe).not.toContain("test@example.com");
    expect(safe).not.toContain("050 123 4567");
    expect(safe).not.toContain("https://example.com");
    expect(safe).toContain("[بيانات محجوبة]");
  });
});
