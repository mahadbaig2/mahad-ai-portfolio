# Target User Personas

This document defines the primary audiences for Mahad's AI Portfolio and the "Talk to Mahad" assistant. The system's content presentation, tone, and execution inspector tailor interactions based on these personas.

---

## 1. Recruiter

### Profile & Context
- **Role**: Technical Recruiter, Talent Acquisition Lead, or Executive Sourcer evaluating candidates for AI Engineering, Product Engineering, or Tech Lead roles.
- **Time Horizon**: Extremely constrained (30 seconds to 2 minutes per candidate profile).
- **Primary Goal**: Quickly verify candidate fit, senior experience level, key technologies used, contact information, and availability.

### Key Requirements & Expectations
- **Clear Information Hierarchy**: Immediate access to key metrics, title summaries, company history, contact links, and resume download.
- **Recruiter Mode in Assistant**: High-level, concise responses highlighting relevant skills, years of experience, leadership roles, and deliverables without excessive technical jargon.
- **Verification**: Direct links to verifiable sources (GitHub, LinkedIn, Medium, live projects).

---

## 2. Technical Engineer / AI Peer

### Profile & Context
- **Role**: Senior/Staff Engineer, Engineering Manager, AI Research Engineer, or System Architect conducting technical due diligence.
- **Time Horizon**: Deep dive (5 to 20 minutes).
- **Primary Goal**: Inspect code quality, architectural depth, RAG pipeline mechanics, custom ML router implementation, test coverage, and system trade-offs.

### Key Requirements & Expectations
- **Architectural Transparency**: Detailed Architecture Decision Records (ADRs), system topology, vector database index designs, and MLOps workflows.
- **Execution Inspector**: Ability to inspect assistant query classification, vector retrieval scores, hydration steps, confidence thresholds, and model metadata in real-time.
- **Engineer Mode in Assistant**: In-depth explanations focusing on system design, trade-offs, algorithms, code snippets, and evaluation metrics (e.g. F1 scores, latency, recall).

---

## 3. Founder / Product Leader

### Profile & Context
- **Role**: Startup Founder, CTO, VP of Product, or Business Stakeholder looking for a pragmatic product builder who balances engineering rigor with business velocity.
- **Time Horizon**: Medium (2 to 5 minutes).
- **Primary Goal**: Assess product vision, problem-solving capability, ROI focus, cost management discipline, and execution speed.

### Key Requirements & Expectations
- **Business Impact & Case Studies**: Focus on real-world problem statements, user outcomes, architecture decisions driven by cost/latency tradeoffs (e.g. CPU space deployment, free-tier auditing).
- **Founder Mode in Assistant**: Strategic answers summarizing business value, ROI, user-centered product design, and pragmatic tech stack selection.
- **Product Polish**: Clean UI/UX, responsive interaction, intuitive navigation, and zero non-functional placeholders.

---

## 4. Client / Strategic Partner

### Profile & Context
- **Role**: Enterprise Client, Consulting Partner, or Project Sponsor looking for AI consulting, custom agentic system implementation, or advisory services.
- **Time Horizon**: Flexible (3 to 10 minutes).
- **Primary Goal**: Evaluate capability to build end-to-end production AI solutions, operational safety, and clear communication.

### Key Requirements & Expectations
- **Demonstrable Production AI**: Live working demonstration of full RAG, voice integration, Roman Urdu support, and safety guardrails.
- **Clarity & Reliability**: Professional communication, transparent capability boundaries (clarification/refusal when evidence is absent), and safe execution.
- **Direct Engagement**: Frictionless contact mechanisms, clear scope definitions, and proven case study deliverables.
