"use client";

import React from "react";
import { PersonaType } from "@/lib/assistant/types";
import { Briefcase, Terminal, DollarSign, UserCheck } from "lucide-react";

interface ModeSelectorProps {
  currentPersona: PersonaType;
  onSelect: (persona: PersonaType) => void;
  disabled?: boolean;
}

const PERSONAS: Array<{
  id: PersonaType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: "recruiter",
    label: "Recruiter",
    description: "Stack, experience, role scope, availability",
    icon: Briefcase,
  },
  {
    id: "engineer",
    label: "Engineer",
    description: "ONNX routing, RAG topology, LangGraph limits",
    icon: Terminal,
  },
  {
    id: "founder",
    label: "Founder",
    description: "Cost bounds, product speed, full-stack delivery",
    icon: DollarSign,
  },
  {
    id: "general",
    label: "General",
    description: "Balanced overview of career and portfolio",
    icon: UserCheck,
  },
];

export function ModeSelector({
  currentPersona,
  onSelect,
  disabled = false,
}: ModeSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="Audience persona selector">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Perspective Mode</span>
        <span>Tailors response depth and terminology</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PERSONAS.map((p) => {
          const isSelected = currentPersona === p.id;
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onSelect(p.id)}
              className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-left transition-all ${
                isSelected
                  ? "border-foreground bg-foreground/5 text-foreground font-medium shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${isSelected ? "text-foreground" : "text-muted-foreground"}`} />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold leading-tight">{p.label}</span>
                <span className="text-[11px] leading-tight text-muted-foreground line-clamp-1 mt-0.5">
                  {p.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
