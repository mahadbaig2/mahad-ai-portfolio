# Mahad AI Portfolio - Sanity CMS Content Pack

Prepared for manual entry into Sanity. Content review date: **2026-09-08**.

## Read before entering content

- `TBD - Mahad confirmation required` means the public evidence was insufficient or conflicting. Do not publish that field until confirmed.
- Do not upload a generic architecture diagram to every project. Use a real screenshot as the hero image and add topology only when the system has meaningful architecture.
- Projects provide scannable facts. Case Studies explain process, reasoning and trade-offs.
- INDKOM is marked restricted and excluded from RAG until the client approves public disclosure.
- CardioScan is an academic proof of concept, not a clinically validated medical system.
- AQL is described as a prototype/concept because its public repository does not yet substantiate every planned capability.
- Legal AI is provisionally dated **2025** because its repository was created in September 2025. The résumé says October 2024. Mahad must confirm the correct project date.
- Suggested image filenames are guidance only. Upload the actual approved files and replace `TBD` values before publishing.

---

# PART A - PROJECT RECORDS

## Project 1 - Mahad AI Product Engineering Portfolio

**Project Title**  
Mahad AI Product Engineering Portfolio

**Slug**  
`mahad-ai-portfolio`

**Subtitle / One-line Summary**  
An AI-native portfolio designed as an inspectable product, combining managed content, agentic RAG, ML routing, evaluation and personalized voice.

**Client / Organization**  
Independent / Personal Project

**Year**  
2026 - Present

**Role / Focus**  
AI Product Engineer, Product Designer and System Architect

**Featured Project**  
Yes

**Hero Image**  
Upload an approved screenshot of the portfolio homepage. Suggested filename: `mahad-ai-portfolio-home.svg` or a high-resolution WebP/PNG.

**Alt Text**  
Minimal black-and-white homepage of Mahad Baig's AI Product Engineering portfolio.

**Project Overview**  
This portfolio is being built as a working demonstration of AI Product Engineering rather than a static collection of screenshots. The public website presents Mahad's work, experience and writing, while the planned Talk to Mahad assistant will answer questions using approved portfolio content and expose the sources behind its responses.

The system is intentionally more sophisticated than a typical portfolio because each layer demonstrates a production concern: Sanity manages editable source content, PostgreSQL stores canonical operational records, Qdrant provides rebuildable vector retrieval, a compact in-process ML model routes queries before an LLM is called, and LangGraph coordinates bounded AI workflows. MLflow is planned for the classifier lifecycle, while LangSmith will trace and evaluate retrieval and agent behavior. Voice is isolated from chat so speech failure cannot take down the core assistant.

Current implementation includes the scope and milestone system, architecture decision records, monorepo foundation, minimal Next.js portfolio pages, Sanity schemas and CMS integration work. The AI backend, ingestion pipeline, vector retrieval, classifier, agent workflow and voice services remain roadmap items until their respective milestones pass verification.

**Architecture Diagram / Topology**  
Upload the approved target architecture SVG after matching it against the latest ADRs. Suggested flow: `Next.js Web -> FastAPI -> ML Router -> LangGraph -> Retrieval/Tools -> Groq`, with `Sanity -> Ingestion -> Neon PostgreSQL + Qdrant`, and a separately isolated voice service.

**Alt Text**  
Target architecture showing the Next.js portfolio, Sanity content pipeline, FastAPI and LangGraph assistant, PostgreSQL records, Qdrant retrieval, ML routing, observability and isolated voice service.

**Caption / Architecture Summary**  
Target architecture for an inspectable, cost-bounded portfolio assistant. Sanity owns authored content, PostgreSQL owns canonical operational data, Qdrant acts as a rebuildable vector index, and LangGraph coordinates the assistant workflow.

**Key Quantitative Results / Metrics**

- 4 target audiences: recruiters, engineers, founders and general visitors.
- 8 architecture decisions documented before AI feature implementation.
- 0 paid-overage services permitted by the project contract.
- Current status: CMS phase in progress; AI, retrieval and voice metrics are not yet available.

**Key Technical Decisions**

- Separate authored content, canonical operational records and vector search instead of treating the vector database as the source of truth.
- Use offline, deterministic and idempotent ingestion rather than embedding content during visitor requests.
- Benchmark rules and TF-IDF before training a transformer router; export the selected model to ONNX only if it earns the added complexity.
- Use LangGraph for explicit typed state and bounded recovery, not open-ended agent conversations.
- Use MLflow for the ML classifier lifecycle and LangSmith for LLM and agent observability.
- Keep voice in a separate failure domain and preserve text chat as the core interface.
- Design around hard free-tier limits and graceful degradation so the portfolio remains usable when AI services are unavailable.

**Technology Stack**  
Next.js, React, TypeScript, Tailwind CSS, Sanity, FastAPI, Python, PostgreSQL, Neon, Qdrant, LangGraph, LangSmith, MLflow, ONNX Runtime, Groq, Whisper, OpenVoice V2, Docker, GitHub Actions, Cloudflare, Hugging Face Spaces

**Live Demo URL**  
TBD - add after deployment.

**Source Code / Repository URL**  
https://github.com/mahadbaig2/mahad-ai-portfolio

**Enable RAG Indexing**  
Yes

**Target Audiences**  
Recruiters & Talent Acquisition; AI & Software Engineers; Founders & Product Leaders; General Visitors

**Sensitivity Level**  
Public (Safe for external queries)

**Source Citation Label**  
Portfolio Project: Mahad AI Product Engineering Portfolio

**Canonical URL / Path**  
`/work/mahad-ai-portfolio`

**Content Review Date**  
2026-09-08

**Publish Status**  
Published, but retain explicit “In Development” labels on unfinished capabilities.

---

## Project 2 - CardioScan AI

**Project Title**  
CardioScan AI

**Slug**  
`cardioscan-ai`

**Subtitle / One-line Summary**  
An academic clinical decision-support prototype for analyzing paired stress and rest myocardial perfusion images.

**Client / Organization**  
KIET - Bachelor of Science in Computer Science Final Year Project

**Year**  
2025 - 2026

**Role / Focus**  
AI/ML Engineer, Full-Stack Developer and Product Designer; team project

**Featured Project**  
Yes

**Hero Image**  
Upload an approved dashboard or results-screen screenshot. Suggested filename: `cardioscan-ai-dashboard.webp`.

**Alt Text**  
CardioScan AI dashboard for uploading paired stress and rest myocardial perfusion images and reviewing model-assisted results.

**Project Overview**  
CardioScan AI is a full-stack academic proof of concept exploring automated analysis of paired stress and rest myocardial perfusion imaging scans. It combines a clinical dashboard with a separate TensorFlow inference service, vessel-aware probability outputs, risk tiers, generated clinical-style reports and persistent scan history.

The machine-learning pipeline compares VGG16, ResNet50V2 and DenseNet121 transfer-learning backbones. Stress and rest RGB images are combined into a six-channel input, processed by the available models, and averaged for an ensemble result. The application maps outputs to LAD, LCX and RCA coronary territories. A Groq-powered report generator transforms model outputs and patient context into a structured report, with a deterministic rule-based fallback when the LLM is unavailable.

This project is not clinically validated, is not a medical device and must not be used as a substitute for professional diagnosis. The repository intentionally documents limitations including missing model weights, heuristic fallbacks, limited single-source data, lack of external validation and inconsistent historical performance figures that require revalidation.

**Architecture Diagram / Topology**  
Upload an SVG showing: `Stress/Rest Images -> Next.js Dashboard -> Prediction API -> FastAPI -> VGG16/ResNet50V2/DenseNet121 -> Ensemble/Risk Tiers -> Groq or Rule-Based Report -> Supabase -> Results Dashboard`.

**Alt Text**  
CardioScan AI architecture showing paired MPI uploads, Next.js and FastAPI services, three TensorFlow models, ensemble inference, report generation and Supabase persistence.

**Caption / Architecture Summary**  
Paired stress and rest images are validated by the web layer, processed by an isolated TensorFlow service, combined into an ensemble output and converted into a structured report with a deterministic fallback.

**Key Quantitative Results / Metrics**

- 724 original paired samples reported in the research dataset.
- 2,000 paired samples after augmentation, split into 1,400 training, 300 validation and 300 test samples.
- 3 transfer-learning backbones compared: VGG16, ResNet50V2 and DenseNet121.
- 3 coronary territories represented: LAD, LCX and RCA.
- 47 studies included in the PRISMA-guided review covering 2015-2025.
- Do not publish AUC or accuracy claims until original evaluation artifacts are revalidated.

**Key Technical Decisions**

- Model paired stress and rest images as a six-channel input instead of treating each scan as unrelated.
- Compare multiple pretrained CNN backbones and expose individual model outputs alongside the ensemble.
- Separate the TensorFlow inference service from the Next.js application for independent deployment.
- Use a deterministic rule-based reporting fallback when Groq is unavailable.
- Persist scans and reports in Supabase while retaining a local browser fallback for demonstration.
- Clearly label the application as an academic prototype and document privacy, authorization and clinical-validation gaps.

**Technology Stack**  
Next.js 15, React 19, TypeScript, Tailwind CSS, Python, FastAPI, TensorFlow, Keras, VGG16, ResNet50V2, DenseNet121, NumPy, Pillow, Groq, Llama 3.3 70B, Supabase, PostgreSQL, Hugging Face Spaces, Docker

**Live Demo URL**  
https://fyp-web-deployement.vercel.app/

**Source Code / Repository URL**  
https://github.com/mahadbaig2/fyp-web-depolyement

**Enable RAG Indexing**  
Yes

**Target Audiences**  
Recruiters & Talent Acquisition; AI & Software Engineers; Founders & Product Leaders; General Visitors

**Sensitivity Level**  
Public (Safe for external queries)

**Source Citation Label**  
Project: CardioScan AI Academic Prototype

**Canonical URL / Path**  
`/work/cardioscan-ai`

**Content Review Date**  
2026-09-08

**Publish Status**  
Published

