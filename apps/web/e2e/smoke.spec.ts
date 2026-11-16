import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.setItem("mahad_widget_dismissed", "true");
  });
});

test("home shows the portfolio and primary navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /I design products and engineer their intelligence/i, level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Selected work/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Open Talk to Mahad assistant/i })).toBeVisible();
});

test("work index links to the repository-based projects", async ({ page }) => {
  await page.goto("/work");
  await expect(page.getByRole("heading", { name: /Work, in many forms/i, level: 1 })).toBeVisible();
  for (const title of ["Evzino", "Freqtrade", "Marketing OS", "Alder Legal"]) {
    await expect(page.getByRole("link", { name: new RegExp(title, "i") }).first()).toBeVisible();
  }
});

test("case study shows a placeholder, approach and source", async ({ page }) => {
  await page.goto("/work/talk-to-mahad");
  await expect(page.getByRole("heading", { name: /Talk to Mahad/i, level: 1 })).toBeVisible();
  await expect(page.getByRole("img", { name: /Image placeholder for Talk to Mahad/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "The approach" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Explore the repository/i })).toBeVisible();
});

test("Alder Legal identifies its mock data", async ({ page }) => {
  await page.goto("/work/alder-legal");
  await expect(page.getByRole("heading", { name: "Alder Legal", level: 1 })).toBeVisible();
  await expect(page.getByText(/mock data/i).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Explore the repository/i })).toHaveCount(0);
});

test("chat page presents the full assistant", async ({ page }) => {
  await page.goto("/chat");
  await expect(page.getByRole("heading", { name: /Ask about the work/i, level: 1 })).toBeVisible();
  await expect(page.getByText(/Answers depend on the assistant service/i)).toBeVisible();
});

test("writing index and article are available", async ({ page }) => {
  await page.goto("/writing");
  await expect(page.getByRole("heading", { name: /Thinking out loud about building/i, level: 1 })).toBeVisible();
  await page.goto("/writing/architecting-an-intentionally-over-engineered-portfolio");
  await expect(page.getByRole("heading", { name: /Architecting an AI Portfolio With Free-Tier Constraints/i, level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /All writing/i })).toBeVisible();
});

test("about and contact pages present the current editorial headings", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { name: /A designer’s eye.*An engineer’s mind/i, level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Where I’ve worked" })).toBeVisible();
  await page.goto("/contact");
  await expect(page.getByRole("heading", { name: /Good work starts with a conversation/i, level: 1 })).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: /LinkedIn/i })).toBeVisible();
});

test("mobile menu opens and navigates", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chrome");
  await page.goto("/");
  const menuButton = page.getByRole("button", { name: "Open menu" });
  await menuButton.click();
  const mobileNav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(mobileNav).toBeVisible();
  await mobileNav.getByRole("link", { name: "Work" }).click();
  await expect(page).toHaveURL(/\/work$/);
});
