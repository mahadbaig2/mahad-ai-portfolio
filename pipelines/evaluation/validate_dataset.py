"""
Dataset validation script for Query Router dataset.

P7.1.4: Validation for unknown labels, duplicates, missing groups, invalid text,
and logical consistency between routing targets.
"""

import json
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Dict, List, Set

from pydantic import ValidationError

from pipelines.evaluation.schema import (
    AnswerabilityLabel,
    IntentLabel,
    LanguageLabel,
    QueryRouterSample,
    RouteLabel,
)


def validate_dataset(file_path: Path) -> Dict[str, Any]:
    print(f"=== Validating Query Router Dataset: {file_path} ===")
    
    if not file_path.exists():
        raise FileNotFoundError(f"Dataset file not found: {file_path}")
        
    with open(file_path, "r", encoding="utf-8") as f:
        try:
            raw_data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"ERROR: Invalid JSON in {file_path}: {e}")
            sys.exit(1)
            
    if not isinstance(raw_data, list):
        print("ERROR: Dataset root must be a JSON array of objects.")
        sys.exit(1)

    errors: List[str] = []
    warnings: List[str] = []
    
    samples: List[QueryRouterSample] = []
    seen_ids: Set[str] = set()
    seen_texts: Dict[str, str] = {}  # normalized text -> sample id
    groups: Dict[str, List[str]] = defaultdict(list)
    
    # Class counters
    route_counter: Counter = Counter()
    intent_counter: Counter = Counter()
    answerability_counter: Counter = Counter()
    language_counter: Counter = Counter()
    
    for idx, item in enumerate(raw_data):
        item_id = item.get("id", f"index_{idx}")
        
        # 1. Pydantic Schema Validation
        try:
            sample = QueryRouterSample(**item)
            samples.append(sample)
        except ValidationError as ve:
            errors.append(f"Sample [{item_id}] schema error: {ve}")
            continue
            
        # 2. Duplicate ID Check
        if sample.id in seen_ids:
            errors.append(f"Duplicate sample ID: '{sample.id}'")
        seen_ids.add(sample.id)
        
        # 3. Duplicate Text Check (Normalized lowercase)
        norm_text = sample.text.strip().lower()
        if norm_text in seen_texts:
            warnings.append(
                f"Duplicate query text: '{sample.text}' in [{sample.id}] matches [{seen_texts[norm_text]}]"
            )
        else:
            seen_texts[norm_text] = sample.id
            
        # 4. Group tracking
        groups[sample.group_id].append(sample.id)
        
        # 5. Logical consistency validation
        # Refusal route should map to refusal-like intents
        if sample.route == RouteLabel.REFUSAL:
            if sample.intent not in (IntentLabel.OUT_OF_DOMAIN, IntentLabel.PROMPT_INJECTION):
                errors.append(
                    f"Sample [{sample.id}]: Route is 'refusal' but intent is '{sample.intent.value}'"
                )
            if sample.answerability != AnswerabilityLabel.UNANSWERABLE:
                errors.append(
                    f"Sample [{sample.id}]: Route is 'refusal' but answerability is '{sample.answerability.value}'"
                )
                
        # Direct chat should map to conversational intents
        if sample.route == RouteLabel.DIRECT_CHAT:
            if sample.intent not in (IntentLabel.GREETING, IntentLabel.GENERAL_CHITCHAT, IntentLabel.CONTACT_INFO):
                warnings.append(
                    f"Sample [{sample.id}]: Route is 'direct_chat' with intent '{sample.intent.value}'"
                )
                
        # RAG retrieval should be answerable portfolio topics
        if sample.route == RouteLabel.RAG_RETRIEVAL:
            if sample.intent not in (
                IntentLabel.PROJECT_TECHNICAL,
                IntentLabel.PROJECT_OVERVIEW,
                IntentLabel.CAREER_SKILLS,
                IntentLabel.ARTICLE_DISCUSSION,
            ):
                warnings.append(
                    f"Sample [{sample.id}]: Route is 'rag_retrieval' with unusual intent '{sample.intent.value}'"
                )
            if sample.answerability != AnswerabilityLabel.ANSWERABLE:
                warnings.append(
                    f"Sample [{sample.id}]: Route is 'rag_retrieval' but marked unanswerable"
                )

        # Increment counts
        route_counter[sample.route.value] += 1
        intent_counter[sample.intent.value] += 1
        answerability_counter[sample.answerability.value] += 1
        language_counter[sample.language.value] += 1

    # 6. Group size checks
    single_sample_groups = [g for g, s_ids in groups.items() if len(s_ids) < 2]
    if single_sample_groups:
        warnings.append(
            f"{len(single_sample_groups)} groups have only 1 sample (paraphrases recommended for robust testing): {single_sample_groups}"
        )

    # Print Report
    print("\n--- Validation Summary ---")
    print(f"Total Records: {len(raw_data)}")
    print(f"Valid Records: {len(samples)}")
    print(f"Unique Groups: {len(groups)}")
    print(f"Errors Found:  {len(errors)}")
    print(f"Warnings:      {len(warnings)}")
    
    print("\n--- Distribution Breakdown ---")
    print("Routes:")
    for r, count in route_counter.most_common():
        pct = (count / len(samples)) * 100 if samples else 0
        print(f"  {r:<20}: {count:>4} ({pct:>5.1f}%)")
        
    print("\nIntents:")
    for i, count in intent_counter.most_common():
        pct = (count / len(samples)) * 100 if samples else 0
        print(f"  {i:<20}: {count:>4} ({pct:>5.1f}%)")
        
    print("\nAnswerability:")
    for a, count in answerability_counter.most_common():
        pct = (count / len(samples)) * 100 if samples else 0
        print(f"  {a:<20}: {count:>4} ({pct:>5.1f}%)")
        
    print("\nLanguages:")
    for l, count in language_counter.most_common():
        pct = (count / len(samples)) * 100 if samples else 0
        print(f"  {l:<20}: {count:>4} ({pct:>5.1f}%)")

    if warnings:
        print("\n--- Warnings ---")
        for w in warnings:
            print(f"  [WARN] {w}")

    if errors:
        print("\n--- Errors ---")
        for err in errors:
            print(f"  [FAIL] {err}")
        print("\nDataset validation FAILED.")
        sys.exit(1)
        
    print("\nDataset validation PASSED successfully with zero errors.")
    return {
        "total_records": len(raw_data),
        "valid_records": len(samples),
        "unique_groups": len(groups),
        "routes": dict(route_counter),
        "intents": dict(intent_counter),
        "answerability": dict(answerability_counter),
        "languages": dict(language_counter),
        "warnings": len(warnings),
    }


if __name__ == "__main__":
    dataset_file = Path("pipelines/evaluation/data/query_router_dataset.json")
    validate_dataset(dataset_file)