---

## Project 3 - Verdict AI

**Project Title**  
Verdict AI - Product and Feedback Intelligence

**Slug**  
`verdict-ai`

**Subtitle / One-line Summary**  
An AI-assisted workspace that turns qualitative user feedback into structured themes and actionable product signals.

**Client / Organization**  
Independent Project

**Year**  
2026

**Role / Focus**  
AI Product Engineer and Product Designer

**Featured Project**  
No

**Hero Image**  
Upload an approved screenshot of the deployed interface. Suggested filename: `verdict-ai-dashboard.webp`.

**Alt Text**  
Verdict AI interface presenting structured themes and insights extracted from qualitative product feedback.

**Project Overview**  
Verdict AI explores how AI can help product teams synthesize qualitative feedback without reducing research to a generic summary. The product is designed to extract recurring signals, group related observations and present structured insights that support prioritization and product decisions.

The main product challenge is preserving traceability between an insight and the feedback that produced it. The prototype focuses on signal extraction and reducing noise, while keeping the result useful to a product practitioner rather than producing a long block of generated text. It is a portfolio prototype, not a validated replacement for user research or human product judgment.

**Architecture Diagram / Topology**  
Upload only after validating the current repository. Suggested conceptual flow: `Feedback Input -> Validation and Normalization -> AI Analysis -> Theme/Signal Extraction -> Structured Insight View`.

**Alt Text**  
Conceptual Verdict AI flow from qualitative feedback ingestion through AI-assisted theme extraction to structured product insights.

**Caption / Architecture Summary**  
Verdict AI converts unstructured feedback into organized product signals while keeping the interface focused on evidence, themes and actions.

**Key Quantitative Results / Metrics**

- No verified benchmark or user-outcome metric is currently available.
- Add evaluation coverage, dataset size and extraction quality only after running a reproducible benchmark.

**Key Technical Decisions**

- Structure output around themes, signals and actions rather than a single free-form summary.
- Treat AI output as decision support, not an automated product verdict.
- Keep unsupported quantitative claims out of the public project until evaluation data exists.

**Technology Stack**  
Next.js, React, TypeScript, AI/LLM Integration

**Live Demo URL**  
https://verdict-ai-phi.vercel.app

**Source Code / Repository URL**  
https://github.com/mahadbaig2/verdict_ai

**Enable RAG Indexing**  
Yes

**Target Audiences**  
Recruiters & Talent Acquisition; Founders & Product Leaders; General Visitors

**Sensitivity Level**  
Public (Safe for external queries)

**Source Citation Label**  
Project: Verdict AI Product and Feedback Intelligence

**Canonical URL / Path**  
`/work/verdict-ai`

**Content Review Date**  
2026-09-08

**Publish Status**  
Published

---

## Project 4 - Legal AI

**Project Title**  
Legal AI - Contract Understanding Assistant

**Slug**  
`legal-ai`

**Subtitle / One-line Summary**  
A retrieval-based assistant for exploring legal documents through conversational questions, clause extraction and summaries.

**Client / Organization**  
Independent Project

**Year**  
2025 - provisional; Mahad must resolve the résumé/repository date conflict.

**Role / Focus**  
AI Engineer and Full-Stack Developer

**Featured Project**  
No

**Hero Image**  
Upload an approved application screenshot. Suggested filename: `legal-ai-contract-analysis.webp`.

**Alt Text**  
Legal AI interface for uploading a contract and asking grounded questions about its clauses and contents.

**Project Overview**  
Legal AI is a document-understanding prototype designed to make dense contracts and agreements easier to explore. Users upload a legal document, which is processed into searchable context. They can then ask natural-language questions, identify important clauses and request clearer summaries.

The application combines LangChain-based orchestration, FAISS vector retrieval and Groq's Mixtral-family language model. Retrieval narrows the context supplied to the LLM so answers can focus on the uploaded document instead of relying entirely on general model knowledge. The product is an educational prototype and does not provide legal advice. Any interpretation must be verified by a qualified legal professional.

**Architecture Diagram / Topology**  
Suggested SVG: `Uploaded Document -> Text Extraction -> Chunking -> Embeddings -> FAISS Index -> Retriever -> LangChain Agent -> Groq Mixtral -> Cited/Structured Answer`.

**Alt Text**  
Legal AI retrieval architecture showing document extraction, chunking, embeddings, FAISS search, LangChain orchestration and Groq-generated answers.

**Caption / Architecture Summary**  
Documents are converted into searchable chunks and retrieved as context before the language model produces an answer.

**Key Quantitative Results / Metrics**

- No independently verified retrieval or answer-quality benchmark is currently published.
- Add document-size limits, retrieval Hit@K and groundedness scores only after reproducible evaluation.

**Key Technical Decisions**

- Use retrieval to constrain document questions instead of placing the complete document into every prompt.
- Use FAISS as a lightweight local vector index for the prototype.
- Separate legal information retrieval from legal advice and include an explicit professional-review disclaimer.
- Favor structured prompts for clause extraction and summarization.

**Technology Stack**  
Python, Streamlit, FastAPI, LangChain, FAISS, Groq, Mixtral, Embeddings, Retrieval-Augmented Generation

**Live Demo URL**  
TBD - no verified public deployment URL.

**Source Code / Repository URL**  
https://github.com/mahadbaig/Legal-AI

**Enable RAG Indexing**  
Yes

**Target Audiences**  
Recruiters & Talent Acquisition; AI & Software Engineers; Founders & Product Leaders; General Visitors

**Sensitivity Level**  
Public (Safe for external queries)

**Source Citation Label**  
Project: Legal AI Contract Understanding Assistant

**Canonical URL / Path**  
`/work/legal-ai`

**Content Review Date**  
2026-09-08

**Publish Status**  
Draft until project year and deployment status are confirmed.

---

## Project 5 - AQL Enterprise AI Workspace

**Project Title**  
AQL - Enterprise AI Workspace

**Slug**  
`aql-enterprise-ai-workspace`

**Subtitle / One-line Summary**  
A prototype for connecting enterprise knowledge and operational tools through permission-aware retrieval and bounded workflow agents.

**Client / Organization**  
Independent Startup Concept

**Year**  
2026

**Role / Focus**  
Founder, AI Product Engineer and Product Designer

**Featured Project**  
Yes

**Hero Image**  
Upload an approved workspace or architecture screenshot. Suggested filename: `aql-enterprise-workspace.webp`.

**Alt Text**  
AQL enterprise AI workspace showing connected knowledge, tasks and workflow assistance.

**Project Overview**  
AQL is an enterprise AI workspace concept built around a simple idea: company knowledge and operational actions should be accessible through one governed interface without ignoring the permissions of the source systems.

The MVP concept focuses on Google Drive, Notion and Jira. It separates responsibilities into a Knowledge Agent for permission-aware retrieval, a Task Agent for reading and updating Jira work, and a Workflow Agent for coordinating bounded cross-tool actions. A fine-tuned BGE-family reranker is part of the target retrieval design. The public repository currently demonstrates an early Next.js foundation, so advanced agent, permission and reranking capabilities must be presented as prototype goals until implementation and evaluation evidence are published.

**Architecture Diagram / Topology**  
Suggested SVG: `User -> AQL Workspace -> Orchestrator -> Knowledge Agent / Task Agent / Workflow Agent -> Google Drive / Notion / Jira`, with a permission filter before retrieval and action execution.

**Alt Text**  
AQL target architecture showing an orchestrator coordinating knowledge, task and workflow agents across Google Drive, Notion and Jira with permission checks.

**Caption / Architecture Summary**  
Target AQL architecture separates knowledge retrieval from operational actions and checks source-system permissions before returning content or executing a workflow.

**Key Quantitative Results / Metrics**

- 3 initial connector targets: Google Drive, Notion and Jira.
- 3 bounded agent roles: Knowledge, Task and Workflow.
- No verified retrieval, latency or user-impact benchmark is currently available.

**Key Technical Decisions**

- Preserve source-system permissions rather than copying all enterprise data into an unrestricted chatbot.
- Separate retrieval from actions so read-only questions do not receive unnecessary execution authority.
- Use bounded agents with explicit responsibilities instead of a single general agent.
- Treat reranking and connector support as roadmap capabilities until evaluation and integration tests exist.

**Technology Stack**  
Next.js, React, TypeScript, Python, FastAPI, LangGraph, LangChain, RAG, BGE Reranker, Vector Search, Google Drive API, Notion API, Jira API

**Live Demo URL**  
TBD - no verified public deployment URL.

**Source Code / Repository URL**  
https://github.com/mahadbaig2/enterprise_ai_workspace

**Enable RAG Indexing**  
Yes

**Target Audiences**  
Recruiters & Talent Acquisition; AI & Software Engineers; Founders & Product Leaders

**Sensitivity Level**  
Public (Safe for external queries)

**Source Citation Label**  
Project: AQL Enterprise AI Workspace Prototype

**Canonical URL / Path**  
`/work/aql-enterprise-ai-workspace`

**Content Review Date**  
2026-09-08

**Publish Status**  
Published as a prototype; planned capabilities must remain labelled.

---

## Project 6 - Busyfile

**Project Title**  
Busyfile - White-Label SaaS for Accounting Firms

**Slug**  
`busyfile`

**Subtitle / One-line Summary**  
A multi-stakeholder fintech platform that evolved from guided business formation into a white-label operating system for accounting firms.

**Client / Organization**  
Datawire / Mayatax

**Year**  
2024 - 2026

**Role / Focus**  
Senior Product Designer and Founding Designer; product strategy, research and delivery collaboration

**Featured Project**  
Yes

**Hero Image**  
Upload an approved Busyfile client dashboard image. Do not expose confidential customer data. Suggested filename: `busyfile-client-dashboard.webp`.

**Alt Text**  
Busyfile white-label client dashboard for business formation, bookkeeping, tax and compliance services.

**Project Overview**  
Busyfile began as a direct-to-consumer platform intended to make business formation, bookkeeping, tax and compliance services less intimidating for small business owners. As the product developed, the opportunity expanded into a B2B white-label platform that accounting firms could brand and offer to their own clients.

