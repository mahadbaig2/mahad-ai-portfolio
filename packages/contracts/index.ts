/**
 * Shared API types and contracts generated and validated from FastAPI OpenAPI schema.
 * Milestone 11.1 - P11.1.1 [A]
 */

export type AssistantMode = "text" | "voice";
export type ChatMessageRole = "user" | "assistant" | "system";
export type RouteLabel = "rag_retrieval" | "direct_chat" | "refusal";
export type LanguageLabel = "en" | "ur";
export type PersonaType = "general" | "recruiter" | "engineer" | "founder";

export interface ChatMessagePayload {
  role: ChatMessageRole;
  content: string;
  timestamp?: string;
}

export interface ExecutionStepPayload {
  step_name: string;
  duration_ms: number;
  status: string;
  details: Record<string, any>;
}

export interface EvidenceChunkPayload {
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
  history?: ChatMessagePayload[];
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
  execution_steps: ExecutionStepPayload[];
  errors: string[];
}

export interface CreateSessionRequest {
  consent_given: boolean;
  persona: PersonaType;
}

export interface CreateSessionResponse {
  session_id: string;
  consent_given: boolean;
  persona: string;
  expires_at: string;
}

export interface SessionDetailResponse {
  session_id: string;
  consent_given: boolean;
  persona: string;
  expires_at: string;
  message_count: number;
  messages: ChatMessagePayload[];
}

export interface SSEProgressEvent {
  step_name: string;
  duration_ms?: number;
  status: string;
  details?: Record<string, any>;
}

export interface SSETokenEvent {
  delta: string;
}

export interface SSEErrorEvent {
  code: string;
  message: string;
}
