import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility (WCAG 2.1 AA Compliance)", () => {
  const routes = [
    "/",
    "/work",
    "/work/talk-to-mahad",
    "/blog",
    "/blog/architecting-an-intentionally-over-engineered-portfolio",
    "/about",
    "/contact",
    "/chat",
  ];

  for (const route of routes) {
    test(`route "${route}" should pass automated axe accessibility scan`, async ({ page }) => {
      await page.goto(route);
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