As the founding designer, Mahad led product design across both stages. The work included competitor and workflow research, entity-formation onboarding, service flows, a reusable design system, client experiences, firm dashboards, internal operations tooling and super-admin controls. Close collaboration with founders, operations managers, product stakeholders and engineers was necessary because the system connected client-facing simplicity with complex service delivery behind the scenes.

Busyfile grew beyond 500 screens and more than 20 services. Its scalable patterns allowed the design to expand across entity types, U.S. states and operational roles without making each new flow an isolated product.

**Architecture Diagram / Topology**  
Use a product topology rather than a software architecture diagram: `Firm Admin / Client / Internal Operations / Super Admin -> White-Label Platform -> Formation / Bookkeeping / Tax / Compliance Services`.

**Alt Text**  
Busyfile product topology connecting clients, accounting firms, internal operations and super administrators to more than twenty financial and compliance services.

**Caption / Architecture Summary**  
Busyfile combines a white-labelled client experience with firm administration, internal operations and centralized platform management.

**Key Quantitative Results / Metrics**

- 500+ screens designed across client, firm, operations and administrative experiences.
- 20+ business, tax, bookkeeping and compliance services represented in the platform.
- Flows designed to support business requirements across 52 U.S. states.
- Product evolved from a B2C MVP into Datawire's flagship B2B white-label platform.

**Key Technical Decisions**

- Build modular service and onboarding patterns instead of duplicating complete flows for every state and entity type.
- Create a shared design system to maintain consistency across a rapidly expanding product.
- Separate client simplicity from operational depth through role-specific dashboards.
- Rework the initial B2C foundation for multi-tenant white-label use instead of designing an unrelated second product.
- Validate flows with operations and business stakeholders, not only competitor research.

**Technology Stack**  
Figma, Design Systems, Interactive Prototyping, Enterprise SaaS, Multi-Tenant Product Design, Fintech, Product Strategy, User Research, Information Architecture

**Live Demo URL**  
TBD - include only if Datawire/Mayatax provides a publicly shareable URL.

**Source Code / Repository URL**  
Leave empty; proprietary client code is not public.

**Enable RAG Indexing**  
Yes, after verifying that every included fact is non-confidential.

**Target Audiences**  
Recruiters & Talent Acquisition; AI & Software Engineers; Founders & Product Leaders; General Visitors

**Sensitivity Level**  
Public (Safe for external queries), limited to approved portfolio information.

**Source Citation Label**  
Project: Busyfile White-Label Accounting SaaS

**Canonical URL / Path**  
`/work/busyfile`

**Content Review Date**  
2026-09-08

**Publish Status**  
Published

---

## Project 7 - Aurus Books

**Project Title**  
Aurus Books - Accounting and Bookkeeping SaaS MVP

**Slug**  
`aurus-books`

**Subtitle / One-line Summary**  
A complete fintech MVP design that translated a complex 50-page product vision into approachable financial workflows for SMBs.

**Client / Organization**  
KreativeFolks client project

**Year**  
2023 - 2024

**Role / Focus**  
Product Designer; discovery, competitive analysis, UX architecture and MVP design

**Featured Project**  
No

**Hero Image**  
Upload an approved Aurus Books dashboard or landing-page image. Suggested filename: `aurus-books-dashboard.webp`.

**Alt Text**  
Aurus Books accounting dashboard designed to simplify invoices, expenses, clients and financial tasks for small businesses.

**Project Overview**  
Aurus Books was designed as an approachable accounting and bookkeeping product for small and medium-sized businesses. The scope included a public landing page and a web application covering invoicing, expenses, client and vendor management, time tracking, CRM functions and a client dashboard.

The project began with an outdated requirements document, which created early rework. Once the complete 50-page product specification was provided, the information architecture and workflows were rebuilt around the actual scope. Competitive analysis of FreshBooks and related products helped identify common interaction patterns, while close client collaboration shaped the final MVP.

The design reached a complete MVP state but did not proceed into production. It should therefore be presented as a validated design deliverable and product foundation, not as a launched SaaS business.

**Architecture Diagram / Topology**  
Use an information-architecture SVG showing: `Dashboard -> Invoicing / Expenses / Clients and Vendors / Time Tracking / CRM / Client Portal / Reports`.

**Alt Text**  
Aurus Books information architecture connecting core accounting, customer management, time tracking and reporting modules.

**Caption / Architecture Summary**  
The MVP organized a broad accounting scope into connected workflows while keeping daily financial tasks understandable for small businesses.

**Key Quantitative Results / Metrics**

- 50-page requirements document translated into an MVP information architecture and interface.
- 1 landing page and a complete web-application design delivered.
- Project completed at MVP design stage and did not enter production.

**Key Technical Decisions**

- Rebuild the product structure after discovering the initial specification was outdated.
- Use established accounting interaction patterns where familiarity reduced user effort.
- Organize complex capabilities into task-oriented modules rather than mirroring the requirements document.
- State honestly that the product did not progress beyond MVP design.

**Technology Stack**  
Figma, Product Design, UX Research, Competitive Analysis, Wireframing, Interactive Prototyping, Fintech, Accounting SaaS, Information Architecture

**Live Demo URL**  
Leave empty; the product did not enter production.

**Source Code / Repository URL**  
Leave empty; no public repository.

**Enable RAG Indexing**  
Yes

**Target Audiences**  
Recruiters & Talent Acquisition; Founders & Product Leaders; General Visitors

**Sensitivity Level**  
Public (Safe for external queries)

**Source Citation Label**  
Project: Aurus Books Fintech SaaS MVP

**Canonical URL / Path**  
`/work/aurus-books`

**Content Review Date**  
2026-09-08

**Publish Status**  
Published

---

## Project 8 - LISPINE Website Redesign

**Project Title**  
LISPINE - Patient-Centered Healthcare Website

**Slug**  
`lispine-healthcare-website`

**Subtitle / One-line Summary**  
A healthcare website redesign that made complex spine-care information easier to navigate, understand and trust.

**Client / Organization**  
LISPINE, Long Island Spine Specialists

**Year**  
2024

**Role / Focus**  
UI/UX Designer; information architecture, responsive page design and implementation collaboration

**Featured Project**  
No

**Hero Image**  
Upload an approved homepage image from the case study. Suggested filename: `lispine-homepage-redesign.webp`.

**Alt Text**  
Redesigned LISPINE healthcare website with accessible navigation and reassuring spine-care information.

**Project Overview**  
LISPINE needed its website to better support patients searching for information about back, neck and spine care. Many visitors were older or anxious about treatment, so the redesign needed to communicate clinical credibility without making the experience intimidating.

Mahad joined after the homepage had already gone through several revisions and the project was behind schedule. Working with another designer, existing approved content and a defined style direction, he completed 34 inner pages and collaborated with developers on responsive implementation. When late client changes appeared, the team adjusted content and layouts directly in WordPress to keep delivery moving.

The published case study reports that bounce rate fell from 55% to 32% and conversions doubled after the redesign. These figures should remain attributed to the project case study rather than presented as independently audited analytics.

**Architecture Diagram / Topology**  
Use a sitemap/information-architecture diagram rather than a software topology: `Homepage -> Conditions -> Treatments -> Physicians -> Locations -> Patient Resources -> Consultation`.

**Alt Text**  
LISPINE website information architecture connecting conditions, treatments, physicians, locations, patient resources and consultation paths.

**Caption / Architecture Summary**  
The content hierarchy moved patients from symptoms and concerns toward understandable treatment information, trusted specialists and clear consultation actions.

**Key Quantitative Results / Metrics**

- 34 inner pages designed under a compressed delivery schedule.
- Bounce rate reported as improving from 55% to 32%.
- Conversion rate reported as doubling after the redesign.

**Key Technical Decisions**

- Prioritize reassurance, clarity and trust for an anxious healthcare audience.
- Reuse approved content and style foundations to recover a delayed project.
- Collaborate directly with developers and make controlled WordPress adjustments when late changes threatened delivery.
- Improve navigation and mobile responsiveness across a large healthcare content structure.

**Technology Stack**  
Figma, WordPress, Responsive Web Design, Healthcare UX, Information Architecture, UX Design, UI Design, Conversion-Focused Design

**Live Demo URL**  
https://www.lispine.com

**Source Code / Repository URL**  
Leave empty; no public repository.

**Enable RAG Indexing**  
Yes

**Target Audiences**  
Recruiters & Talent Acquisition; Founders & Product Leaders; General Visitors

**Sensitivity Level**  
Public (Safe for external queries)

**Source Citation Label**  
Project: LISPINE Patient-Centered Website Redesign

**Canonical URL / Path**  
`/work/lispine-healthcare-website`

**Content Review Date**  
2026-09-08

**Publish Status**  
Published

---

## Project 9 - INDKOM Marketing Automation

**Project Title**  
INDKOM - AI Marketing Automation System

**Slug**  
`indkom-marketing-automation`

**Subtitle / One-line Summary**  
A modular AI automation system connecting content generation, operational memory and publishing workflows.

**Client / Organization**  
INDKOM / SMVBasen.dk

**Year**  
2026

**Role / Focus**  
AI Automation Engineer and Workflow Designer

**Featured Project**  
No

**Hero Image**  
Do not upload until the client approves public use. If approved, use a redacted workflow overview with credentials, emails, customer data and internal prompts removed.

**Alt Text**  
Redacted n8n workflow for AI-assisted content generation, asset handling and WordPress publishing.

**Project Overview**  
This client engagement involved designing an AI-assisted marketing automation system around n8n. The delivered newsletter workflow connected structured inputs, LLM-based drafting, third-party services and publishing operations. The wider roadmap included social content automation, retrieval-based content memory and broader marketing workflow coordination.

The system used a self-hosted n8n environment on a Hostinger VPS and integrated Groq, Supabase, WordPress REST APIs and Cloudinary. The work also required operational documentation and safe handling of third-party credentials. Because the implementation belongs to a client, only approved high-level information should be published. Prompts, credentials, workflow exports and internal business logic must remain restricted unless written permission is provided.

