import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { AssistantWidgetProvider } from "@/components/assistant/AssistantWidgetContext";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";

// Mock @elevenlabs/react hook
vi.mock("@elevenlabs/react", () => ({
  ConversationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useConversation: () => ({
    status: "disconnected",
    isSpeaking: false,
    startSession: vi.fn(),
    endSession: vi.fn(),
    setVolume: vi.fn(),
    sendUserActivity: vi.fn(),
  }),
}));

describe("AssistantWidget Component Shell (Milestone 13P.6)", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("renders launcher button with closed state", () => {
    render(
      <AssistantWidgetProvider>
        <AssistantWidget />
      </AssistantWidgetProvider>
    );

    const launcher = screen.getByRole("button", { name: /Open Talk to Mahad assistant/i });
    expect(launcher).toBeDefined();
    expect(launcher.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("region", { name: /Talk to Mahad conversational companion/i })).toBeNull();
  });

  it("opens panel on launcher click and allows switching tabs", () => {
    render(
      <AssistantWidgetProvider>
        <AssistantWidget />
      </AssistantWidgetProvider>
    );

    const launcher = screen.getByRole("button", { name: /Open Talk to Mahad assistant/i });
    fireEvent.click(launcher);

    // Panel is now open
    const panel = screen.getByRole("region", { name: /Talk to Mahad conversational companion/i });
    expect(panel).toBeDefined();

    // Verify Chat and Voice tabs
    const chatTab = screen.getByRole("tab", { name: /Chat/i });
    const voiceTab = screen.getByRole("tab", { name: /Voice/i });
    expect(chatTab).toBeDefined();
    expect(voiceTab).toBeDefined();
    expect(chatTab.getAttribute("aria-selected")).toBe("true");

    // Switch to Voice tab
    fireEvent.click(voiceTab);
    expect(voiceTab.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText(/2-minute session limit/i)).toBeDefined();

    // Switch back to Chat tab
    fireEvent.click(chatTab);
    expect(chatTab.getAttribute("aria-selected")).toBe("true");
  });

  it("closes panel on Escape key press", () => {
    render(
      <AssistantWidgetProvider>
        <AssistantWidget />
      </AssistantWidgetProvider>
    );

    const launcher = screen.getByRole("button", { name: /Open Talk to Mahad assistant/i });
    fireEvent.click(launcher);
    expect(screen.getByRole("region", { name: /Talk to Mahad conversational companion/i })).toBeDefined();

    // Press Escape
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("region", { name: /Talk to Mahad conversational companion/i })).toBeNull();
  });

  it("has link to full chat page", () => {
    render(
      <AssistantWidgetProvider>
        <AssistantWidget />
      </AssistantWidgetProvider>
    );

    const launcher = screen.getByRole("button", { name: /Open Talk to Mahad assistant/i });
    fireEvent.click(launcher);

    const fullChatLink = screen.getByTitle(/Open full chat with execution inspector/i);
    expect(fullChatLink.getAttribute("href")).toBe("/chat");
  });
});

describe("5-Second Automatic Opening (Milestone 13P.7)", () => {
  beforeEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
  });

  it("automatically opens widget after 5 seconds to chat tab with zero mic or network side-effects", () => {
    vi.useFakeTimers();

    const getUserMediaSpy = vi.fn();
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia: getUserMediaSpy },
      configurable: true,
      writable: true,
    });

    const fetchSpy = vi.spyOn(global, "fetch");

    render(
      <AssistantWidgetProvider>
        <AssistantWidget />
      </AssistantWidgetProvider>
    );

    // Closed initially
    expect(screen.queryByRole("region", { name: /Talk to Mahad conversational companion/i })).toBeNull();

    // Advance 4999ms - still closed
    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(screen.queryByRole("region", { name: /Talk to Mahad conversational companion/i })).toBeNull();

    // Advance past 5000ms
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByRole("region", { name: /Talk to Mahad conversational companion/i })).toBeDefined();

    // Default to chat tab
    const chatTab = screen.getByRole("tab", { name: /Chat/i });
    expect(chatTab.getAttribute("aria-selected")).toBe("true");

    // Zero mic or token requests
    expect(getUserMediaSpy).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();

    // Recorded in sessionStorage
    expect(sessionStorage.getItem("mahad_widget_auto_opened")).toBe("true");

    vi.useRealTimers();
  });

  it("does not auto-open if previously dismissed in the same session", () => {
    vi.useFakeTimers();
    sessionStorage.setItem("mahad_widget_dismissed", "true");

    render(
      <AssistantWidgetProvider>
        <AssistantWidget />
      </AssistantWidgetProvider>
    );

    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.queryByRole("region", { name: /Talk to Mahad conversational companion/i })).toBeNull();

    vi.useRealTimers();
  });

  it("does not auto-open if previously auto-opened in the same session", () => {
    vi.useFakeTimers();
    sessionStorage.setItem("mahad_widget_auto_opened", "true");

    render(
      <AssistantWidgetProvider>
        <AssistantWidget />
      </AssistantWidgetProvider>
    );

    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.queryByRole("region", { name: /Talk to Mahad conversational companion/i })).toBeNull();

    vi.useRealTimers();
  });

  it("cancels auto-open if manually opened before 5 seconds", () => {
    vi.useFakeTimers();

    render(
      <AssistantWidgetProvider>
        <AssistantWidget />
      </AssistantWidgetProvider>
    );

    // Manually open at 2s
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    const launcher = screen.getByRole("button", { name: /Open Talk to Mahad assistant/i });
    fireEvent.click(launcher);

    expect(screen.getByRole("region", { name: /Talk to Mahad conversational companion/i })).toBeDefined();

    // Manually close at 3s
    const closeBtn = screen.getByRole("button", { name: /Close widget/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("region", { name: /Talk to Mahad conversational companion/i })).toBeNull();

    // Advance past original 5s timer
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    // Should stay closed because dismissal flag was recorded and timer was cancelled
    expect(screen.queryByRole("region", { name: /Talk to Mahad conversational companion/i })).toBeNull();

    vi.useRealTimers();
  });
});
