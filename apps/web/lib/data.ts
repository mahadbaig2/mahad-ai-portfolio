export interface Project {
  slug: string;
  title: string;
  tagline: string;
  role: string;
  year: string;
  technologies: string[];
  summary: string;
  problem: string;
  architecture: string;
  decisions: string[];
  metrics: { label: string; value: string }[];
  liveUrl?: string;
  githubUrl?: string;
}

export interface Article {
  slug: string;
  title: string;
  publishedAt: string;
  readingTime: string;
  summary: string;
  topics: string[];
  content: string[];
}

export const PROJECTS: Project[] = [
  {
    slug: "talk-to-mahad",
    title: "Talk to Mahad — Grounded AI Assistant",
    tagline: "In-process ML routing and inspectable RAG",
    role: "AI Product Engineer & Architect",
    year: "2026",
    technologies: [
      "Next.js 15",
      "FastAPI",
      "LangGraph",
      "ONNX Runtime",
      "Qdrant",
      "Neon PostgreSQL",
      "Groq",
      "ElevenLabs",
    ],
    summary:
      "This portfolio assistant routes questions through an ONNX classifier and uses cited retrieval for factual answers. The frontend, API, and model are implemented; production availability and source coverage are still being verified.",
    problem:
      "A portfolio assistant needs to distinguish simple navigation from factual questions and show where its answers came from.",
    architecture:
      "An in-process ONNX classifier recommends a route. LangGraph coordinates deterministic responses or retrieval from Qdrant vectors hydrated from Neon PostgreSQL. The chat page streams responses and displays execution steps.",
    decisions: [
      "Serve the ONNX classifier in the API process.",
      "Keep Neon PostgreSQL as the canonical source and Qdrant as a rebuildable vector index.",
      "Keep text chat available when voice or a provider is unavailable.",
    ],
    metrics: [],
    githubUrl: "https://github.com/mahadbaig2/mahad-ai-portfolio",
    liveUrl: "/chat",
  },
  {
    slug: "enterprise-rag-evaluation-platform",
    title: "Enterprise RAG & Evaluation Pipeline",
    tagline: "RAG evaluation architecture concept",
    role: "",
    year: "",
    technologies: [
      "Python",
      "Qdrant",
      "LangSmith",
      "MLflow",
      "FastAPI",
      "Docker",
    ],
    summary:
      "An architecture concept for ingestion, chunking and retrieval evaluation. This entry does not report measured results.",
    problem:
      "Enterprises struggle with 'silent RAG drift' where document updates degrade retrieval precision without immediate detection until users encounter inaccurate answers.",
    architecture:
      "The proposed flow uses content hashes to detect changes and retrieval evaluations before index promotion.",
    decisions: [
      "Evaluate heading-aware semantic chunking.",
      "Plan versioned Qdrant collections before deactivating old indices.",
      "Plan redaction of sensitive data before logging traces.",
    ],
    metrics: [],
    githubUrl: "https://github.com/mahadbaig2/mahad-ai-portfolio",
  },
  {
    slug: "llm-gateway-semantic-cache",
    title: "Intelligent LLM Gateway & Semantic Caching",
    tagline: "Semantic cache and provider fallback concept",
    role: "",
    year: "",
    technologies: [
      "FastAPI",
      "Redis Vector",
      "OpenAI",
      "Groq",
      "Prometheus",
    ],
    summary:
      "A design exploration for a gateway with semantic caching and provider fallback. No cost or uptime result is claimed.",
    problem:
      "High LLM API expenses, strict rate limits, and latency spikes caused frequent downtime for high-volume customer-facing AI features.",
    architecture:
      "The proposed gateway checks a vector cache before calling a provider and would use bounded retries for failures.",
    decisions: [
      "Set a conservative similarity threshold before using cached responses.",
      "Evaluate asynchronous cache population to limit latency on misses.",
    ],
    metrics: [],
  },
  {
    slug: "evzino", title: "Evzino", tagline: "Fitness journeys, live classes and coaching in one product", role: "", year: "",
    technologies: ["Next.js", "React", "Supabase", "Stripe"],
    summary: "Evzino brings onboarding, live-class booking, coaching and checkout into a connected fitness experience. The repository includes product flows for members and coaches.",
    problem: "Fitness journeys often break between sign-up, guidance, booking and payment.",
    architecture: "The Next.js application includes onboarding, class reservation, member authentication, checkout and coach-facing routes.",
    decisions: ["Keep the member journey connected across onboarding and booking.", "Provide distinct flows for members and coaches."], metrics: [],
  },
  {
    slug: "marketing-os", title: "Marketing OS", tagline: "Growth analytics and an AI ad lab across products", role: "", year: "",
    technologies: ["Next.js", "Supabase", "React", "AI"],
    summary: "A product-keyed growth workspace that brings acquisition, funnel, retention, referrals and campaign analysis together with an evidence-aware AI assistant and ad lab. Evzino is its first connected product.",
    problem: "Growth decisions need a shared view of spend, activation, retention and reliable data.",
    architecture: "Next.js routes read from a separate Supabase database. Role checks guard reports, while the assistant uses dashboard reports and cannot mutate data.",
    decisions: ["Keep each product's data separated by product key.", "Gate AI recommendations on supplied evidence and human review."], metrics: [],
  },
  {
    slug: "freqtrade", title: "Freqtrade Implementation", tagline: "A cryptocurrency trading automation playground", role: "", year: "",
    technologies: ["Python", "Freqtrade"],
    summary: "An implementation of Freqtrade with strategy configuration, backtesting, risk controls, dry-run trading and a dashboard. It is presented as an experimentation project, not investment performance evidence.",
    problem: "Trading strategies need a controlled path from configuration to historical testing and paper trading.",
    architecture: "Python setup and configuration tools wrap Freqtrade strategies, exchange settings and monitoring.",
    decisions: ["Document dry-run as the recommended first mode.", "Separate backtesting and live trading paths."], metrics: [],
  },
  {
    slug: "alder-legal", title: "Alder Legal", tagline: "A connected legal operations workspace", role: "", year: "",
    technologies: ["Next.js", "FastAPI", "Supabase", "LangGraph"],
    summary: "A controlled pilot for intake, staff workflows, WhatsApp and scoped AI assistance. This portfolio demonstration uses mock data; acceptance work remains.",
    problem: "Legal intake and follow-up can scatter conversations, ownership and next actions across tools.",
    architecture: "A Next.js interface and FastAPI service connect Supabase records, a private knowledge index and carefully bounded assistant workflows.",
    decisions: ["Escalate unknown questions and legal advice to staff.", "Keep synthetic demonstration data separate from real client records."], metrics: [],
  },
];