**Architecture Diagram / Topology**  
Restricted. If approved: `User Input -> n8n Orchestrator -> Groq -> Supabase Memory -> Cloudinary Assets -> WordPress REST -> Review/Notification`.

**Alt Text**  
High-level architecture for an n8n marketing workflow connecting LLM generation, content memory, media management and WordPress publishing.

**Caption / Architecture Summary**  
The orchestrator coordinates generation, content memory, asset management and publishing while keeping third-party credentials outside workflow exports.

**Key Quantitative Results / Metrics**

- 1 newsletter agent delivered.
- 4-part implementation roadmap: newsletter, social, content memory and marketing automation.
- No verified time-saved, quality or ROI metric is approved for public release.

**Key Technical Decisions**

- Use n8n as the workflow orchestrator so non-code integrations remain inspectable and maintainable.
- Store content memory separately in Supabase instead of relying on prompt history alone.
- Use Cloudinary for managed media and WordPress REST for publication.
- Keep credentials out of exported workflow files and public documentation.
- Require human review for generated marketing content before publication.

**Technology Stack**  
n8n, Groq, Supabase, PostgreSQL, WordPress REST API, Cloudinary, Webhooks, REST APIs, Hostinger VPS, AI Automation

**Live Demo URL**  
Leave empty; private client system.

**Source Code / Repository URL**  
Leave empty; proprietary client workflow.

**Enable RAG Indexing**  
No, until the client approves the exact public content.

**Target Audiences**  
Recruiters & Talent Acquisition; Founders & Product Leaders

**Sensitivity Level**  
Internal / Restricted

**Source Citation Label**  
Restricted Project: INDKOM AI Marketing Automation

**Canonical URL / Path**  
`/work/indkom-marketing-automation`

**Content Review Date**  
2026-09-08

**Publish Status**  
Draft

---

# PART B - CASE STUDY RECORDS

## Case Study 1 - Building an AI-Native Portfolio

**Case Study Title**  
Building an AI-Native Portfolio as an Inspectable AI Product

**Slug**  
`building-mahad-ai-portfolio`

**Associated Project**  
Mahad AI Product Engineering Portfolio

**Executive Summary**  
Most portfolios describe completed work. This project turns the portfolio itself into evidence of AI Product Engineering. The public experience remains simple, but its target architecture demonstrates the complete lifecycle behind a production-oriented AI assistant: governed content, deterministic ingestion, hybrid persistence, vector retrieval, ML-based query routing, bounded agent orchestration, LLM evaluation, voice and graceful failure under strict cost constraints.

The project is being built through ordered milestones and manual gates. Current work covers the product contract, architecture records, monorepo, Next.js foundation and Sanity content layer. Later capabilities remain explicitly labelled as targets until implemented and verified.

**Context & Problem Statement**  
Mahad's career combines nearly six years of product design and UI/UX experience with more recent hands-on AI engineering. A conventional portfolio could show screenshots and list tools, but it would not prove the ability to connect product thinking, data, models, software architecture, evaluation and operations.

Adding a generic chatbot would not solve that problem. A résumé pasted into a system prompt would be difficult to maintain, easy to hallucinate from and nearly impossible for visitors to inspect. The real challenge was to design a portfolio that remained useful as a normal website while also serving as a credible technical system.

The product therefore needs to answer four questions: Can visitors understand Mahad's work quickly? Can deeper visitors inspect how the system works? Can the assistant ground claims in approved sources? Can the application remain safe and usable without uncapped infrastructure spending?

**Engineering Approach & Architecture**  
The architecture separates content, operational truth and retrieval. Sanity owns authored portfolio content. An offline ingestion pipeline will normalize approved documents, preserve structure, generate deterministic hashes, create heading-aware chunks and embed only changed content. Neon PostgreSQL will store canonical documents, chunks, versions and operational records. Qdrant will store the rebuildable vector index, with point IDs mapped back to PostgreSQL chunks.

FastAPI will expose the AI service. An in-process query router will classify requests before expensive generation. The plan begins with deterministic rules and TF-IDF, then compares a compact transformer and ONNX deployment only if evaluation justifies it. LangGraph will coordinate classification, retrieval, context checks, answer generation, citation validation and bounded recovery using typed state.

MLflow will track classifier datasets, experiments, metrics and model releases. LangSmith will trace prompts, retrieval, tools, latency and LLM evaluation. The web client will receive streamed events through SSE. Voice uses the same text assistant path, with transcription and synthesis isolated so voice failures do not affect chat.

**Quantitative Results & Benchmarks**

- 4 defined visitor segments.
- 8 architecture decisions recorded before feature implementation.
- Permanent operating-cost target: zero paid overage.
- Retrieval, classifier, agent, latency and voice benchmarks are pending implementation.

**Engineering Trade-offs & Unsuccessful Experiments**  
The project deliberately accepts additional architecture because demonstrating the lifecycle is part of the product goal. However, complexity must earn its place. PostgreSQL and Qdrant are both included because they have different responsibilities, not because two databases look impressive. A transformer router will not replace TF-IDF unless it materially improves the chosen evaluation metrics. Voice is delayed until text chat is reliable.

The first frontend implementation also exposed the value of milestone gates. Missing data connections, premature links, placeholder facts and incomplete validation meant the Phase 1 gate could not honestly be approved even though much of the interface existed. Those findings are treated as remediation work, not hidden as polish.

**Key Takeaways & Lessons Learned**

- A portfolio can demonstrate engineering only when claims are connected to inspectable evidence.
- Content governance must exist before RAG ingestion.
- Agentic workflows should combine deterministic and model-driven steps instead of making everything autonomous.
- A passed checklist is not a substitute for a passing build and manual review.
- Cost limits, service sleep and fallbacks are architecture requirements, not deployment footnotes.

**Enable RAG Indexing**  
Yes

**Target Audiences**  
Recruiters & Talent Acquisition; AI & Software Engineers; Founders & Product Leaders; General Visitors

**Sensitivity Level**  
Public (Safe for external queries)

**Source Citation Label**  
Case Study: Building the Mahad AI Product Engineering Portfolio

**Canonical URL / Path**  
`/work/mahad-ai-portfolio`

**Content Review Date**  
2026-09-08

**Publish Status**  
Published as a work in progress

---

## Case Study 2 - CardioScan AI

**Case Study Title**  
CardioScan AI: Building a Full-Stack MPI Analysis Research Prototype

**Slug**  
`cardioscan-ai-research-prototype`

**Associated Project**  
CardioScan AI

**Executive Summary**  
CardioScan AI is a final-year research prototype that combines paired stress and rest myocardial perfusion images, three transfer-learning CNN backbones, ensemble inference, a clinical dashboard and AI-assisted report generation. The work demonstrates an end-to-end ML product path from preprocessing and experimentation to an isolated inference API and web experience. It also documents the limits that prevent the prototype from being treated as a medical device.

**Context & Problem Statement**  
Myocardial perfusion imaging can provide evidence about blood flow to the heart under stress and rest conditions. The project explored whether paired images could support automated coronary artery disease risk analysis and more structured review. The challenge was not simply image classification. The system also needed to accept paired inputs, display individual and ensemble predictions, represent LAD, LCX and RCA territories, produce an understandable report and retain scan history.

The dataset was limited and single-source, and the application handled sensitive medical context. Those constraints made honest evaluation, privacy boundaries and clinical disclaimers as important as the interface.

**Engineering Approach & Architecture**  
The research compared VGG16, ResNet50V2 and DenseNet121. Stress and rest RGB images were resized to 224 by 224 and concatenated into a six-channel representation. Available model outputs were averaged into an ensemble and mapped to four application risk tiers. The broader methodology explored attention pooling, focal loss with label smoothing, class-aware oversampling, paired augmentation, MixUp and staged fine-tuning.

The web application uses Next.js and TypeScript. It forwards validated uploads to a FastAPI/TensorFlow service designed for Hugging Face Spaces. Supabase stores scan and report history when configured. Groq generates a structured clinical-style report from model and patient context, while a rule-based generator keeps the reporting flow available when the LLM fails.

**Quantitative Results & Benchmarks**

- 724 original paired samples; 2,000 pairs after reported augmentation.
- 1,400 training, 300 validation and 300 test pairs.
- 3 CNN backbones and one averaged ensemble path.
- 3 coronary territories and 4 application risk tiers.
- 47 studies in the PRISMA-guided review.
- Model quality metrics withheld pending reconciliation of original evaluation artifacts.

**Engineering Trade-offs & Unsuccessful Experiments**  
Transfer learning was necessary because the dataset was too small for training deep CNNs from scratch. Augmentation expanded the training material but did not replace real multi-center diversity. An ensemble provided a common output path, but averaging weak or poorly calibrated models does not guarantee a stronger result. Historical AUC figures were not consistent across project material, so they should not be marketed until recalculated from the original test artifacts.

The current service supports heuristic fallbacks when model files are unavailable. That is convenient for interface demonstrations but dangerous if confused with real inference, so the health endpoint and model source must remain visible. Native DICOM and NPY decoding, explainability and secure production authentication are also unfinished.

**Key Takeaways & Lessons Learned**

- Medical AI requires explicit separation between a research prototype and clinical evidence.
- A larger model architecture cannot compensate for limited, biased or inconsistent data.
- Fallbacks must identify themselves so demonstrations are never mistaken for real inference.
- Model evaluation, interface wording, privacy and deployment architecture are one product problem.
- External validation and calibrated clinical thresholds matter more than attractive dashboards.

**Enable RAG Indexing**  
Yes

**Target Audiences**  
Recruiters & Talent Acquisition; AI & Software Engineers; Founders & Product Leaders; General Visitors

**Sensitivity Level**  
Public (Safe for external queries)

**Source Citation Label**  
Case Study: CardioScan AI MPI Research Prototype

**Canonical URL / Path**  
`/work/cardioscan-ai`

