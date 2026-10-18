# Architectural Record: Neo-Brutalist Editorial UI Redesign & AI Product Engineering Positioning

## Status
Accepted and Implemented

## Context & Motivation
Mirza Mahad Baig's public portfolio was originally built with an understated grayscale minimal design. While technically robust, it did not adequately express Mahad's dual mastery:
1. **Nearly six years of senior product design and UI/UX experience** (designing complex enterprise SaaS, architecting design systems, and authoring over 500 screens for Busyfile).
2. **Practical AI engineering and full-stack product implementation** (in-process ONNX classification, LangGraph deterministic workflows, grounded RAG with dual-persistence in Neon PostgreSQL and Qdrant, and ElevenLabs conversational voice companionship).

A Google Stitch project (`stitch_neo_brutalist_portfolio_design_system`) provided the visual, layout, and typographical benchmark for a high-contrast neo-brutalist editorial aesthetic.

## Professional Positioning
- **Primary Role**: **AI Product Engineer**
- **Supporting Narrative**: An experienced product designer with practical expertise in AI engineering and full-stack product implementation.
- **Key Proof Points**:
  - Nearly 6 years of product design and UI/UX experience.
  - 500+ production screens designed for Busyfile.
  - Practical RAG, ONNX routing, LangGraph state engine, and conversational AI engineering.
  - Full-stack fluency across Next.js, React, TypeScript, Python, FastAPI, and PostgreSQL.

## Visual Design System
- **Palette**:
  - Warm Paper (`#fcf9f2`, `#f3f0e9`)
  - Deep Oxblood / Dark Maroon (`#45191c`, `#360d11`, `#861933`)
  - Deep Forest Green / Muted Jade (`#284c3b`, `#416654`, `#507858`, `#8aab7a`)
  - Near-Black (`#11110f`)
  - Warm Grey (`#d9d5cc`)
- **Typography Roles**:
  - Condensed Display: Chivo (`--font-chivo`) for headlines, titles, and section numbers.
  - Readable Sans-Serif: Hanken Grotesk (`--font-hanken-grotesk`) for UI, forms, and prose.
  - Technical Monospace: JetBrains Mono (`--font-jetbrains-mono`) for metadata, coordinates, routes, and telemetry.
- **Layout Tokens**:
  - Sharp 1.5–2px borders (`border-2 border-[#11110f]`)
  - Neo-brutalist stamp shadows (`box-shadow: 4px 4px 0px #11110f`)
  - Zero glassmorphism, zero floating tech badges, zero generic gradients.

## System Preservation & Integration
- **Sanity Studio**: Preserved existing datasets; extended schemas with new fields (`heroEyebrow`, `heroHeadline`, `heroSupportingText`, `touringPhoto`, `homepageProofPoints`, `travelJourney`, case study deep-dives, `education.recordType`).
- **FastAPI Backend & RAG**: Completely unchanged; query router, Qdrant vectors, Neon canonical chunks, LangGraph orchestration, and Groq inference remain authoritative.
- **ElevenLabs Companion Widget**:
  - Re-styled into the neo-brutalist visual language.
  - Fixed Tailwind sizing (`h-14 w-14`).
  - Implemented the non-intrusive 5-second invitation card (`LOOKING FOR SOMETHING SPECIFIC?`) above the launcher with actions `Ask a Question`, `Try Voice`, and `Dismiss`.
  - Full companion panel expands only upon explicit visitor action.
  - Strict 120-second session limits, real-time citations, mute/interrupt controls, and honest quota messaging preserved.
- **Static Export Compatibility**: Next.js App Router with `output: 'export'` prerenders all 38 static HTML routes cleanly into `apps/web/out`.

## Content Integrity & Boundaries
- Strict exclusion of `Neuronaq`, `Ahmad Associates`, and `SAK`.
- Strictly verified travel details for Khunjerab Pass: states only that Mahad rode his motorcycle to Khunjerab Pass (4,693m); no fabricated fuel, stops, dates, or motorcycle models.
- Dual case-study architecture supporting both technical AI engineering deep-dives and product design system narratives.
