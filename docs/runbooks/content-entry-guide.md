# Sanity Content Entry Guide & Required-Field Checklist

This guide provides step-by-step instructions and required-field checklists for entering, editing, and publishing portfolio content in Sanity Studio, fulfilling Milestone 2.3 (**P2.3.1 [A]**).

---

## 1. Launching Sanity Studio

To start the authoring environment locally:

```bash
# From repository root:
pnpm --filter @mahad/studio dev
```

Open your browser to [http://localhost:3333](http://localhost:3333). You will be prompted to log in using your authenticated Sanity account.

> [!NOTE]
> Ensure your root `.env` defines `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET=production`.

---

## 2. Recommended Authoring Order

### Step 1: Site Settings & Profile (Singleton)
Navigate to **Site Settings & Profile** in the top navigation pane:
- [ ] **Author Name**: `Mahad Baig`
- [ ] **Target Role**: `AI Product Engineer`
- [ ] **Headline**: Positioning headline for hero section
- [ ] **Short Bio**: 2-4 sentences describing your background and philosophy
- [ ] **Primary Contact Email**: Verified address (`mahadmirza681@gmail.com`)
- [ ] **Social Profiles**: Verified URLs for LinkedIn, GitHub, and Medium
- [ ] **Verified Résumé PDF**: Upload your approved PDF résumé file into the `resumePdf` field.
  *Once uploaded, the "Download Résumé" button on `/contact` will link directly to this official asset.*

---

### Step 2: Projects & Case Studies (Minimum 3 for P2.3.3)
Navigate to **Work & Editorial > Projects**:
For each project (e.g. *Talk to Mahad*, *Enterprise RAG Evaluation Platform*, *LLM Gateway & Semantic Caching*):
- [ ] **Title**: Unique, concise project title
- [ ] **Slug**: Click "Generate" to generate a URL-safe slug from the title
- [ ] **Subtitle / One-line Summary**: Clear description of what the project does
- [ ] **Year & Role**: Year engineered and role held (e.g. `2025`, `AI Product Engineer`)
- [ ] **Overview**: 20-600 characters summarizing problem and impact
- [ ] **Metrics**: Add at least 1-3 quantitative metrics (Label, Value, Context)
- [ ] **Technology Stack**: Add key technologies as tags
- [ ] **RAG Metadata**:
  - `ragEnabled`: `true` (if ready for assistant ingestion)
  - `audiences`: Select applicable target audiences (`recruiter`, `engineer`, etc.)
  - `sourceLabel`: Human-readable citation label (e.g. `"Sanity CMS: Project - Multimodal RAG"`)
  - `canonicalPath`: Relative route on site (e.g. `"/work/talk-to-mahad"`)
  - `publishStatus`: Set to `Published`

Next, navigate to **Work & Editorial > Case Studies**:
- [ ] **Title**: Case study title
- [ ] **Associated Project**: Select the project reference created above
- [ ] **Executive Summary**: 30-500 characters
- [ ] **Context & Problem Statement**: Deep narrative of the challenge
- [ ] **Engineering Approach**: Detailed technical breakdown with Portable Text code blocks, callouts, or architecture images
- [ ] **Trade-offs & Unsuccessful Experiments**: Document what was evaluated and discarded
- [ ] **Lessons Learned**: 2-4 key architectural takeaways

---

### Step 3: Articles & Technical Notes (Minimum 1 for P2.3.4)
Navigate to **Work & Editorial > Articles & Notes**:
- [ ] **Title**: Article headline
- [ ] **Slug**: Click "Generate"
- [ ] **Published Date**: Publication date
- [ ] **Estimated Reading Time**: Number of minutes (e.g. `6`)
- [ ] **Excerpt / Summary**: 20-350 characters for article previews
- [ ] **Tags**: Topic tags (e.g. `Architecture`, `Zero-Cost Ops`, `RAG`)
- [ ] **Article Body**: Full article content using Portable Text (headings `h2-h4`, code snippets, paragraphs)
- [ ] **Canonical URL** *(Optional)*: Link to external publication if cross-posted from Medium
- [ ] **RAG Metadata**:
  - `sourceLabel`: E.g. `"Sanity CMS: Article - In-Process ML Routing"`
  - `canonicalPath`: E.g. `"/blog/in-process-ml-routing-without-llm-overhead"`
  - `publishStatus`: `Published`

---

### Step 4: Career & Background
Navigate to **Career & Background**:
1. **Experience**:
   - [ ] Company name, job title, start/end dates
   - [ ] Summary of responsibilities
   - [ ] Highlights: Measurable engineering achievements (bullet points)
   - [ ] Technologies used
2. **Education & Certifications**:
   - [ ] Institution, degree, field of study, graduation year
   - [ ] Coursework and honors
3. **Skills & Competencies**:
   - [ ] Skill name, category (`AI & Machine Learning`, `Systems & Backend`, etc.)
   - [ ] Proficiency level (`Production Depth`, `Proficient`, `Working Knowledge`)
   - [ ] Context description: Real production applications of this skill

---

### Step 5: Knowledge Base & RAG Grounding
Navigate to **Knowledge Base & RAG**:
1. **Architecture Decision Records (ADRs)**:
   - [ ] ADR Number (1-8 matching repository ADRs)
   - [ ] Title, Status (`Accepted for V1`), Date
   - [ ] Context, Decision, Consequences, Trade-offs
2. **Frequently Asked Questions (FAQs)**:
   - [ ] Common recruiter, founder, or engineer questions
   - [ ] Grounded answer in Portable Text
   - [ ] Category (`Career`, `Philosophy`, `Stack`, `Contact`)
3. **Voice & Style Exemplars**:
   - [ ] Sample prompts and canonical assistant responses in English and Roman Urdu

---

## 3. Privacy & Sensitivity Checklist (P2.3.5 & P2.3.6)

Before marking content as `Published`:

> [!CAUTION]
> **Assistant Citations Safety Rule**
> The "Talk to Mahad" assistant will cite published documents. Ensure no unvetted personal facts, unverified claims, or private contact details are marked `ragEnabled: true`.

- [ ] **Private Data Check**: Ensure private personal documents or credentials are NOT entered into any CMS fields.
- [ ] **Sensitivity Field**: Ensure `sensitivity` is set to `Public (Safe for external queries)` only for material approved for public disclosure.
- [ ] **Draft Isolation**: Any work in progress must have `publishStatus` set to `Draft` or `ragEnabled` set to `false`.
- [ ] **Citation Label Accuracy**: Confirm that `sourceLabel` describes the source clearly so citations in the assistant chat UI are informative.

---

## 4. Verifying Changes on the Frontend (P2.G GATE)

Once content is published in Sanity Studio:

1. Open the portfolio web application at [http://localhost:3000](http://localhost:3000).
2. Refresh the page. The Next.js data layer will revalidate and fetch the newly published content from Sanity.
3. Verify that:
   - [ ] Projects appear on Home (`/`) and Work (`/work`).
   - [ ] Case study pages (`/work/[slug]`) render the formatted engineering approach.
   - [ ] Articles appear on Blog (`/blog`) and individual article routes (`/blog/[slug]`).
   - [ ] About page (`/about`) displays work history and skills.
   - [ ] Contact page (`/contact`) displays verified links and résumé download button.
   - [ ] Editing a document in Sanity Studio updates the website **without requiring any code changes or commits**.