**Content Review Date**  
2026-09-08

**Publish Status**  
Published

---

## Case Study 3 - Verdict AI

**Case Study Title**  
Verdict AI: Turning Qualitative Feedback into Product Signals

**Slug**  
`verdict-ai-product-feedback-intelligence`

**Associated Project**  
Verdict AI - Product and Feedback Intelligence

**Executive Summary**  
Verdict AI explores a recurring product problem: teams collect interviews, comments and feedback, but struggle to turn that material into evidence-backed themes and decisions. The prototype applies AI to organize qualitative input into clearer signals while preserving the principle that the model supports judgment rather than replacing it.

**Context & Problem Statement**  
Qualitative feedback is messy by nature. Different users describe the same issue in different language, loud opinions can overshadow recurring problems, and summaries often remove the evidence needed to trust them. A useful system must reduce reading effort without creating false certainty.

The design objective was therefore not “summarize this text.” It was to provide a workspace where product teams could move from raw input to themes, supporting observations and possible actions while still seeing the limits of the analysis.

**Engineering Approach & Architecture**  
The prototype uses a TypeScript and Next.js interface with an AI-analysis layer. Feedback is normalized before analysis, then converted into structured output designed around themes and product signals rather than a free-form essay. The deployed interface demonstrates the product direction, while the next engineering step would add stronger provenance between generated claims and individual evidence items.

A production version should add dataset versioning, schema-constrained outputs, traceable evidence IDs, human correction, clustering evaluation, prompt regression tests and explicit confidence or coverage indicators.

**Quantitative Results & Benchmarks**

- No verified product or model benchmark is currently published.
- Required future measures: evidence coverage, theme precision, duplicate-theme rate, human correction rate and task time compared with manual synthesis.

**Engineering Trade-offs & Unsuccessful Experiments**  
Free-form generation is fast to prototype but weak for downstream product use because outputs vary and cannot be compared reliably. Structured results improve consistency but can force ambiguous feedback into overly neat categories. Fully automated prioritization was rejected as a credible product claim because business impact, strategy and research quality cannot be inferred from text volume alone.

**Key Takeaways & Lessons Learned**

- Summarization and product insight are not the same task.
- Generated themes need visible supporting evidence.
- Product prioritization should remain a human decision.
- A serious evaluation must compare AI-assisted synthesis with a manual baseline.

**Enable RAG Indexing**  
Yes

**Target Audiences**  
Recruiters & Talent Acquisition; Founders & Product Leaders; General Visitors

**Sensitivity Level**  
Public (Safe for external queries)

**Source Citation Label**  
Case Study: Verdict AI Feedback Intelligence

**Canonical URL / Path**  
`/work/verdict-ai`

**Content Review Date**  
2026-09-08

**Publish Status**  
Published

---

## Case Study 4 - Legal AI

**Case Study Title**  
Legal AI: Retrieval-Augmented Contract Exploration

**Slug**  
`legal-ai-contract-exploration`

**Associated Project**  
Legal AI - Contract Understanding Assistant

**Executive Summary**  
Legal AI is a prototype for uploading contracts and asking natural-language questions about their contents. It uses document extraction, chunking, embeddings, FAISS retrieval, LangChain and Groq to narrow model context to relevant passages. The project demonstrates the basic RAG loop while retaining a clear boundary between document assistance and professional legal advice.

**Context & Problem Statement**  
Contracts are long, repetitive and difficult for non-specialists to navigate. Users often need to locate a specific obligation, termination condition, date, payment clause or risk without reading every page from the beginning. Sending an entire document to an LLM for every question is inefficient and can still produce unsupported interpretations.

The product challenge was to create a conversational layer over a document while keeping answers tied to retrieved content and communicating that the system does not replace a lawyer.

**Engineering Approach & Architecture**  
Uploaded text is divided into chunks and converted into embeddings. FAISS stores the local vector index. A user question is embedded, matched against the index and used to retrieve relevant passages. LangChain assembles the retrieval and response steps, and Groq's Mixtral-family model generates the final answer or summary from the selected context.

The prototype prioritizes a lightweight local retrieval architecture. A production implementation would need persistent document storage, tenant isolation, secure deletion, OCR handling, source-page citations, retrieval evaluation, prompt-injection defenses and verified access controls.

**Quantitative Results & Benchmarks**

- No verified retrieval or answer-quality benchmark is currently published.
- Future evaluation should include Hit@K, citation correctness, groundedness, refusal quality and latency by document size.

**Engineering Trade-offs & Unsuccessful Experiments**  
FAISS is appropriate for a local prototype but does not provide the operational capabilities of a managed multi-tenant vector service. Chunking reduces prompt size but can separate clauses from definitions or schedules that change their meaning. An answer can sound legally confident even when retrieval is weak, so a production system must use citations, confidence handling and refusal behavior rather than relying on tone.

**Key Takeaways & Lessons Learned**

- Retrieval reduces context size but does not automatically guarantee grounded answers.
- Legal documents require structure-aware chunking and page-level provenance.
- Security and tenant isolation are core features for uploaded documents.
- The assistant must distinguish information extraction from legal advice.

**Enable RAG Indexing**  
Yes

**Target Audiences**  
Recruiters & Talent Acquisition; AI & Software Engineers; Founders & Product Leaders; General Visitors

**Sensitivity Level**  
Public (Safe for external queries)

**Source Citation Label**  
Case Study: Legal AI Contract Exploration

**Canonical URL / Path**  
`/work/legal-ai`

**Content Review Date**  
2026-09-08

**Publish Status**  
Draft until date verification is complete

---

## Case Study 5 - AQL

**Case Study Title**  
AQL: Designing a Permission-Aware Enterprise AI Workspace

**Slug**  
`aql-permission-aware-enterprise-ai`

**Associated Project**  
AQL - Enterprise AI Workspace

**Executive Summary**  
AQL is an early enterprise AI workspace concept for connecting knowledge retrieval and operational actions across Google Drive, Notion and Jira. Its proposed architecture separates read-only knowledge work from task and workflow execution, with permission checks inherited from source systems. The project currently demonstrates product and architecture direction rather than a production-ready enterprise deployment.

**Context & Problem Statement**  
Enterprise information is fragmented across documents, project systems and collaboration tools. A general assistant can make that information easier to query, but a naive implementation creates serious problems: copied data may bypass original permissions, retrieved answers may lack provenance, and an agent authorized to update systems may receive more power than a simple question requires.

The problem was to design a central interface without creating a central security shortcut.

**Engineering Approach & Architecture**  
The target MVP includes Google Drive, Notion and Jira connectors. A Knowledge Agent retrieves source-permitted content. A Task Agent reads or updates Jira within explicit scopes. A Workflow Agent coordinates bounded cross-tool actions. An orchestrator routes requests to the minimum capability needed.

The retrieval design includes permission filters before candidate content reaches the answer path and a BGE-family reranker for improving final relevance. Every action path should require typed inputs, audit events and confirmation for material external changes. The public repository currently contains an early Next.js base, so connector, reranker and agent claims remain planned until code and evaluation artifacts are available.

**Quantitative Results & Benchmarks**

- 3 target source integrations.
- 3 bounded agent responsibilities.
- No verified permission, retrieval or workflow benchmark yet.

**Engineering Trade-offs & Unsuccessful Experiments**  
Copying all content into one unrestricted knowledge base would simplify retrieval but violate the product's core trust model. A single general agent would be easier to demonstrate but harder to authorize and debug. Fine-tuned reranking may improve relevance, but it adds dataset, hosting and lifecycle work; it should be retained only after comparison against simpler retrieval baselines.

**Key Takeaways & Lessons Learned**

- Enterprise AI must preserve source permissions through retrieval and actions.
- Read and write capabilities should be separated.
- Agent boundaries are security and observability boundaries.
- Architecture claims should remain labelled as targets until public evidence exists.

**Enable RAG Indexing**  
Yes

**Target Audiences**  
Recruiters & Talent Acquisition; AI & Software Engineers; Founders & Product Leaders

**Sensitivity Level**  
Public (Safe for external queries)

**Source Citation Label**  
Case Study: AQL Enterprise AI Workspace Architecture

**Canonical URL / Path**  
`/work/aql-enterprise-ai-workspace`

**Content Review Date**  
2026-09-08

**Publish Status**  
Published as a prototype

---

## Case Study 6 - Busyfile

**Case Study Title**  
Busyfile: Designing a White-Label SaaS Platform for Accounting Firms

**Slug**  
`busyfile-white-label-saas`

**Associated Project**  
Busyfile - White-Label SaaS for Accounting Firms

**Executive Summary**  
Busyfile evolved from a guided B2C business-formation experience into a white-label B2B platform serving accounting firms, their clients and internal operations teams. As the founding designer, Mahad led product design from early research through a system exceeding 500 screens, created reusable interaction patterns and helped translate complex tax, bookkeeping and compliance services into understandable workflows.

**Context & Problem Statement**  
Mayatax served small and medium-sized businesses through accounting, taxation, compliance and back-office services. Many of its customers worked in traditional industries and found existing products fragmented or overly technical. The initial goal was to provide one approachable platform for business formation, bookkeeping and tax services.

The complexity grew quickly. Business-formation requirements varied by entity type and state. Service delivery required internal operations tooling, while users needed a simple guided experience. The later B2B pivot added white-label branding, firm administration, multi-stakeholder workflows and centralized platform oversight.

**Engineering Approach & Architecture**  
The design process began with competitor and workflow analysis across products such as Bench, Gusto, Stripe Atlas, Firstbase and ZenBusiness. Early requirements were converted into entity-formation, tax and operations flows. A reusable design system standardized components and interaction patterns as the product expanded.

The experience was separated by responsibility. Clients received guided service flows. Firm administrators managed their branded service experience. Internal operations teams received work-management views, and super administrators could oversee firms and platform configuration. Modular flow patterns reduced the need to redesign the complete journey for each state, service or entity type.

