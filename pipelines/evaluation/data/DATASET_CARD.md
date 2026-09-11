# Dataset Card: Query Router Dataset (`query_router_dataset.json`)

## 1. Dataset Summary

The Query Router Dataset is the official training and evaluation corpus for Mahad's portfolio query-routing machine learning model. Incoming queries to the "Talk to Mahad" conversational assistant are passed to this in-process classifier before deciding whether to invoke retrieval-augmented generation (RAG), respond directly via lightweight deterministic handlers, or refuse unsafe / out-of-domain requests.

- **Total Samples**: 112 annotated queries
- **Unique Semantic Groups**: 29 paraphrase groups
- **Languages**: English (`en`: 59.8%), Roman Urdu (`ur`: 40.2%)
- **Target Tasks**: Multi-target classification (`route`, `intent`, `answerability`, `language`)
- **Primary Metrics**: Macro F1, refusal recall, out-of-domain rejection, low inference latency (< 5ms)

---

## 2. Taxonomy & Label System

### Route Labels (`route`)
1. **`rag_retrieval`**: Queries requiring vector similarity search across indexed portfolio projects (CardioScan AI, INDKOM, Multimodal Medical Diagnosis, Customer Churn, Skin Disease), case studies, articles, and career background.
2. **`direct_chat`**: Conversational pleasantries, assistant persona questions, and deterministic contact/resume inquiries handled without invoking heavy vector search.
3. **`refusal`**: Out-of-domain topics (recipes, politics, unrelated math/science), jailbreak attempts, or malicious prompt injection probes.

### Intent Labels (`intent`)
- **`project_technical`**: Deep architecture questions, machine learning models, training pipelines, data preprocessing, and engineering trade-offs.
- **`project_overview`**: High-level summaries of project goals, problems solved, and business/clinical impact.
- **`career_skills`**: Questions concerning Mahad's education, tools, years of experience, and past roles.
- **`article_discussion`**: Inquiries regarding technical articles, dual observability (MLflow + LangSmith), and architecture decisions.
- **`contact_info`**: Requests for contact details, email, LinkedIn, GitHub, or resume downloads.
- **`greeting`**: Greetings in English ("Hello", "Good morning") or Roman Urdu ("Salam", "Adaab", "Kaisay hain").
- **`general_chitchat`**: Inquiries about the bot's identity, capabilities, or general conversational interaction.
- **`out_of_domain`**: General questions completely unrelated to Mahad's engineering portfolio (e.g. quantum mechanics, world history, recipes).
- **`prompt_injection`**: Adversarial jailbreak attempts ("Ignore previous instructions", system prompt extraction, persona hijack).

### Answerability Labels (`answerability`)
- **`answerable`**: Questions that can be factually grounded using the portfolio corpus or system identity.
- **`unanswerable`**: Questions containing counterfactual premises or out-of-domain requests that the model must refuse.

### Language Labels (`language`)
- **`en`**: Standard technical English.
- **`ur`**: Roman Urdu (Urdu written using the Latin script, typical in Pakistani tech communities).

---

## 3. Data Structure

Each record adheres to the following Pydantic schema (`pipelines.evaluation.schema.QueryRouterSample`):

```json
{
  "id": "q001",
  "text": "What is CardioScan AI and what problem does it address?",
  "group_id": "cardioscan_overview",
  "route": "rag_retrieval",
  "intent": "project_overview",
  "answerability": "answerable",
  "language": "en",
  "expected_document_slug": "cardioscan-ai",
  "origin": "synthetic",
  "reviewer": "Mahad"
}
```

---

## 4. Group-Aware Design & Leakage Prevention

A critical flaw in classical NLP splits is random record-level train/test splitting, which causes paraphrases of the same question to appear in both training and test sets. To guarantee an honest, leak-free evaluation:

- Every query belongs to a **`group_id`** (e.g., `cardioscan_overview`, `contact_and_hiring`, `prompt_injection_override`).
- Splitting MUST use **Group-Aware Splitting** (`GroupShuffleSplit` / `GroupKFold`) grouped strictly by `group_id`.
- Under no circumstances may queries sharing the same `group_id` span across both train and test splits:
  $$\text{Train Groups} \cap \text{Test Groups} = \emptyset$$

---

## 5. Limitations & Bias

1. **Size**: At 112 samples, the dataset is compact, designed specifically to validate classical baselines (TF-IDF + Logistic Regression) and lightweight transformers.
2. **Vocabulary Coverage**: Roman Urdu exhibits extreme phonetic spelling variations (e.g., *kaun se*, *konse*, *kon se*; *huay*, *huye*). The baseline ML pipeline combines word n-grams (1-2) with character n-grams (3-5) to handle character-level phonetic drift.
3. **Imbalance**: Specific rare intents (e.g., `career_skills` vs `out_of_domain`) require macro-averaged metrics (Macro F1) rather than raw accuracy.

---

## 6. Privacy & Safety

- No real private credentials, private keys, or unpublished personal data are included.
- Adversarial prompt injections are strictly synthetic benchmark probes.
- All references point exclusively to public career and portfolio documents.
