import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { CompactChatTab } from "@/components/assistant/CompactChatTab";
import * as client from "@/lib/assistant/client";

describe("CompactChatTab (Milestone 13P.8)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders empty state with prompts and disclaimer", () => {
    render(<CompactChatTab />);

    expect(screen.getByText("Ask anything about Mahad")).toBeDefined();
    expect(screen.getByText("What is Mahad's tech stack?")).toBeDefined();
    expect(screen.getByText("Tell me about CardioScan")).toBeDefined();
    expect(screen.getByPlaceholderText("Ask a question...")).toBeDefined();
  });

  it("populates input when suggestion button is clicked", () => {
    render(<CompactChatTab />);

    const suggestionBtn = screen.getByText("What is Mahad's tech stack?");
    fireEvent.click(suggestionBtn);

    const input = screen.getByPlaceholderText("Ask a question...") as HTMLInputElement;
    expect(input.value).toBe("What is Mahad's tech stack?");
  });

  it("submits message and streams assistant response with citations", async () => {
    const streamSpy = vi.spyOn(client, "streamAssistantMessage").mockImplementation(
      async (req, callbacks) => {
        callbacks.onToken?.("Mahad uses ");
        callbacks.onToken?.("FastAPI and Next.js.");
        callbacks.onDone?.({
          session_id: "test-sess",
          answer: "Mahad uses FastAPI and Next.js.",
          citations: ["chunk-work-1"],
          citation_details: [
            {
              index: 1,
              chunk_id: "chunk-work-1",
              title: "Tech Stack",
              url: "/about",
            },
          ],
          route: "rag_retrieval",
          language: "en",
          is_safe: true,
          mode: "text",
          execution_steps: [],
          errors: [],
        });
      }
    );

    render(<CompactChatTab />);

    const input = screen.getByPlaceholderText("Ask a question...") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "What is your stack?" } });

    const submitBtn = screen.getByTitle("Send message");
    fireEvent.click(submitBtn);

    // Verify user message is rendered
    expect(screen.getByText("What is your stack?")).toBeDefined();

    // Verify stream response
    await waitFor(() => {
      expect(screen.getByText(/Mahad uses FastAPI and Next.js/i)).toBeDefined();
    });

    // Verify citation chip
    expect(screen.getByText("Tech Stack")).toBeDefined();
    expect(streamSpy).toHaveBeenCalledTimes(1);
    expect(streamSpy.mock.calls[0][0].mode).toBe("text");
    expect(streamSpy.mock.calls[0][0].message).toBe("What is your stack?");
  });

  it("clears conversation history when clear button is clicked", async () => {
    vi.spyOn(client, "streamAssistantMessage").mockImplementation(
      async (req, callbacks) => {
        callbacks.onDone?.({
          session_id: "test-sess",
          answer: "Done answer",
          citations: [],
          route: "direct_chat",
          language: "en",
          is_safe: true,
          mode: "text",
          execution_steps: [],
          errors: [],
        });
      }
    );

    render(<CompactChatTab />);

    const input = screen.getByPlaceholderText("Ask a question...") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Test clear" } });
    fireEvent.click(screen.getByTitle("Send message"));

    await waitFor(() => {
      expect(screen.getByText("Test clear")).toBeDefined();
    });

    // Clear button appears
    const clearBtn = screen.getByTitle("Clear messages");
    fireEvent.click(clearBtn);

    // Back to empty state
    expect(screen.queryByText("Test clear")).toBeNull();
    expect(screen.getByText("Ask anything about Mahad")).toBeDefined();
  });

  it("handles streaming error gracefully", async () => {
    vi.spyOn(client, "streamAssistantMessage").mockImplementation(
      async (req, callbacks) => {
        callbacks.onError?.({ code: "NETWORK_ERROR", message: "Network timeout" });
      }
    );

    render(<CompactChatTab />);

    const input = screen.getByPlaceholderText("Ask a question...") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Error test" } });
    fireEvent.click(screen.getByTitle("Send message"));

    await waitFor(() => {
      expect(screen.getByText(/Network timeout/i)).toBeDefined();
    });
  });
});
