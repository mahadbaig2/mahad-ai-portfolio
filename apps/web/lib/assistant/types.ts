/**
 * Client types for the Talk to Mahad Assistant (Milestone 11.1).
 */

export type AssistantMode = "text" | "voice";
export type ChatMessageRole = "user" | "assistant" | "system";
export type RouteLabel = "rag_retrieval" | "direct_chat" | "refusal";
export type LanguageLabel = "en" | "ur";
export type PersonaType = "general" | "recruiter" | "engineer" | "founder";

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  timestamp?: string;
  citations?: string[];
  route?: RouteLabel;
  isStreaming?: boolean;
  executionSteps?: ExecutionStep[];
}

export interface ExecutionStep {
  step_name: string;
  duration_ms: number;
  status: string;
  details: Record<string, any>;
}

export interface EvidenceChunk {
  chunk_id: string;
  document_title: string;
  section_heading?: string | null;
  text_content: string;
  similarity_score: number;
  source_url?: string | null;
}

export interface AssistantChatRequest {
  message: string;
  session_id?: string;
  persona?: PersonaType;
  mode?: AssistantMode;
  history?: Array<{ role: ChatMessageRole; content: string }>;
  consent_given?: boolean;
}

export interface AssistantChatResponse {
  session_id: string;
  answer: string;
  citations: string[];
  route: RouteLabel;
  language: LanguageLabel;
  is_safe: boolean;
  mode: AssistantMode;
  suggested_actions?: Array<{ label: string; url: string }>;
  navigation_target?: { path: string; label: string } | null;
  execution_steps: ExecutionStep[];
  errors: string[];
}
