"use client";

import { AudioLines } from "lucide-react";
import { useAssistantWidget } from "@/components/assistant/AssistantWidgetContext";

export function OpenAssistantButton({
  className = "",
  label = "Talk to Mahad",
}: {
  className?: string;
  label?: string;
}) {
  const { openWidget } = useAssistantWidget();
  return (
    <button
      className={
        className ||
        "inline-flex items-center gap-2 rounded-full bg-sage hover:bg-secondary-container text-primary transition-colors px-5 py-3 text-sm font-medium"
      }
      type="button"
      onClick={() => openWidget("chat")}
    >
      <AudioLines className="h-4 w-4 text-secondary" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
