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
    tagline: "Target Architecture: In-process ML routing and inspectable RAG (In Active Development)",
    role: "AI Product Engineer & Architect",
    year: "2026 (Planned)",
    technologies: [
      "Next.js 15",
      "FastAPI",
      "LangGraph",
      "ONNX Runtime",
      "Qdrant",
      "Neon PostgreSQL",
      "Groq",
      "OpenVoice V2",
    ],
    summary:
      "The planned AI assistant for this portfolio, designed to answer questions about Mahad's experience, projects, and architecture using strictly cited sources, bounded latency, and an inspectable execution trace.",
    problem:
      "Most portfolio assistants are superficial LLM wrappers over flat prompts, prone to hallucination, lacking latency predictability, and relying on unbudgeted cloud infrastructure.",
    architecture:
      "Target system topology: Queries route through an in-process ONNX classifier (< 5ms target latency) to predict intent and language without LLM calls. The LangGraph state machine will orchestrate hybrid retrieval from Qdrant and Neon PostgreSQL, stream responses via Server-Sent Events, and surface execution telemetry.",
    decisions: [
      "Target Decision: In-process ONNX model to eliminate LLM latency for intent classification.",
      "Target Decision: Neon PostgreSQL as operational source of truth; Qdrant as rebuildable vector index.",
      "Target Decision: Isolated voice generation container with browser speech synthesis fallback.",
      "Operational Constraint: Strict adherence to permanent free-tier quotas ($0.00/mo operating cost target).",
    ],
    metrics: [
      { label: "Router Target", value: "< 5 ms (Target)" },
      { label: "Operating Budget", value: "$0.00 / mo (Target)" },
      { label: "Citation Standard", value: "100% Grounded" },
      { label: "Current Status", value: "Phases 3–8 Roadmap" },
    ],
    githubUrl: "https://github.com/mahadbaig2/mahad-ai-portfolio",
    liveUrl: "/chat",
  },
  {
    slug: "enterprise-rag-evaluation-platform",
    title: "Enterprise RAG & Evaluation Pipeline",
    tagline: "RAG infrastructure with automated offline retrieval evaluation and CI regression gates",
    role: "AI Product Engineer",
    year: "2025",
    technologies: [
      "Python",
      "Qdrant",
      "LangSmith",
      "MLflow",
      "FastAPI",
      "Docker",
    ],
    summary:
      "An automated ingestion, chunking, and evaluation pipeline that measures Hit@K, MRR, and groundedness before promoting indexing runs.",
    problem:
      "Enterprises struggle with 'silent RAG drift' where document updates degrade retrieval precision without immediate detection until users encounter inaccurate answers.",
    architecture:
      "Deterministic normalization pipeline computing SHA-256 content hashes. Multi-stage evaluation suite running automated synthetic and gold-standard queries through LangSmith to block pull requests on citation regressions.",
    decisions: [
      "Heading-aware semantic chunking with strict 350-500 token windows.",
      "Atomic collection blue/green versioning in Qdrant before deactivating old indices.",
      "Automatic redaction of sensitive internal data before logging traces.",
    ],
    metrics: [
      { label: "Hit@5", value: "94.2%" },
      { label: "Mean Reciprocal Rank", value: "0.88" },
      { label: "Ingestion Speed", value: "1.2k docs/min" },
    ],
    githubUrl: "https://github.com/mahadbaig2/mahad-ai-portfolio",
  },
  {
    slug: "llm-gateway-semantic-cache",
    title: "Intelligent LLM Gateway & Semantic Caching",
    tagline: "High-throughput API gateway with semantic vector caching and multi-provider fallback",
    role: "AI Product Engineer",
    year: "2024",
    technologies: [
      "FastAPI",
      "Redis Vector",
      "OpenAI",
      "Groq",
      "Prometheus",
    ],
    summary:
      "A resilient proxy gateway that reduced LLM API spend by 38% through cosine-similarity semantic caching and automatic rate-limit failover across providers.",
    problem:
      "High LLM API expenses, strict rate limits, and latency spikes caused frequent downtime for high-volume customer-facing AI features.",
    architecture:
      "Inbound requests are embedded and queried against an in-memory vector cache with a strict 0.96 cosine threshold. Cache misses route through dynamic priority queues with exponential backoff and circuit breaking.",
    decisions: [
      "Strict semantic similarity threshold to avoid serving subtly different cached responses.",
      "Asynchronous cache population to prevent adding latency to first-time queries.",
    ],
    metrics: [
      { label: "Cost Reduction", value: "38%" },
      { label: "Cache Hit Latency", value: "18 ms" },
      { label: "Uptime", value: "99.98%" },
    ],
  },
  {
    slug: "evzino", title: "Evzino", tagline: "Fitness journeys, live classes and coaching in one product", role: "Product team", year: "2026",
    technologies: ["Next.js", "React", "Supabase", "Stripe"],
    summary: "Evzino brings onboarding, live-class booking, coaching and checkout into a connected fitness experience. The repository includes product flows for members and coaches.",
    problem: "Fitness journeys often break between sign-up, guidance, booking and payment.",
    architecture: "The Next.js application includes onboarding, class reservation, member authentication, checkout and coach-facing routes.",
    decisions: ["Keep the member journey connected across onboarding and booking.", "Provide distinct flows for members and coaches."], metrics: [], githubUrl: "https://github.com/asadnaqvii/Evzino-Web",
  },
  {
    slug: "marketing-os", title: "Marketing OS", tagline: "Growth analytics and an AI ad lab across products", role: "Product team", year: "2026",
    technologies: ["Next.js", "Supabase", "React", "AI"],
    summary: "A product-keyed growth workspace that brings acquisition, funnel, retention, referrals and campaign analysis together with an evidence-aware AI assistant and ad lab. Evzino is its first connected product.",
    problem: "Growth decisions need a shared view of spend, activation, retention and reliable data.",
    architecture: "Next.js routes read from a separate Supabase database. Role checks guard reports, while the assistant uses dashboard reports and cannot mutate data.",
    decisions: ["Keep each product's data separated by product key.", "Gate AI recommendations on supplied evidence and human review."], metrics: [], githubUrl: "https://github.com/asadnaqvii/marketingOS",
  },
  {
    slug: "freqtrade", title: "Freqtrade Implementation", tagline: "A cryptocurrency trading automation playground", role: "Project contributor", year: "2026",
    technologies: ["Python", "Freqtrade"],
    summary: "An implementation of Freqtrade with strategy configuration, backtesting, risk controls, dry-run trading and a dashboard. It is presented as an experimentation project, not investment performance evidence.",
    problem: "Trading strategies need a controlled path from configuration to historical testing and paper trading.",
    architecture: "Python setup and configuration tools wrap Freqtrade strategies, exchange settings and monitoring.",
    decisions: ["Document dry-run as the recommended first mode.", "Separate backtesting and live trading paths."], metrics: [], githubUrl: "https://github.com/asadnaqvii/Freqtrade-implementation",
  },
  {
    slug: "alder-legal", title: "Alder Legal", tagline: "A connected legal operations workspace", role: "Product team", year: "2026",
    technologies: ["Next.js", "FastAPI", "Supabase", "LangGraph"],
    summary: "Presented as Alder Legal, this controlled pilot connects client intake, staff workflows, a WhatsApp inbox and scoped AI assistance. The portfolio demonstration uses mock data; pilot capabilities and remaining acceptance work are kept distinct.",
    problem: "Legal intake and follow-up can scatter conversations, ownership and next actions across tools.",
    architecture: "A Next.js interface and FastAPI service connect Supabase records, a private knowledge index and carefully bounded assistant workflows.",
    decisions: ["Escalate unknown questions and legal advice to staff.", "Keep synthetic demonstration data separate from real client records."], metrics: [], githubUrl: "https://github.com/mahadbaig2/sak_os",
  },
];

