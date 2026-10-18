import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  formatMessageContentWithCitations,
  extractCompactCitations,
} from "@/lib/assistant/citations";
import {
  checkAssistantHealth,
  streamAssistantMessage,
  fetchVoiceConfig,
  requestVoiceToken,
} from "@/lib/assistant/client";

describe("Shared Assistant Citations", () => {
  it("formats content with citation details into indexed markdown links", () => {
    const raw = "Mahad built CardioScan [chunk-123] for cardiac diagnostics.";
    const details = [
      {
        index: 1,
        chunk_id: "chunk-123",
        title: "CardioScan Project",
        url: "/work/cardioscan",
      },
    ];

    const formatted = formatMessageContentWithCitations(raw, ["chunk-123"], details);
    expect(formatted).toContain("[[1]](/work/cardioscan \"CardioScan Project\")");
    expect(formatted).not.toContain("[chunk-123]");
  });

  it("extracts compact citation chips accurately", () => {
    const details = [
      {
        index: 1,
        chunk_id: "chunk-a",
        title: "CardioScan",
        url: "/work/cardioscan",
      },
      {
        index: 2,
        chunk_id: "chunk-b",
        title: "Talk to Mahad",
        url: "/work/talk-to-mahad",
      },
    ];

    const chips = extractCompactCitations(["chunk-a", "chunk-b"], details);
    expect(chips).toHaveLength(2);
    expect(chips[0].title).toBe("CardioScan");
    expect(chips[0].url).toBe("/work/cardioscan");
    expect(chips[1].index).toBe(2);
  });

  it("handles fallback citation generation when only raw chunk IDs exist", () => {
    const chips = extractCompactCitations(["talk_to_mahad_chunk_1"]);
    expect(chips).toHaveLength(1);
    expect(chips[0].index).toBe(1);
    expect(chips[0].url).toBe("/work/talk-to-mahad");
  });
});

describe("Shared Assistant API Client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("checkAssistantHealth returns true when probe succeeds", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
    const isHealthy = await checkAssistantHealth();
    expect(isHealthy).toBe(true);
  });

  it("checkAssistantHealth returns false when probe fails", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network down"));
    const isHealthy = await checkAssistantHealth();
    expect(isHealthy).toBe(false);
  });

  it("fetchVoiceConfig returns operational parameters", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        voice_enabled: true,
        max_session_seconds: 120,
        inactivity_timeout_seconds: 15,
        server_location: "us",
        active_voice_id: "voice_brian",
      }),
    });

    const config = await fetchVoiceConfig();
    expect(config.voice_enabled).toBe(true);
    expect(config.max_session_seconds).toBe(120);
    expect(config.active_voice_id).toBe("voice_brian");
  });

  it("requestVoiceToken parses token and agent ID", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        token: "token_mock_123",
        agent_id: "agent_7601m3zc989wfnwvvd78k6kcpvpa",
        max_duration_seconds: 120,
        inactivity_timeout_seconds: 15,
        expires_at: 123456789,
      }),
    });

    const res = await requestVoiceToken("sess-1");
    expect(res.token).toBe("token_mock_123");
    expect(res.agent_id).toBe("agent_7601m3zc989wfnwvvd78k6kcpvpa");
  });
});
