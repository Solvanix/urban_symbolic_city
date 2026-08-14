import { describe, expect, it } from "vitest";
import { defaultPreferences, loadPreferences, savePreferences, togglePreference } from "./Preferences";

function createStorage(initial?: string) {
  let value = initial ?? null;
  return {
    getItem: () => value,
    setItem: (_key: string, next: string) => { value = next; },
  };
}

describe("accessibility preferences", () => {
  it("toggles one preference without mutating the original state", () => {
    const original = { ...defaultPreferences };
    const next = togglePreference(original, "largeText");

    expect(original.largeText).toBe(false);
    expect(next.largeText).toBe(true);
    expect(next.highContrast).toBe(false);
  });

  it("saves and loads the access profile", () => {
    const storage = createStorage();
    const profile = { ...defaultPreferences, highContrast: true, accessNeeds: ["visual", "companion"] };

    savePreferences(storage, profile);

    expect(loadPreferences(storage)).toEqual(profile);
  });

  it("falls back safely when stored JSON is invalid", () => {
    expect(loadPreferences(createStorage("not-json"))).toEqual(defaultPreferences);
  });
});
