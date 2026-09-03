import { test, expect } from "@playwright/test";

test.describe("Smoke Tests - Public Pages", () => {
  test("home page loads and has expected heading and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Mahad (—|\|) AI Product Engineering/i);
    await expect(page.getByRole("heading", { name: "Hi, I'm Mahad.", level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "Talk to Mahad Assistant" })).toBeVisible();
    await expect(page.getByRole("link", { name: "View Selected Work" })).toBeVisible();
  });

  test("work index loads and lists projects", async ({ page }) => {
    await page.goto("/work");
    await expect(page.getByRole("heading", { name: "Selected Work", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Talk to Mahad/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Enterprise RAG & Evaluation Pipeline/i })).toBeVisible();
  });

  test("case study page loads with metrics and architecture", async ({ page }) => {
    await page.goto("/work/talk-to-mahad");
    await expect(page.getByRole("heading", { name: /Talk to Mahad — Grounded AI Assistant/i, level: 1 })).toBeVisible();
    await expect(page.getByText("Verified Metrics")).toBeVisible();
    await expect(page.getByText("System Architecture & Topology")).toBeVisible();
  });

  test("blog index loads and lists articles", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { name: "Articles & Notes", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Architecting an Intentionally Over-Engineered AI Portfolio/i })).toBeVisible();
  });

  test("article page loads with full narrative", async ({ page }) => {
    await page.goto("/blog/architecting-an-intentionally-over-engineered-portfolio");
    await expect(page.getByRole("heading", { name: /Architecting an Intentionally Over-Engineered AI Portfolio/i, level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /Back to Articles/i })).toBeVisible();
  });

  test("about page loads career narrative and skills", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: "About Mahad", level: 1 })).toBeVisible();
    await expect(page.getByText("Technical Competencies")).toBeVisible();
  });

  test("contact page loads links and contact guidance", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("heading", { name: "Contact & Resume", level: 1 })).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: /LinkedIn/i })).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: /GitHub/i })).toBeVisible();
  });
});

test.describe("Mobile Navigation", () => {
  // Only run mobile drawer test on the mobile-chrome project
  test("hamburger toggles mobile drawer menu and closes on navigate", async ({ page }, testInfo) => {
    if (testInfo.project.name !== "mobile-chrome") {
      test.skip();
      return;
    }

    await page.goto("/");
    const menuButton = page.getByRole("button", { name: "Open menu" });
    await expect(menuButton).toBeVisible();

    // Open mobile menu
    await menuButton.click();
    const mobileNav = page.locator("#mobile-navigation");
    await expect(mobileNav).toBeVisible();

    const workMobileLink = mobileNav.getByRole("link", { name: "Work" });
    await expect(workMobileLink).toBeVisible();

    // Navigate to /work
    await workMobileLink.click();
    await expect(page).toHaveURL(/\/work$/);
  });
});