The B2C foundation was extended into the white-label B2B model rather than discarded. That preserved useful interaction work while allowing the product to support accounting firms as customers.

**Quantitative Results & Benchmarks**

- 500+ product screens.
- 20+ services represented.
- Requirements spanning 52 U.S. states.
- 4 major experience groups: clients, firm administrators, operations and super administrators.
- Progressed from B2C MVP to Datawire's flagship white-label platform.

**Engineering Trade-offs & Unsuccessful Experiments**  
The original B2C direction was not the strongest commercial structure, which led to the white-label pivot. Reusing the foundation saved work, but several flows needed deeper restructuring for tenancy, branding and firm operations. Early fragmented requirements also created a risk of designing each service independently. The design system and modular flow strategy introduced upfront effort but prevented the product from becoming hundreds of unrelated screens.

Not every result can be expressed as a clean conversion metric because the work involved a proprietary enterprise platform. Public claims are therefore limited to scale, scope and approved product outcomes.

**Key Takeaways & Lessons Learned**

- Enterprise simplicity depends on handling operational complexity behind the interface.
- A design system becomes infrastructure when a product reaches hundreds of screens.
- Product pivots should reuse valid foundations without preserving assumptions that no longer fit.
- Operations stakeholders are essential users, not an implementation afterthought.
- Modular patterns make regulatory and service variation manageable.

**Enable RAG Indexing**  
Yes, after final confidentiality review

**Target Audiences**  
Recruiters & Talent Acquisition; AI & Software Engineers; Founders & Product Leaders; General Visitors

**Sensitivity Level**  
Public (Safe for external queries), approved content only

**Source Citation Label**  
Case Study: Busyfile White-Label SaaS

**Canonical URL / Path**  
`/work/busyfile`

**Content Review Date**  
2026-09-08

**Publish Status**  
Published

---

## Case Study 7 - Aurus Books

**Case Study Title**  
Aurus Books: Translating a 50-Page Fintech Vision into an MVP

**Slug**  
`aurus-books-fintech-mvp`

**Associated Project**  
Aurus Books - Accounting and Bookkeeping SaaS MVP

**Executive Summary**  
Aurus Books was an accounting and bookkeeping SaaS concept for small and medium-sized businesses. Mahad translated a broad 50-page requirements document into a coherent landing page and full web-application MVP covering invoices, expenses, customer and vendor management, time tracking, CRM and client collaboration. The design was completed, but the product did not move into production.

**Context & Problem Statement**  
The client wanted a simpler alternative to products such as FreshBooks while retaining a wide financial-management feature set. The main challenge was balancing breadth with usability. A list of accounting functions could easily become a crowded application organized around system terminology instead of everyday business tasks.

An incorrect, outdated requirements document was initially provided. That caused early work to be based on an incomplete scope and forced the project to absorb significant revisions after the correct 50-page document arrived.

**Engineering Approach & Architecture**  
The process combined competitive analysis, wireframing, information architecture and iterative client reviews. Familiar accounting patterns were studied to avoid inventing interaction models where convention helped users. The final architecture grouped capabilities into dashboard, invoicing, expenses, clients and vendors, time tracking, CRM, reporting and client-facing areas.

The public landing page and authenticated product experience were designed as one coherent product story. The MVP was intended both to demonstrate the client vision and to provide a credible foundation for future development and fundraising.

**Quantitative Results & Benchmarks**

- 50-page scope converted into a structured MVP.
- Landing page plus complete web-application design.
- Multiple major modules: invoicing, expenses, clients/vendors, time tracking, CRM, dashboard and client portal.
- 0 production users because the project stopped after MVP design.

**Engineering Trade-offs & Unsuccessful Experiments**  
Early work based on the outdated document had to be reconsidered. That rework highlighted the cost of designing before validating the source requirements. The project also favored familiar financial patterns over highly novel interactions because accounting users benefit from predictability. The most important unsuccessful outcome is straightforward: despite completing the MVP design, the product did not receive funding for full implementation.

**Key Takeaways & Lessons Learned**

- Validate the current source of truth before starting detailed design.
- Large requirement documents need task-based information architecture, not screen-by-screen translation.
- Familiarity can be a stronger UX choice than novelty in financial software.
- A complete MVP design is not the same as a launched or validated product.

**Enable RAG Indexing**  
Yes

**Target Audiences**  
Recruiters & Talent Acquisition; Founders & Product Leaders; General Visitors

**Sensitivity Level**  
Public (Safe for external queries)

**Source Citation Label**  
Case Study: Aurus Books Fintech MVP

**Canonical URL / Path**  
`/work/aurus-books`

**Content Review Date**  
2026-09-08

**Publish Status**  
Published

---

## Case Study 8 - LISPINE

**Case Study Title**  
LISPINE: Designing a More Reassuring Digital Experience for Spine-Care Patients

**Slug**  
`lispine-patient-centered-healthcare-ux`

**Associated Project**  
LISPINE - Patient-Centered Healthcare Website

**Executive Summary**  
LISPINE's website redesign focused on helping patients find understandable spine-care information and feel confident contacting the practice. Mahad joined a delayed project with 34 inner pages remaining, worked within an approved content and style system, collaborated closely with design and development teammates, and helped deliver a responsive website. The published case study reports a bounce-rate reduction from 55% to 32% and doubled conversions.

**Context & Problem Statement**  
LISPINE is a Long Island spine-care practice serving patients dealing with back, neck and related conditions. The existing website did not adequately support increased attention or an audience that could be older, anxious and unfamiliar with medical terminology. Visitors needed quick access to conditions, treatments, physicians, locations and consultation paths without being overwhelmed.

The project was already behind schedule when Mahad joined. The homepage had undergone several revisions, while 34 inner pages still required cohesive design and responsive implementation support.

**Engineering Approach & Architecture**  
The team used approved content, an existing style guide and established homepage direction to accelerate the remaining work. Pages were organized around patient questions and confidence-building information rather than internal clinical structure alone. Reusable page patterns maintained consistency across conditions, treatments, practitioners and locations.

Mahad collaborated with another designer and the development team. When significant requests arrived after approval, selected adjustments were made directly in WordPress to prevent communication and handoff delays. Responsive behavior and navigation clarity remained important because patients might arrive from search on mobile devices.

**Quantitative Results & Benchmarks**

- 34 inner pages completed.
- Bounce rate reported to decline from 55% to 32%, a 23 percentage-point reduction.
- Conversion rate reported to double.

**Engineering Trade-offs & Unsuccessful Experiments**  
The compressed schedule limited the opportunity for a complete redesign of every underlying pattern. Reusing the approved style direction reduced creative flexibility but made delivery realistic. Late-stage client changes created implementation overhead and required direct WordPress adjustments. This was less clean than a fully linear design-handoff process, but it kept the final product aligned with client expectations.

The outcome metrics come from the published project account and should be described as reported results, not independently audited analytics.

**Key Takeaways & Lessons Learned**

- Healthcare UX must reduce anxiety as well as navigation effort.
- Existing systems and constraints can be used strategically when a project is behind schedule.
- Close designer-developer collaboration is especially valuable during late changes.
- Outcome metrics need clear attribution and should not be presented with more certainty than the evidence supports.

**Enable RAG Indexing**  
Yes

**Target Audiences**  
Recruiters & Talent Acquisition; Founders & Product Leaders; General Visitors

**Sensitivity Level**  
Public (Safe for external queries)

**Source Citation Label**  
Case Study: LISPINE Healthcare Website Redesign

**Canonical URL / Path**  
`/work/lispine-healthcare-website`

**Content Review Date**  
2026-09-08

**Publish Status**  
Published

---

## Case Study 9 - INDKOM

**Case Study Title**  
INDKOM: Designing a Modular AI Marketing Automation Workflow

**Slug**  
`indkom-ai-marketing-automation`

**Associated Project**  
INDKOM - AI Marketing Automation System

**Executive Summary**  
This restricted case study describes a client marketing-automation engagement built around n8n, Groq, Supabase, WordPress and Cloudinary. The delivered newsletter workflow coordinated structured input, AI drafting, media and publishing services. Later roadmap phases covered social content, retrieval-based memory and broader marketing orchestration. Public release requires client approval and removal of operational details.

**Context & Problem Statement**  
The client needed repeatable content workflows that reduced manual movement between drafting, media management, review and publication. The system also needed to support multiple content inputs without allowing contradictory form selections, keep generated content reviewable and avoid exposing service credentials in workflow exports or documentation.

**Engineering Approach & Architecture**  
n8n served as the main orchestrator on a Hostinger VPS. Groq supported content generation. Supabase provided persistence and the foundation for future content memory. Cloudinary managed uploaded or generated media, while WordPress REST endpoints handled publication. Webhooks and structured form inputs initiated the workflows.

The implementation was divided into milestones so the newsletter path could be delivered before adding social automation and RAG. Operational documentation explained third-party services, where assets were stored, how forms should be completed and which mutually exclusive inputs users must not combine.

**Quantitative Results & Benchmarks**

- 1 newsletter workflow delivered.
- 4-stage roadmap defined.
- No approved public metric for time saved, publishing volume or ROI.

**Engineering Trade-offs & Unsuccessful Experiments**  
Third-party automation creates multiple external failure points, including expired API credentials, exhausted provider credits and changing service behavior. Generated content also needed client-specific tone changes after initial implementation. These issues reinforced the need for explicit provider errors, human review, editable prompts and documentation that separates mutually exclusive input paths.

**Key Takeaways & Lessons Learned**

- AI automation is an operational system, not only a prompt.
- Third-party quotas and credentials require visible maintenance procedures.
- Human review and editable brand guidance are essential for marketing content.
- User documentation must explain service ownership and mutually exclusive inputs.
- Client confidentiality should determine what enters a public portfolio and RAG corpus.

**Enable RAG Indexing**  
No

**Target Audiences**  
Recruiters & Talent Acquisition; Founders & Product Leaders

**Sensitivity Level**  
Internal / Restricted

**Source Citation Label**  
Restricted Case Study: INDKOM Marketing Automation

