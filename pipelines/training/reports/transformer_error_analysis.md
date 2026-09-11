# Transformer Router (MiniLM-L6-v2) Error Analysis & Evaluation Report

- **Model**: `MiniLM-L6-v2-multitask`
- **Best Checkpoint Epoch**: 14
- **Evaluated Split**: Locked Human-Authored Test Set (`test.json`)

## 1. Executive Summary & Metrics

| Metric | Transformer (Candidate-v2) | Target / Threshold |
|---|---|---|
| **Test Route Macro F1** | **0.8322** | Superior to Baseline |
| **Test Intent Macro F1** | **0.2381** | Superior to Baseline |
| **Test Route Accuracy** | **85.0%** | - |
| **Test Intent Accuracy** | **35.0%** | - |
| **Refusal Recall (Safety Gate)** | **62.5%** | >= Baseline (50.0%) |
| **Roman Urdu Slice Route F1** | **0.8667** | >= Baseline |
| **English Slice Route F1** | **0.8056** | - |
| **Inference Latency (p50)** | **14.82 ms** | < 25 ms |
| **Inference Latency (p95)** | **16.77 ms** | < 25 ms |

## 2. Predeclared Promotion Rules Evaluation (P8.1.7)

Overall Promotion Recommendation: **RECOMMEND PROMOTION**

- **rule_1_route_macro_f1_superior**: PASSED (Candidate route macro F1 must be superior to baseline)
- **rule_2_intent_macro_f1_superior**: PASSED (Candidate intent macro F1 must be superior to baseline)
- **rule_3_refusal_recall_no_regression**: PASSED (Critical refusal/out-of-domain recall must not regress below baseline)
- **rule_4_roman_urdu_no_regression**: PASSED (Roman Urdu slice route F1 must not regress below baseline)
- **rule_5_latency_under_budget**: PASSED (Candidate p95 latency must be under 25.0 ms)

## 3. Route Confusion Matrix

- Labels: `[[4, 0, 0], [0, 8, 0], [3, 0, 5]]`

## 4. Test Split Errors (14 errors)
- **[q025]** `"What frontend, backend and retrieval technologies are used in Legal AI?"` (Lang: en)
  - Route : true=`rag_retrieval`, pred=`rag_retrieval` (conf=0.81)
  - Intent: true=`project_technical`, pred=`project_overview` (conf=0.24)
- **[q026]** `"How does Legal AI perform semantic search over an uploaded document?"` (Lang: en)
  - Route : true=`rag_retrieval`, pred=`rag_retrieval` (conf=0.76)
  - Intent: true=`project_technical`, pred=`project_overview` (conf=0.22)
- **[q029]** `"What is the Mahad AI Portfolio project?"` (Lang: en)
  - Route : true=`rag_retrieval`, pred=`rag_retrieval` (conf=0.88)
  - Intent: true=`project_overview`, pred=`career_skills` (conf=0.26)
- **[q030]** `"Why is Mahad treating his portfolio as an AI product instead of a static website?"` (Lang: en)
  - Route : true=`rag_retrieval`, pred=`rag_retrieval` (conf=0.85)
  - Intent: true=`project_overview`, pred=`career_skills` (conf=0.23)
- **[q031]** `"What capabilities is the AI-native portfolio intended to demonstrate?"` (Lang: en)
  - Route : true=`rag_retrieval`, pred=`rag_retrieval` (conf=0.90)
  - Intent: true=`project_overview`, pred=`career_skills` (conf=0.28)
- **[q032]** `"Mahad ka AI portfolio normal portfolio website se different kaise hai?"` (Lang: ur)
  - Route : true=`rag_retrieval`, pred=`rag_retrieval` (conf=0.87)
  - Intent: true=`project_overview`, pred=`career_skills` (conf=0.22)
- **[q058]** `"Good evening, hope you're doing well."` (Lang: en)
  - Route : true=`direct_chat`, pred=`direct_chat` (conf=0.84)
  - Intent: true=`greeting`, pred=`general_chitchat` (conf=0.38)
- **[q059]** `"Subah bakhair"` (Lang: ur)
  - Route : true=`direct_chat`, pred=`direct_chat` (conf=0.72)
  - Intent: true=`greeting`, pred=`general_chitchat` (conf=0.33)
- **[q060]** `"Assalam o Alaikum, umeed hai sab theek hoga."` (Lang: ur)
  - Route : true=`direct_chat`, pred=`direct_chat` (conf=0.92)
  - Intent: true=`greeting`, pred=`general_chitchat` (conf=0.45)
- **[q079]** `"What is the capital of France?"` (Lang: en)
  - Route : true=`refusal`, pred=`direct_chat` (conf=0.36)
  - Intent: true=`out_of_domain`, pred=`greeting` (conf=0.15)
- **[q080]** `"Who was the first person to walk on the moon?"` (Lang: en)
  - Route : true=`refusal`, pred=`refusal` (conf=0.43)
  - Intent: true=`out_of_domain`, pred=`general_chitchat` (conf=0.14)
- **[q081]** `"Explain the causes of the Second World War."` (Lang: en)
  - Route : true=`refusal`, pred=`direct_chat` (conf=0.35)
  - Intent: true=`out_of_domain`, pred=`out_of_domain` (conf=0.18)
- **[q082]** `"Pakistan ka sab se bara shehar konsa hai?"` (Lang: ur)
  - Route : true=`refusal`, pred=`direct_chat` (conf=0.49)
  - Intent: true=`out_of_domain`, pred=`general_chitchat` (conf=0.19)
- **[q083]** `"Can you book a flight from Islamabad to London?"` (Lang: en)
  - Route : true=`refusal`, pred=`refusal` (conf=0.64)
  - Intent: true=`out_of_domain`, pred=`prompt_injection` (conf=0.15)
