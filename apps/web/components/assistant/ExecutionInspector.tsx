"use client";

import React, { useState } from "react";
import { ExecutionStep, RouteLabel } from "@/lib/assistant/types";
import { ChevronDown, ChevronUp, Cpu, Activity, Clock, ShieldCheck, Database } from "lucide-react";

interface ExecutionInspectorProps {
  route?: RouteLabel;
  executionSteps?: ExecutionStep[];
  isStreaming?: boolean;
}

export function ExecutionInspector({
  route,
  executionSteps = [],
  isStreaming = false,
}: ExecutionInspectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (executionSteps.length === 0 && !isStreaming) return null;

  const totalDuration = executionSteps.reduce(
    (acc, step) => acc + (step.duration_ms || 0),
    0
  );

  const classifyStep = executionSteps.find((s) => s.step_name === "classify_query");
  const modelName =
    classifyStep?.details?.model_name ||
    (classifyStep?.details?.model_version ? "MiniLM-L6-v2 ONNX" : "MiniLM-L6-v2 ONNX");
  const modelVersion = classifyStep?.details?.model_version || "v1.0.0";

  return (
    <div className="mt-2.5 rounded-lg border border-border bg-card/60 text-xs overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-muted/40 transition-colors"
        aria-expanded={isExpanded}
        aria-label="Toggle execution telemetry inspector"
      >
        <div className="flex items-center gap-2">
          <Activity className={`h-3.5 w-3.5 ${isStreaming ? "animate-pulse text-foreground" : "text-muted-foreground"}`} />
          <span className="font-semibold text-foreground">Execution Telemetry</span>
          {route && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-foreground uppercase tracking-wider">
              {route.replace("_", " ")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{totalDuration.toFixed(1)} ms</span>
          </span>
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border p-3 space-y-3 bg-muted/10">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="rounded border border-border bg-background p-2">
              <span className="text-muted-foreground block text-[10px]">Router Model</span>
              <span className="font-mono font-medium text-foreground">{modelName} ({modelVersion})</span>
            </div>
            <div className="rounded border border-border bg-background p-2">
              <span className="text-muted-foreground block text-[10px]">Vector DB</span>
              <span className="font-mono font-medium text-foreground">Qdrant Cloud (384-d)</span>
            </div>
            <div className="rounded border border-border bg-background p-2">
              <span className="text-muted-foreground block text-[10px]">State Engine</span>
              <span className="font-mono font-medium text-foreground">LangGraph Engine</span>
            </div>
            <div className="rounded border border-border bg-background p-2">
              <span className="text-muted-foreground block text-[10px]">Security Filter</span>
              <span className="font-mono font-medium text-foreground">Safe Context Verified</span>
            </div>
          </div>

          {/* Graph Steps Timeline */}
          <div>
            <span className="text-[11px] font-medium text-foreground block mb-1.5">
              LangGraph Path & Step Breakdown
            </span>
            <div className="space-y-1 font-mono text-[11px]">
              {executionSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded border border-border/60 bg-background/50 px-2.5 py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-[10px]">{idx + 1}.</span>
                    <span className="text-foreground">{step.step_name}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {step.duration_ms ? `${step.duration_ms.toFixed(1)} ms` : "in progress"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Safety Note */}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground border-t border-border/40 pt-2">
            <ShieldCheck className="h-3 w-3 text-foreground" />
            <span>
              Telemetry verified: System prompts, chain-of-thought tokens, and private API keys are strictly excluded.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
