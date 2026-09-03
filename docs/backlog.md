# Post-Version-1 Backlog

This document collects feature proposals, technical enhancements, and deferred ideas for future iterations beyond Version 1.

## Scope Governance Rule
Per `AGENTS.md`, version 1 scope is locked. No items listed in this backlog may be implemented in version 1 without Mahad's explicit written approval.

---

## Candidate Backlog Items

### 1. Retrieval & Search Enhancements
- **Custom Neural Reranker**: Train and deploy a fine-tuned Cross-Encoder / neural reranking model to refine initial vector retrieval results.

### 2. Model & Generation
- **General LLM LoRA Fine-Tuning**: Fine-tune a domain-specific open-weights LLM using LoRA for tone, formatting, and domain knowledge precision.

### 3. Voice & Interaction
- **Real-Time WebRTC Voice Conversation**: Low-latency bidirectional audio streaming using WebRTC for natural conversational voice calls.
- **Expanded Multilingual TTS**: Additional language-specific TTS models for multi-accent Roman Urdu and Urdu natural speech synthesis.

### 4. Infrastructure & Deployment
- **AWS Reference Deployment**: Terraform / IaC configuration for AWS deployment with explicit temporary budget caps and automated shutdown controls.

### 5. Access & User Experience
- **Authentication & Private Recruiter Rooms**: Secure recruiter sign-in providing personalized portfolios, NDA-protected work samples, and tailored Q&A sessions.
- **External Portfolio Connectors**: Read-only real-time integrations with GitHub, Medium, LinkedIn, and Sanity for dynamic sync without scheduled builds.

### 6. MLOps & Continuous Learning
- **Advanced Drift Detection**: Continuous monitoring of embedding distribution shift, query distribution drift, and automated model retraining triggers.

### 7. Comprehensive UI/UX Design & Aesthetic Polish
- **Advanced Visual & Interaction Polish**: Deep design pass covering bespoke micro-interactions, enhanced card layouts, visual flair, and comprehensive design refinements noted during Milestone 1.2 review.