**Canonical URL / Path**  
`/work/indkom-marketing-automation`

**Content Review Date**  
2026-09-08

**Publish Status**  
Draft
# PART C - ARTICLE / ENGINEERING POST RECORDS

## Article 1 - Portfolio Build Series Introduction

**Article Title**  
I Decided My Portfolio Should Be the Project

**Slug**  
`i-decided-my-portfolio-should-be-the-project`

**Published Date**  
TBD - enter the actual Hashnode publication date.

**Estimated Reading Time (minutes)**  
14

**External Canonical URL (e.g., Medium)**  
TBD - enter the final Hashnode URL after publication.

**Topic Tags**  
AI Product Engineering, Build in Public, RAG, Agentic AI, MLOps, Portfolio

**Excerpt / Summary**  
I am turning my portfolio into a complete AI product rather than placing an AI feature on top of a static website. This first update explains my move from product design into AI Product Engineering, what has been built so far, and the planned path through managed content, RAG, ML routing, agents, observability and voice.

**Cover Image**  
Upload the approved Hashnode cover image. Suggested filename: `building-ai-native-portfolio-part-1.webp`.

**Alt Text**  
Cover for the first article in the Building an AI-Native Portfolio series by Mahad Baig.

**Article Body**

Most portfolios are wrappers around the work.

You build a few projects, take some screenshots, write case studies, add an About page, and put everything inside a polished website. The portfolio points toward the interesting things, but the portfolio itself is usually not one of them.

I wanted to try something different.

Instead of building a website that says I understand AI products, I am building a website that has to prove it.

The final portfolio will have a conversational assistant that knows my work, retrieves evidence from approved content, explains why it chose an answer, and eventually speaks in something close to my own conversational style. Behind that relatively simple interface will be a complete RAG pipeline, a trained query-routing model, LangGraph orchestration, evaluation, observability, voice input and output, and a content system I can update without rebuilding prompts.

It is intentionally over-engineered. That sentence normally sounds like a confession. In this project, it is the point.

This is an update-based build series. I am not committing to a daily streak or inventing a weekly update when nothing meaningful has happened. I will write when a phase produces something worth explaining: a decision, experiment, failure, benchmark or working part of the system.

### How I got here

My route into AI engineering has not been linear.

I spent nearly six years in product design and UI/UX, much of it on enterprise SaaS. I worked across discovery, user flows, information architecture, design systems, complex dashboards, implementation handoff, and the less glamorous parts that appear after a clean prototype meets a real business.

Busyfile was one of the projects that shaped how I think. I joined as its founding designer and worked on a system that evolved from a consumer business-formation product into a larger white-label platform for accounting firms. The work eventually covered more than 500 screens, multiple entity types, state-specific flows, operations tools and more than twenty services.

That kind of product teaches you that the interface is never the whole system. Every apparently simple screen connects to rules, data, permissions, failure states and operational work. I became increasingly interested in those connections. I wanted to understand not only what a product should do, but how it could actually do it.

At Techomatrix, I worked on AI automation workflows and LLM-powered features using Python, FastAPI, n8n, Groq, databases, APIs and prompt workflows. Independent projects pushed me into RAG, agents, LangGraph, vector databases, machine learning and deep learning.

CardioScan AI pulled me further into applied ML. Our team worked with paired stress and rest myocardial perfusion images, compared VGG16, ResNet50V2 and DenseNet121, and built a full-stack research prototype around the models. The results were not magically perfect, which was useful. Limited medical data makes it difficult to pretend that a larger architecture automatically creates a reliable model.

Somewhere in that transition, “product designer learning AI” stopped describing what I was trying to become. AI Product Engineering fits better: understand the user and business problem, design the interaction, build the system, measure whether it works, and deal with the operational reality after the demo.

### Why a normal chatbot was not enough

I could have pasted my résumé into a system prompt, connected an LLM and called the portfolio AI-enabled. But that would demonstrate very little.

The interesting questions start after the API responds. How does the assistant know which source is trustworthy? What happens when the answer is absent? How can I update knowledge without manually rebuilding prompts? How should documents be chunked? What belongs in PostgreSQL and what belongs in a vector database? Which requests need an LLM at all? How do I evaluate retrieval, cost and latency? What happens when a free provider is sleeping or rate-limited?

Those questions changed the concept from a portfolio with an AI feature into an AI product that happens to be my portfolio.

The centerpiece is called Talk to Mahad. Visitors should eventually be able to ask what I did on Busyfile, which projects used RAG, why I moved into AI engineering, or why the portfolio architecture uses both PostgreSQL and Qdrant. The system should respond from approved sources, show citations and admit when the evidence is insufficient.

“I do not have enough evidence to answer that” is a feature, not a failure.

### The target system

Sanity will manage projects, case studies, articles, experience, architecture decisions and approved style examples. Publishing something publicly will not automatically make it eligible for the assistant. Each document includes RAG, audience, sensitivity, review and publication controls.

An offline ingestion pipeline will normalize approved content, preserve headings and source paths, create deterministic hashes, divide documents using heading-aware chunking and embed only changed material. PostgreSQL will store canonical documents, chunks, versions and operational records. Qdrant will hold the derived vector index used for similarity search. A retrieved vector points back to canonical content in PostgreSQL, and the index can be rebuilt if it disappears.

Before calling an LLM, a compact query router will classify the request. The experiment starts with rules and TF-IDF before comparing a small transformer. MLflow will track datasets, runs and model releases. If the selected model earns deployment, it will be exported to ONNX and run inside FastAPI.

LangGraph will coordinate classification, retrieval, context validation, answer generation, citation checks and bounded recovery. MLflow will cover the traditional ML lifecycle; LangSmith will trace the LLM and agent workflow. Text chat remains the core interface, with voice isolated as a separate failure domain.

### What exists today

The repository currently contains the foundation, not the finished AI system.

The scope is locked. Personas, success criteria and architecture decisions are documented. A pnpm monorepo separates the Next.js web app, Sanity Studio, FastAPI API, voice service, shared packages and offline pipelines. The first minimal portfolio pages exist, along with unit, Playwright, accessibility, Lighthouse, dependency and secret-scanning foundations. Sanity schema and integration work is now being completed.

The AI backend, ingestion pipeline, Qdrant retrieval, trained router, LangGraph workflow and voice service remain future milestones. They should not be described as implemented until their gates pass.

The frontend is deliberately plain: white, near-black, neutral gray, Plus Jakarta Sans and enough whitespace to breathe. I have a design background, so I could easily spend the first month polishing cards and transitions. I am refusing to do that. The first job is to make the content, navigation, citations, state and failures understandable.

### What comes next

The immediate task is to finish the Sanity content layer and verify that approved content updates the public website without a code change. After that comes FastAPI and PostgreSQL, followed by deterministic ingestion, Qdrant retrieval, the custom router, LangGraph, evaluation, chat, voice and deployment.

The order matters. It is difficult to evaluate retrieval without trustworthy source documents. It is difficult to debug agents before their tools behave deterministically. It is difficult to claim MLOps without reproducible data and training runs. And it is difficult to build a reliable voice assistant before text chat works.

The portfolio is currently more blueprint than machine. That will change one verified milestone at a time.

Repository: https://github.com/mahadbaig2/mahad-ai-portfolio

**Enable RAG Indexing**  
Yes

**Target Audiences**  
Recruiters & Talent Acquisition; AI & Software Engineers; Founders & Product Leaders; General Visitors

**Sensitivity Level**  
Public (Safe for external queries)

**Source Citation Label**  
Engineering Article: I Decided My Portfolio Should Be the Project

**Canonical URL / Path**  
`/blog/i-decided-my-portfolio-should-be-the-project`

**Content Review Date**  
2026-09-08

**Publish Status**  
Draft until the Hashnode URL and publication date are entered

---

## Article 2 - PostgreSQL and Qdrant

**Article Title**  
Why My RAG Architecture Uses Both PostgreSQL and Qdrant

**Slug**  
`why-rag-uses-postgresql-and-qdrant`

**Published Date**  
TBD - publish after the retrieval milestone is implemented and benchmarked.

**Estimated Reading Time (minutes)**  
8

**External Canonical URL (e.g., Medium)**  
Leave empty until publication.

**Topic Tags**  
RAG, PostgreSQL, Qdrant, Vector Database, AI Architecture, Data Engineering

**Excerpt / Summary**  
A vector database is excellent at finding semantically similar candidates, but it should not quietly become the only copy of your knowledge. This article explains why the portfolio stores canonical chunks and lifecycle records in PostgreSQL while treating Qdrant as a rebuildable search index.

**Cover Image**  
Upload an architecture image after the implementation is verified. Suggested filename: `postgresql-qdrant-rag-architecture.svg`.

**Alt Text**  
RAG architecture showing Qdrant retrieving vector candidates that map back to canonical chunks and versions in PostgreSQL.

**Article Body**

When people explain RAG, the storage layer is often reduced to one sentence: “Put the chunks in a vector database.”

That is enough for a demo. It is not enough for the system I want to build.

My portfolio assistant will use both Neon PostgreSQL and Qdrant. This looks redundant until the responsibilities are separated properly.

Qdrant answers a search question: given this query vector and these filters, which stored vectors are closest? PostgreSQL answers operational questions: which source document produced this chunk, which version is active, what text is canonical, when was it indexed, was it deleted, which embedding model created it, and what happened during the ingestion run?

Those are different jobs.

### The vector index is derived data

Sanity is the authoring source of truth for the portfolio. An offline pipeline will fetch approved documents and convert Portable Text into normalized content. It will preserve heading paths, lists, code and canonical URLs, then create deterministic hashes.

The pipeline will divide each document into heading-aware chunks. Every chunk receives a stable identifier and metadata such as source document, project, audience, language, sensitivity, version and order. The canonical text and lifecycle information go into PostgreSQL.

The embedding model then creates a vector for the chunk. Qdrant stores that vector under the same mapping identifier with a compact payload used for filtering and debugging.

