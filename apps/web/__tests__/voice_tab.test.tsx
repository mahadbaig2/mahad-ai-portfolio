import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import React from "react";
import { ConversationalVoiceTab } from "@/components/assistant/ConversationalVoiceTab";
import { AssistantWidgetProvider } from "@/components/assistant/AssistantWidgetContext";
import * as client from "@/lib/assistant/client";

// Mock @elevenlabs/react hook
const mockStartSession = vi.fn();
const mockEndSession = vi.fn();
const mockSetVolume = vi.fn();
const mockSendUserActivity = vi.fn();

let mockConversationState = {
  status: "disconnected",
  isSpeaking: false,
  startSession: mockStartSession,
  endSession: mockEndSession,
  setVolume: mockSetVolume,
  sendUserActivity: mockSendUserActivity,
};

let conversationCallbacks: any = {};

vi.mock("@elevenlabs/react", () => ({
  ConversationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useConversation: (callbacks: any) => {
    conversationCallbacks = callbacks;
    return mockConversationState;
  },
}));

describe("ConversationalVoiceTab (Milestone 13P.9)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockStartSession.mockReset();
    mockEndSession.mockReset();
    mockSetVolume.mockReset();
    mockSendUserActivity.mockReset();
    mockConversationState.status = "disconnected";
    mockConversationState.isSpeaking = false;
    conversationCallbacks = {};
  });

  it("renders 2-minute session disclosure, AI-generated voice label and start button", () => {
    render(
      <AssistantWidgetProvider>
        <ConversationalVoiceTab />
      </AssistantWidgetProvider>
    );

    expect(screen.getByText("2-minute session limit")).toBeDefined();
    expect(
      screen.getByText(/AI-generated synthetic voice/i)
    ).toBeDefined();
    expect(screen.getByText("Start Voice Conversation")).toBeDefined();
    expect(screen.getByText("Continue in text chat")).toBeDefined();
  });

  it("requests microphone and obtains token only on explicit start button click", async () => {
    const getUserMediaSpy = vi.fn().mockResolvedValue({});
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia: getUserMediaSpy },
      configurable: true,
      writable: true,
    });

    const tokenSpy = vi.spyOn(client, "requestVoiceToken").mockResolvedValue({
      token: "mock-token-xyz",
      agent_id: "agent_7601m3zc989wfnwvvd78k6kcpvpa",
      max_duration_seconds: 120,
      inactivity_timeout_seconds: 15,
      expires_at: 9999999,
    });

    render(
      <AssistantWidgetProvider>
        <ConversationalVoiceTab />
      </AssistantWidgetProvider>
    );

    expect(getUserMediaSpy).not.toHaveBeenCalled();
    expect(tokenSpy).not.toHaveBeenCalled();

    const startBtn = screen.getByText("Start Voice Conversation");
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(getUserMediaSpy).toHaveBeenCalledWith({ audio: true });
      expect(tokenSpy).toHaveBeenCalledTimes(1);
      expect(mockStartSession).toHaveBeenCalledWith({
        conversationToken: "mock-token-xyz",
        connectionType: "webrtc",
      });
    });
  });

  it("connects via WebSocket when signed_url is provided", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia: vi.fn().mockResolvedValue({}) },
      configurable: true,
      writable: true,
    });

    vi.spyOn(client, "requestVoiceToken").mockResolvedValue({
      token: "mock-token",
      signed_url: "wss://api.elevenlabs.io/v1/convai/conversation?signed=true",
      agent_id: "agent_7601m3zc989wfnwvvd78k6kcpvpa",
      max_duration_seconds: 120,
      inactivity_timeout_seconds: 15,
      expires_at: 9999999,
    });

    render(
      <AssistantWidgetProvider>
        <ConversationalVoiceTab />
      </AssistantWidgetProvider>
    );

    fireEvent.click(screen.getByText("Start Voice Conversation"));

    await waitFor(() => {
      expect(mockStartSession).toHaveBeenCalledWith({
        signedUrl: "wss://api.elevenlabs.io/v1/convai/conversation?signed=true",
        connectionType: "websocket",
      });
    });
  });

  it("handles microphone permission denied gracefully", async () => {
    const error = new Error("Permission denied");
    error.name = "NotAllowedError";

    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: vi.fn().mockRejectedValue(error),
      },
      configurable: true,
      writable: true,
    });

    render(
      <AssistantWidgetProvider>
        <ConversationalVoiceTab />
      </AssistantWidgetProvider>
    );

    const startBtn = screen.getByText("Start Voice Conversation");
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(screen.getByText(/Microphone access was denied/i)).toBeDefined();
      expect(screen.getByText("Voice Unavailable")).toBeDefined();
    });
  });

  it("transitions to active state and shows countdown and controls on connect", () => {
    render(
      <AssistantWidgetProvider>
        <ConversationalVoiceTab />
      </AssistantWidgetProvider>
    );

    // Simulate onConnect from ElevenLabs SDK
    act(() => {
      conversationCallbacks.onConnect?.();
    });

    expect(screen.getByText(/2:00 remaining/i)).toBeDefined();
    expect(screen.getByTitle("End conversation")).toBeDefined();
    expect(screen.getByTitle("Mute")).toBeDefined();
  });

  it("displays quota exhausted message when quota error occurs", () => {
    render(
      <AssistantWidgetProvider>
        <ConversationalVoiceTab />
      </AssistantWidgetProvider>
    );

    act(() => {
      conversationCallbacks.onError?.(new Error("provider quota exceeded 429"));
    });

    expect(
      screen.getByText("Monthly Voice Allowance Reached")
    ).toBeDefined();
    expect(
      screen.getByText(/Monthly voice conversation allowance reached. Please continue in text chat./i)
    ).toBeDefined();
  });

  it("fetches and displays compact citation chips beneath AI transcript turns (Milestone 13P.13)", async () => {
    const citationsSpy = vi.spyOn(client, "fetchLatestVoiceCitations").mockResolvedValue({
      turn_id: "chatcmpl-test-voice",
      session_id: "voice-123",
      route: "rag_retrieval",
      citations: ["chunk-test-ecg"],
      citation_details: [
        {
          index: 1,
          chunk_id: "chunk-test-ecg",
          title: "CardioScan Architecture",
          url: "/work/cardioscan",
          heading: "ECG Classification",
        },
      ],
      timestamp: 12345678,
    });

    render(
      <AssistantWidgetProvider>
        <ConversationalVoiceTab />
      </AssistantWidgetProvider>
    );

    act(() => {
      conversationCallbacks.onConnect?.();
    });

    // Simulate AI message turn
    await act(async () => {
      await conversationCallbacks.onMessage?.({
        source: "ai",
        message: "CardioScan is a real-time cardiac abnormality classification system.",
      });
    });

    await waitFor(() => {
      expect(citationsSpy).toHaveBeenCalled();
      expect(screen.getByText("CardioScan Architecture")).toBeDefined();
      expect(screen.getByText("Sources:")).toBeDefined();
    });
  });
});

