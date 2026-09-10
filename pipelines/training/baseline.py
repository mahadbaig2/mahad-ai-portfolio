"""
Query Router Baseline Model Architecture (TF-IDF + Logistic Regression).
"""

from typing import Any, Dict, List
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import FeatureUnion


class QueryRouterBaseline:
    """Multi-task baseline router combining word + char TF-IDF with Logistic Regression heads."""

    def __init__(self, seed: int = 42, c_param: float = 1.0):
        self.seed = seed
        self.c_param = c_param
        self.vectorizer = FeatureUnion([
            (
                "word",
                TfidfVectorizer(
                    ngram_range=(1, 2),
                    min_df=1,
                    sublinear_tf=True,
                    token_pattern=r"(?u)\b\w+\b",
                ),
            ),
            (
                "char",
                TfidfVectorizer(
                    analyzer="char_wb",
                    ngram_range=(3, 5),
                    min_df=1,
                    sublinear_tf=True,
                ),
            ),
        ])
        self.route_clf = LogisticRegression(
            C=self.c_param,
            max_iter=1000,
            random_state=self.seed,
            class_weight="balanced",
        )
        self.intent_clf = LogisticRegression(
            C=self.c_param,
            max_iter=1000,
            random_state=self.seed,
            class_weight="balanced",
        )
        self.answerability_clf = LogisticRegression(
            C=self.c_param,
            max_iter=1000,
            random_state=self.seed,
            class_weight="balanced",
        )
        self.language_clf = LogisticRegression(
            C=self.c_param,
            max_iter=1000,
            random_state=self.seed,
        )

    def fit(self, texts: List[str], routes: List[str], intents: List[str], answerabilities: List[str], languages: List[str]):
        X = self.vectorizer.fit_transform(texts)
        self.route_clf.fit(X, routes)
        self.intent_clf.fit(X, intents)
        self.answerability_clf.fit(X, answerabilities)
        self.language_clf.fit(X, languages)
        return self

    def predict(self, texts: List[str]) -> Dict[str, Any]:
        X = self.vectorizer.transform(texts)
        route_preds = self.route_clf.predict(X)
        route_probs = self.route_clf.predict_proba(X)
        route_max_conf = np.max(route_probs, axis=1)

        intent_preds = self.intent_clf.predict(X)
        intent_probs = self.intent_clf.predict_proba(X)
        intent_max_conf = np.max(intent_probs, axis=1)

        ans_preds = self.answerability_clf.predict(X)
        lang_preds = self.language_clf.predict(X)

        return {
            "route": route_preds,
            "route_conf": route_max_conf,
            "route_classes": list(self.route_clf.classes_),
            "intent": intent_preds,
            "intent_conf": intent_max_conf,
            "intent_classes": list(self.intent_clf.classes_),
            "answerability": ans_preds,
            "language": lang_preds,
        }

    def predict_single(self, text: str) -> Dict[str, Any]:
        res = self.predict([text])
        return {
            "text": text,
            "route": res["route"][0],
            "route_confidence": float(res["route_conf"][0]),
            "intent": res["intent"][0],
            "intent_confidence": float(res["intent_conf"][0]),
            "answerability": res["answerability"][0],
            "language": res["language"][0],
        }
