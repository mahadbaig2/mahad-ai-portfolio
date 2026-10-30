import { test, expect } from "@playwright/test";

test.describe("Smoke Tests - Public Pages", () => {
  test.beforeEach(async ({ page }) => {
    // Keep the 5-second visual auto-invitation deterministic during route smoke tests
    await page.addInitScript(() => {
      window.sessionStorage.setItem("mahad_widget_dismissed", "true");
    });
  });

  test("home page loads and has expected heading and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Mirza Mahad Baig \/\/ AI Product Engineer/i);
    await expect(
      page.getByRole("heading", { name: /I Design Products\.\s*I Engineer Intelligence\./i, level: 1 })
    ).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: /Explore My Work/i })).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: /Talk to Mahad/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Selected Work", level: 2 })).toBeVisible();
    await expect(page.getByRole("button", { name: /Open Talk to Mahad assistant/i })).toBeVisible();
  });

  test("work index loads and lists projects", async ({ page }) => {
    await page.goto("/work");
    await expect(
      page.getByRole("heading", { name: /Work That Moves From Interface to Intelligence\./i, level: 1 })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /(Mahad AI|Talk to Mahad)/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /(CardioScan|Busyfile)/i }).first()).toBeVisible();
  });

  test("case study page loads with metrics and architecture", async ({ page }) => {
    await page.goto("/work/talk-to-mahad");
    await expect(
      page.getByRole("heading", { name: /Talk to Mahad — Grounded AI Assistant/i, level: 1 })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /Results & Metrics/i, level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Technical Architecture & Approach/i, level: 2 })).toBeVisible();
    await expect(page.getByRole("link", { name: /Work Archive/i })).toBeVisible();
  });

  test("chat page loads assistant interface and architecture", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.getByRole("heading", { name: "Talk to Mahad Assistant", level: 1 })).toBeVisible();
    await expect(page.getByText(/Engineering Delivery Roadmap/i)).toBeVisible();
  });

  test("blog index loads and lists articles", async ({ page }) => {
    await page.goto("/blog");
    await expect(
      page.getByRole("heading", { name: /Notes From Building Between Product and AI\./i, level: 1 })
    ).toBeVisible();
    await expect(
      page
        .getByRole("heading", {
          name: /(I Decided My Portfolio Should Be the Project|Architecting an Intentionally Over-Engineered AI Portfolio)/i,
        })
        .first()
    ).toBeVisible();
  });

  test("article page loads with full narrative", async ({ page }) => {
    await page.goto("/blog/architecting-an-intentionally-over-engineered-portfolio");
    await expect(
      page.getByRole("heading", {
        name: /Architecting an Intentionally Over-Engineered AI Portfolio/i,
        level: 1,
      })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Writing Monographs/i })).toBeVisible();
  });

  test("about page loads career narrative and skills", async ({ page }) => {
    await page.goto("/about");
    await expect(
      page.getByRole("heading", {
        name: /I Started With How Products Feel\. Then I Learned How They Work\./i,
        level: 1,
      })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /Verified Work History/i, level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Grouped Skill Groups/i, level: 2 })).toBeVisible();
  });

  test("contact page loads links and contact guidance", async ({ page }) => {
    await page.goto("/contact");
    await expect(
      page.getByRole("heading", { name: /Let's Talk About a Real Problem\./i, level: 1 })
    ).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: /LinkedIn/i }).first()).toBeVisible();
    await expect(
      page.getByRole("main").getByRole("link", { name: /GitHub|Inspect Repositories/i }).first()
    ).toBeVisible();
  });
});

test.describe("Mobile Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("mahad_widget_dismissed", "true");
    });
  });

  // Only run mobile drawer test on the mobile-chrome project
  test("hamburger toggles mobile drawer menu and closes on navigate", async ({ page }, testInfo) => {
    if (testInfo.project.name !== "mobile-chrome") {
      test.skip();
      return;
    }

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const menuButton = page.getByRole("button", { name: "Open menu" });
    await expect(menuButton).toBeVisible();

    // Allow client hydration
    await page.waitForTimeout(500);

    // Open mobile menu
    await menuButton.click();
    const mobileNav = page.locator("#mobile-navigation");
    await expect(mobileNav).toBeVisible({ timeout: 5000 });

    const workMobileLink = mobileNav.getByRole("link", { name: "Work" });
    await expect(workMobileLink).toBeVisible();

    // Navigate to /work
    await workMobileLink.click();
    await expect(page).toHaveURL(/\/work$/);
  });
});