The important consequence is that Qdrant can disappear without becoming a content disaster. The active PostgreSQL records and approved Sanity documents provide enough information to rebuild it.

### Retrieval is followed by hydration

A user question is embedded using the same model and query convention used during indexing. Qdrant retrieves a larger candidate set, perhaps the top twelve, with filters appropriate to the visitor or query.

Those candidates are not immediately pasted into an LLM prompt.

The API maps each point ID back to PostgreSQL. It verifies that the corresponding chunk still exists, belongs to the active document version and is allowed for the requested audience. Missing, inactive or mismatched rows are rejected. Adjacent or nearly identical results can be deduplicated before a smaller context set is selected.

This extra hydration step gives the relational layer authority over what the assistant can actually use.

### Why not store the complete text only in Qdrant?

Qdrant can store payloads, including text. For a small personal portfolio, it probably could hold everything. The decision to keep canonical content in PostgreSQL is not based on a hard technical limitation.

It is based on lifecycle clarity.

Relational constraints are useful for documents, versions, ingestion runs, feedback, model releases and retrieval events. SQL makes it straightforward to audit which chunks belong to which version and to enforce uniqueness or foreign-key relationships. A vector collection remains optimized for similarity retrieval instead of gradually becoming an undocumented application database.

This architecture also lets me change vector providers without changing the meaning of the underlying knowledge records. I can rebuild Qdrant, test a second embedding model or compare retrieval strategies while preserving canonical chunk IDs and source lineage.

### The cost is more moving parts

There is a real trade-off. Two stores mean two clients, two failure modes, synchronization logic and more integration tests. A prototype could move faster with only FAISS or only a vector service.

For this portfolio, the additional work is justified because the project is meant to demonstrate a complete RAG lifecycle. In a small production product with different requirements, I might choose PostgreSQL with pgvector and keep everything in one system.

The architecture should follow the product and operational needs, not a rule that every RAG application needs two databases.

### How I will know whether it works

The ingestion pipeline must be deterministic and idempotent. Running it twice against unchanged content should create no duplicate chunks and perform no unnecessary embedding work. Deleting or unpublishing a document must remove or deactivate its retrievable vectors. Rebuilding the Qdrant collection must preserve stable mappings.

Retrieval will be evaluated using a manually reviewed set of expected query-source pairs. Initial metrics will include Hit Rate at K and Mean Reciprocal Rank, followed by end-to-end groundedness and citation checks.

Until those tests pass, this is an architecture decision, not a success story.

That distinction is becoming a recurring theme in this portfolio: the diagram explains what I intend to build; the benchmark decides whether I get to claim that it works.

**Enable RAG Indexing**  
Yes, but publish and index only after implementation details match the article.

**Target Audiences**  
AI & Software Engineers; Founders & Product Leaders

**Sensitivity Level**  
Public (Safe for external queries)

**Source Citation Label**  
Engineering Article: Why the Portfolio Uses PostgreSQL and Qdrant

**Canonical URL / Path**  
`/blog/why-rag-uses-postgresql-and-qdrant`

**Content Review Date**  
2026-09-08

**Publish Status**  
Draft

---

## Article 3 - Small ML Router Before the LLM

**Article Title**  
Why I Am Training a Small Router Before Calling an LLM

**Slug**  
`small-ml-router-before-llm`

**Published Date**  
TBD - publish after classifier evaluation and deployment.

**Estimated Reading Time (minutes)**  
9

**External Canonical URL (e.g., Medium)**  
Leave empty until publication.

**Topic Tags**  
Machine Learning, LLMOps, MLOps, Intent Classification, ONNX, MLflow

**Excerpt / Summary**  
Not every message deserves an LLM call. This article explains the planned experiment behind the portfolio's query router: start with rules and TF-IDF, compare a compact transformer, track the lifecycle in MLflow and deploy through ONNX only if the model creates measurable value.

**Cover Image**  
Upload the verified routing-flow diagram after implementation. Suggested filename: `small-ml-router-before-llm.svg`.

**Alt Text**  
Query-routing flow in which deterministic rules and a compact machine-learning classifier choose between navigation, retrieval, conversation, clarification and rejection before an LLM is called.

**Article Body**

The expensive model should not be the first component that sees every message.

That is the hypothesis behind the query router planned for Talk to Mahad, the assistant inside my AI Product Engineering portfolio.

A visitor might ask about my Busyfile work, type “open the résumé,” say hello, submit an unrelated request, write in Roman Urdu, or ask something too ambiguous to retrieve. Sending all of those messages into the same large language model prompt is convenient, but convenience creates cost, latency and inconsistent behavior.

I want to test whether a much smaller local model can make the first decision.

### What the router is supposed to do

The router will receive normalized text and return a route, confidence score and model version. Initial classes may include:

- Portfolio knowledge retrieval
- Site navigation or deterministic action
- Casual conversation
- Clarification required
- Unsupported or irrelevant request
- Unsafe request

Language or code-switching signals can be captured separately so Roman Urdu is not confused with an unsupported query simply because spelling is inconsistent.

The router does not write the final answer. It chooses which bounded path should handle the request.

A navigation request can return a deterministic link. A grounded career question can enter retrieval. A low-confidence input can ask for clarification. An unsafe input can stop before any retrieval or generation occurs. Only the paths that need a language model should call one.

### Start with the least impressive baseline

The first version should not be a transformer.

I will begin with explicit rules for highly predictable commands and a TF-IDF classifier for learned intent routing. That baseline is fast, cheap, interpretable and easy to reproduce. It also creates something important: a result that a more complex model has to beat.

Without a baseline, it is easy to train a small transformer, obtain a plausible accuracy score and declare the experiment successful. That does not answer whether the model was necessary.

The dataset will contain realistic recruiter, engineer, founder and general-visitor questions, including spelling variation, short messages, Roman Urdu and ambiguous requests. Train, validation and test splits must avoid near-duplicate templates leaking across sets.

### What will be measured

Overall accuracy will not be enough because the classes will not have equal importance. Misrouting “download my résumé” into RAG is annoying. Misrouting an unsafe request into a tool path is more serious.

The evaluation will therefore include macro F1, per-class precision and recall, confusion matrices, calibration behavior and abstention performance. I also want operational metrics: inference latency, package size, memory usage, cold-start effect and the percentage of requests that avoid an LLM call.

The cost-saving claim will remain a hypothesis until real traffic or a representative evaluation set shows how often the router can safely stop or choose a deterministic path.

### Comparing a compact transformer

After the baseline is stable, I can fine-tune a compact multilingual encoder such as MiniLM or DistilBERT. The exact model is not locked yet. It needs to handle the dataset, deployment limit and language mix rather than win a popularity contest.

MLflow will track dataset versions, preprocessing, parameters, metrics, artifacts and candidate releases. If the transformer materially improves the important classes without unacceptable latency or size, it can become the deployment candidate. If TF-IDF performs just as well, TF-IDF wins.

That may be less exciting for a portfolio diagram, but it is better engineering.

### Why ONNX

The selected learned model is planned to run inside the FastAPI process through ONNX Runtime. In-process inference removes a network call, avoids maintaining a separate router service and makes the request path easier to bound.

The exported model will need parity tests against its training-framework output. A successful export is not enough if predictions change materially. The API should expose the route, confidence and model version to internal tracing, while the public inspector can show a safe subset of that information.

Low confidence should trigger clarification or a conservative fallback rather than forcing a class.

### Why not use an LLM as the router?

An LLM router is flexible and requires little training data. It is a reasonable baseline too, particularly when intents change frequently or reasoning is genuinely required.

But it adds network latency, variable cost, provider dependence and output-validation work to the first decision in every request. For a small, stable set of portfolio routes, that may be unnecessary.

The comparison should still be measured. A sampled LLM-router evaluation can show whether the compact classifier loses important semantic understanding. The goal is not to prove that small models are always better. The goal is to place each model where it creates enough value to justify its cost.

### The production perspective

The router creates a real MLOps lifecycle inside a broader LLM product. Its dataset will evolve as new failure cases appear. New releases will need regression tests. Confidence and route distributions can reveal drift. Rollback metadata must identify which model handled a request.

LangSmith will trace what happens after routing in the LLM and agent workflow. MLflow will explain how the router itself was trained and selected. Using both tools demonstrates an important distinction: monitoring a prompt graph is not the same as managing a trained classifier.

This is currently a planned experiment. There is no honest latency number, F1 score or cost-saving percentage yet. Those belong in the next update only after the dataset, baselines and tests exist.

For now, the architecture has a question mark where the router sits. I like that. It means the model still has to earn its box.

**Enable RAG Indexing**  
Yes, but publish and index only after experiments and deployment match the article.

**Target Audiences**  
AI & Software Engineers; Founders & Product Leaders; Recruiters & Talent Acquisition

**Sensitivity Level**  
Public (Safe for external queries)

**Source Citation Label**  
Engineering Article: Small ML Router Before the LLM

**Canonical URL / Path**  
`/blog/small-ml-router-before-llm`

**Content Review Date**  
2026-09-08

**Publish Status**  
Draft

---

# FINAL MANUAL CHECKLIST

Before publishing or enabling RAG for any record:

- [ ] Confirm every date, role and organization.
- [ ] Resolve the Legal AI 2024 versus 2025 conflict.
- [ ] Confirm that the CardioScan live deployment currently works.
- [ ] Do not add CardioScan AUC or accuracy until original test artifacts are revalidated.
- [ ] Confirm whether Busyfile's 52-state scope and all screenshots are approved for public use.
- [ ] Obtain client approval before publishing or indexing INDKOM content.
- [ ] Replace every `TBD` field.
- [ ] Upload only images you own or have permission to publish.
- [ ] Remove customer, patient, client, credential and internal operational data from screenshots.
- [ ] Set draft technical articles to Published only after their implementation claims are true.
- [ ] Verify associated Project references after creating Project records.
- [ ] Preview every Portable Text body for heading hierarchy, links and list rendering.
- [ ] Run the CMS-to-site integration check before approving the Phase 2 gate.

---