export const ARTICLES: Article[] = [
  {
    slug: "architecting-an-intentionally-over-engineered-portfolio",
    title: "Architecting an Intentionally Over-Engineered AI Portfolio on Free-Tier Cloud",
    publishedAt: "September 2026",
    readingTime: "6 min read",
    summary:
      "Why I built a production-grade AI system with in-process ONNX routing, Qdrant vector retrieval, and LangGraph orchestration — while strictly spending $0.00 on hosting.",
    topics: ["Architecture", "System Design", "Zero-Cost Ops", "RAG"],
    content: [
      "Most developer portfolios are static showcases of links and screenshots. When AI is included, it is almost always a superficial wrapper around an OpenAI API call with a hardcoded prompt.",
      "I wanted to build something fundamentally different: an intentionally over-engineered demonstrable AI system that proves end-to-end AI Product Engineering capabilities under real-world constraints.",
      "The primary constraint: strictly zero recurring hosting costs. Achieving this required thoughtful architectural separation. The Next.js frontend runs on Cloudflare Pages. The FastAPI orchestrator runs on Hugging Face CPU Basic. PostgreSQL runs serverless on Neon with auto-suspend. Vectors reside in Qdrant Cloud. Speech transcription and LLM inference run on Groq free tier.",
      "By decoupling storage, retrieval, orchestration, and generation into clean failure domains, the system achieves sub-second response times, complete inspectability, and total financial safety.",
    ],
  },
  {
    slug: "in-process-ml-routing-without-llm-overhead",
    title: "In-Process ML Routing: Sub-5ms Query Classification Without LLM Overhead",
    publishedAt: "August 2026",
    readingTime: "5 min read",
    summary:
      "How serving a custom query router with ONNX Runtime in FastAPI eliminates 500ms of latency, preserves API quotas, and detects Roman Urdu with high confidence.",
    topics: ["Machine Learning", "ONNX", "FastAPI", "Latency"],
    content: [
      "Using a large language model to decide whether an input requires an LLM is a common anti-pattern in modern AI agent architecture. It introduces 300 to 800 milliseconds of latency, burns rate-limit tokens, and creates non-deterministic routing.",
      "For 'Talk to Mahad', I trained a compact classifier to output four critical attributes: user intent, processing route (deterministic, RAG, clarify, refuse), answerability, and detected language (English vs Roman Urdu).",
      "Exporting the champion model to ONNX and serving it in-process with onnxruntime allows the FastAPI backend to make routing decisions in under 5 milliseconds on basic CPU hardware.",
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
