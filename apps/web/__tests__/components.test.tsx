import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PROJECTS, ARTICLES } from "@/lib/data";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("Header Component", () => {
  it("renders main branding and navigation links", () => {
    render(<Header />);
    expect(screen.getAllByText(/Mahad/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Work/i)).toBeDefined();
    expect(screen.getByText(/Writing/i)).toBeDefined();
    expect(screen.getByText(/About/i)).toBeDefined();
    expect(screen.getByText(/Contact/i)).toBeDefined();
    expect(screen.getByText(/Talk to Mahad/i)).toBeDefined();
  });
});

describe("Footer Component", () => {
  it("renders social links and positioning metadata", () => {
    render(<Footer />);
    expect(screen.getAllByText(/Mirza Mahad Baig/i).length).toBeGreaterThan(0);
    expect(screen.getByText("GitHub")).toBeDefined();
    expect(screen.getByText("LinkedIn")).toBeDefined();
    expect(screen.getByText("Medium")).toBeDefined();
  });
});

describe("Content Data Integrity", () => {
  it("all projects have required fields and unique slugs", () => {
    const slugs = new Set<string>();
    for (const project of PROJECTS) {
      expect(project.slug).toBeTruthy();
      expect(project.title).toBeTruthy();
      expect(project.summary).toBeTruthy();
      expect(project.metrics.length).toBeGreaterThan(0);
      expect(slugs.has(project.slug)).toBe(false);
      slugs.add(project.slug);
    }
  });

  it("all articles have content and unique slugs", () => {
    const slugs = new Set<string>();
    for (const article of ARTICLES) {
      expect(article.slug).toBeTruthy();
      expect(article.title).toBeTruthy();
      expect(article.content.length).toBeGreaterThan(0);
      expect(slugs.has(article.slug)).toBe(false);
      slugs.add(article.slug);
    }
  });
});
