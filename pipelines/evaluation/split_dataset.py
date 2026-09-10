"""
Group-Aware Dataset Splitting Script for Query Router.

P7.2.4: Create group-aware train/validation/test split.
P7.2.5: Keep final locked test set human-authored / clean.
P7.2.6: Run leakage and class-balance report.

Invariants:
- Never allow queries from the same group_id to leak across splits.
- Guarantee: set(train_groups) & set(val_groups) & set(test_groups) == empty
- Stratify by route where possible to ensure test and val sets have coverage
  of rag_retrieval, direct_chat, and refusal, in both English and Roman Urdu.
"""

import json
import random
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Dict, List, Set, Tuple


def load_dataset(file_path: Path) -> List[Dict[str, Any]]:
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_split(data: List[Dict[str, Any]], dest_path: Path) -> None:
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    with open(dest_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(data)} samples to {dest_path}")


def split_groups(
    samples: List[Dict[str, Any]],
    seed: int = 42,
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Splits records based on group_id to ensure zero paraphrase leakage.
    Balances dominant routes across splits.
    """
    random.seed(seed)

    # Group records by group_id
    groups: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    group_primary_route: Dict[str, str] = {}

    for s in samples:
        gid = s["group_id"]
        groups[gid].append(s)
        # Determine group's primary route
        if gid not in group_primary_route:
            group_primary_route[gid] = s["route"]

    # Stratify groups by primary route
    route_groups: Dict[str, List[str]] = defaultdict(list)
    for gid, route in group_primary_route.items():
        route_groups[route].append(gid)

    train_groups: Set[str] = set()
    val_groups: Set[str] = set()
    test_groups: Set[str] = set()

    for route, g_list in route_groups.items():
        # Shuffle deterministically
        shuffled = list(g_list)
        random.shuffle(shuffled)
        
        n_total = len(shuffled)
        if n_total == 1:
            # Single group goes to train
            train_groups.add(shuffled[0])
            continue

        n_test = max(1, round(n_total * test_ratio))
        n_val = max(1, round(n_total * val_ratio))
        # Ensure train gets the remainder
        if n_test + n_val >= n_total:
            n_test = 1
            n_val = 1 if n_total > 2 else 0

        cur_test = shuffled[:n_test]
        cur_val = shuffled[n_test : n_test + n_val]
        cur_train = shuffled[n_test + n_val :]

        test_groups.update(cur_test)
        val_groups.update(cur_val)
        train_groups.update(cur_train)

    # Assign samples based on group set
    train_samples = [s for s in samples if s["group_id"] in train_groups]
    val_samples = [s for s in samples if s["group_id"] in val_groups]
    test_samples = [s for s in samples if s["group_id"] in test_groups]

    return train_samples, val_samples, test_samples


def verify_anti_leakage(
    train_samples: List[Dict[str, Any]],
    val_samples: List[Dict[str, Any]],
    test_samples: List[Dict[str, Any]],
) -> None:
    train_groups = {s["group_id"] for s in train_samples}
    val_groups = {s["group_id"] for s in val_samples}
    test_groups = {s["group_id"] for s in test_samples}

    tv_leak = train_groups & val_groups
    tt_leak = train_groups & test_groups
    vt_leak = val_groups & test_groups

    print("\n--- Leakage Verification ---")
    print(f"Train Groups: {len(train_groups)} | Val Groups: {len(val_groups)} | Test Groups: {len(test_groups)}")
    
    if tv_leak or tt_leak or vt_leak:
        raise ValueError(
            f"DATA LEAKAGE DETECTED!\n"
            f"Train/Val overlap: {tv_leak}\n"
            f"Train/Test overlap: {tt_leak}\n"
            f"Val/Test overlap: {vt_leak}"
        )
    print("Zero leakage verified: All group sets are completely disjoint.")


def print_split_report(split_name: str, split_data: List[Dict[str, Any]]) -> None:
    routes = Counter(s["route"] for s in split_data)
    intents = Counter(s["intent"] for s in split_data)
    languages = Counter(s["language"] for s in split_data)
    answerabilities = Counter(s["answerability"] for s in split_data)
    total = len(split_data)

    print(f"\n==========================================")
    print(f"Split: {split_name.upper()} ({total} samples, {len(set(s['group_id'] for s in split_data))} groups)")
    print(f"==========================================")
    print("Routes:")
    for k, v in routes.most_common():
        print(f"  {k:<20}: {v:>3} ({(v/total)*100:>5.1f}%)")
    print("Languages:")
    for k, v in languages.most_common():
        print(f"  {k:<20}: {v:>3} ({(v/total)*100:>5.1f}%)")
    print("Answerability:")
    for k, v in answerabilities.most_common():
        print(f"  {k:<20}: {v:>3} ({(v/total)*100:>5.1f}%)")
    print("Intents:")
    for k, v in intents.most_common():
        print(f"  {k:<20}: {v:>3} ({(v/total)*100:>5.1f}%)")


def run_split() -> None:
    dataset_path = Path("pipelines/evaluation/data/query_router_dataset.json")
    out_dir = Path("pipelines/evaluation/data")

    samples = load_dataset(dataset_path)
    train, val, test = split_groups(samples, seed=42)

    verify_anti_leakage(train, val, test)

    print_split_report("Train", train)
    print_split_report("Validation", val)
    print_split_report("Locked Test", test)

    # Save to disk
    save_split(train, out_dir / "train.json")
    save_split(val, out_dir / "val.json")
    save_split(test, out_dir / "test.json")


if __name__ == "__main__":
    run_split()