export const ARTICLES: Article[] = [
  {
    slug: "architecting-an-intentionally-over-engineered-portfolio",
    title: "Architecting an AI Portfolio With Free-Tier Constraints",
    publishedAt: "September 2026",
    readingTime: "6 min read",
    summary:
      "The design of an AI portfolio with in-process ONNX routing, Qdrant retrieval, LangGraph orchestration and a zero-recurring-cost target.",
    topics: ["Architecture", "System Design", "Zero-Cost Ops", "RAG"],
    content: [
      "Most developer portfolios are static showcases of links and screenshots. When AI is included, it is almost always a superficial wrapper around an OpenAI API call with a hardcoded prompt.",
      "I designed this site to demonstrate the engineering behind an assistant, including its routing, retrieval, citations and failure handling.",
      "The architecture separates the static Next.js frontend, FastAPI orchestration, Neon source data, Qdrant vectors and Groq generation. Free-tier operation is a design target; service quotas and public deployment still require verification.",
      "A visitor can inspect the assistant's route and sources when the connected services are available. The interface remains usable when the assistant is unavailable.",
    ],
  },
  {
    slug: "in-process-ml-routing-without-llm-overhead",
    title: "In-Process ML Routing Without an LLM Call",
    publishedAt: "August 2026",
    readingTime: "5 min read",
    summary:
      "How an ONNX query router recommends a route before retrieval or generation, and where a safe fallback is still needed.",
    topics: ["Machine Learning", "ONNX", "FastAPI", "Latency"],
    content: [
      "A separate LLM routing call adds network latency and uses provider quota before the assistant begins answering.",
      "For 'Talk to Mahad', I trained a compact classifier to output four critical attributes: user intent, processing route (deterministic, RAG, clarify, refuse), answerability, and detected language (English vs Roman Urdu).",
      "The champion model is exported to ONNX and loaded once by the FastAPI process. Its latency needs to be measured in the target deployment before making a public speed claim.",
      "When confidence is high, deterministic lookups (e.g. contact links or navigation commands) return instantly with zero LLM calls. RAG queries retrieve precisely the right context. Low-confidence queries trigger safe clarification boundaries.",
    ],
  },
  {
    slug: "dual-observability-mlflow-and-langsmith",
    title: "Dual Observability: Pairing MLflow with LangSmith for Full-Lifecycle AI Systems",
    publishedAt: "July 2026",
    readingTime: "7 min read",
    summary:
      "Separating classical ML experiment tracking from runtime LLM graph tracing to achieve comprehensive system visibility without vendor lock-in.",
    topics: ["MLOps", "LLMOps", "MLflow", "LangSmith", "Evaluation"],
    content: [
      "Engineering modern AI products requires two distinct observability paradigms: classical ML lifecycle management (dataset splits, feature extraction, model metrics) and generative runtime tracing (multi-step graph executions, retrieval scores, token streams).",
      "Trying to shoehorn both into a single tool results in blind spots. MLflow excels at tracking model parameters, classification confusion matrices, and model artifact registries.",
      "LangSmith excels at runtime trace hierarchies, evaluating retrieval relevance against gold-standard QA pairs, and monitoring hallucination rates.",
      "By establishing a clean boundary — MLflow for model development and LangSmith for runtime evaluation — we ensure every decision is backed by measurable empirical evidence.",
    ],
  },
];
