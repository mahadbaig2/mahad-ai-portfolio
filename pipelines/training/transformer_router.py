"""
Transformer-based Multi-Task Query Router Model.

Architecture:
- Backbone: sentence-transformers/all-MiniLM-L6-v2 (384-dim hidden state)
- Pooling: Attention-mask-aware mean pooling
- Heads:
    - Route classifier: Linear(384, 3)
    - Intent classifier: Linear(384, 9)
    - Answerability classifier: Linear(384, 2)
    - Language classifier: Linear(384, 2)
"""

import os
from typing import Dict, List, Optional, Tuple, Any
import numpy as np
import torch
import torch.nn as nn
from transformers import AutoModel, AutoTokenizer


class MiniLMQueryRouter(nn.Module):
    """Multi-task query router model backed by MiniLM-L6-v2."""

    def __init__(
        self,
        backbone_name: str = "sentence-transformers/all-MiniLM-L6-v2",
        num_routes: int = 3,
        num_intents: int = 9,
        num_answerabilities: int = 2,
        num_languages: int = 2,
        dropout_rate: float = 0.2,
    ):
        super().__init__()
        self.backbone_name = backbone_name
        self.num_routes = num_routes
        self.num_intents = num_intents
        self.num_answerabilities = num_answerabilities
        self.num_languages = num_languages

        self.transformer = AutoModel.from_pretrained(backbone_name, local_files_only=True)
        hidden_size = self.transformer.config.hidden_size  # 384 for MiniLM-L6

        self.dropout = nn.Dropout(dropout_rate)
        self.route_head = nn.Linear(hidden_size, num_routes)
        self.intent_head = nn.Linear(hidden_size, num_intents)
        self.ans_head = nn.Linear(hidden_size, num_answerabilities)
        self.lang_head = nn.Linear(hidden_size, num_languages)

    def mean_pooling(self, token_embeddings: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
        """Mean pooling respecting attention mask."""
        input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
        sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, 1)
        sum_mask = torch.clamp(input_mask_expanded.sum(1), min=1e-9)
        return sum_embeddings / sum_mask

    def forward(
        self,
        input_ids: torch.Tensor,
        attention_mask: torch.Tensor,
        token_type_ids: Optional[torch.Tensor] = None,
    ) -> Dict[str, torch.Tensor]:
        kwargs = {"input_ids": input_ids, "attention_mask": attention_mask}
        if token_type_ids is not None and "token_type_ids" in self.transformer.forward.__code__.co_varnames:
            kwargs["token_type_ids"] = token_type_ids

        outputs = self.transformer(**kwargs)
        pooled = self.mean_pooling(outputs.last_hidden_state, attention_mask)
        pooled = self.dropout(pooled)

        return {
            "route_logits": self.route_head(pooled),
            "intent_logits": self.intent_head(pooled),
            "ans_logits": self.ans_head(pooled),
            "lang_logits": self.lang_head(pooled),
            "embeddings": pooled,
        }
