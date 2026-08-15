import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sourceRoot = resolve(import.meta.dirname);

function read(relativePath: string) {
  return readFileSync(resolve(sourceRoot, relativePath), "utf8");
}

describe("Arabic accessibility contract", () => {
  it("exposes keyboard skip navigation and named mobile navigation", () => {
    const shell = read("components/PublicShell.tsx");
    expect(shell).toContain('href="#main-content"');
    expect(shell).toContain('id="main-content"');
    expect(shell).toContain('aria-label="التنقل الرئيسي للجوال"');
    expect(shell).toContain('aria-current={location === item.href ? "page" : undefined}');
  });

  it("keeps the toolbar data attributes aligned with the CSS rules", () => {
    const toolbar = read("components/AccessibilityToolbar.tsx");
    const css = read("index.css");
    expect(toolbar).toContain('dataset.senseHighContrast');
    expect(toolbar).toContain('dataset.senseReducedMotion');
    expect(css).toContain('data-sense-high-contrast="true"');
    expect(css).toContain('data-sense-reduced-motion="true"');
  });

  it("does not publish unverified destination cards", () => {
    const directory = read("pages/PublicDirectory.tsx");
    expect(directory).toContain("const destinations: VerifiedDestination[] = [];");
    expect(directory).toContain("لا توجد وجهات موثقة منشورة بعد");
  });
});
