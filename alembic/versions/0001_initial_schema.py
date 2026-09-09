"""Initial schema: documents, chunks, index_runs, chat, retrieval, and model_releases

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-09-09 07:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0001_initial_schema"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. source_documents
    op.create_table(
        "source_documents",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("sanity_id", sa.String(length=128), nullable=False),
        sa.Column("document_type", sa.String(length=64), nullable=False),
        sa.Column("slug", sa.String(length=256), nullable=False),
        sa.Column("title", sa.String(length=512), nullable=False),
        sa.Column("content_hash", sa.String(length=64), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("rag_enabled", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("publish_status", sa.String(length=32), nullable=False, server_default="published"),
        sa.Column("metadata_json", sa.JSON().with_variant(postgresql.JSONB(), "postgresql"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("sanity_id"),
    )
    op.create_index("ix_source_documents_sanity_id", "source_documents", ["sanity_id"])
    op.create_index("ix_source_documents_document_type", "source_documents", ["document_type"])
    op.create_index("ix_source_documents_slug", "source_documents", ["slug"])
    op.create_index("ix_source_documents_content_hash", "source_documents", ["content_hash"])
    op.create_index("ix_source_documents_rag_enabled", "source_documents", ["rag_enabled"])

    # 2. document_chunks
    op.create_table(
        "document_chunks",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("document_id", sa.UUID(), nullable=False),
        sa.Column("chunk_index", sa.Integer(), nullable=False),
        sa.Column("chunk_text", sa.Text(), nullable=False),
        sa.Column("token_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("heading_path", sa.String(length=512), nullable=False, server_default=""),
        sa.Column("chunk_hash", sa.String(length=64), nullable=False),
        sa.Column("embedding_model", sa.String(length=128), nullable=False),
        sa.Column("embedding_version", sa.String(length=32), nullable=False, server_default="1.0.0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["source_documents.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_document_chunks_document_id", "document_chunks", ["document_id"])
    op.create_index("ix_document_chunks_chunk_hash", "document_chunks", ["chunk_hash"])
    op.create_index("ix_document_chunks_is_active", "document_chunks", ["is_active"])
    op.create_index("ix_chunks_doc_active", "document_chunks", ["document_id", "is_active"])
    op.create_index("ix_chunks_model_version", "document_chunks", ["embedding_model", "embedding_version"])

    # 3. index_runs
    op.create_table(
        "index_runs",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("run_type", sa.String(length=32), nullable=False, server_default="incremental_sync"),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="started"),
        sa.Column("documents_scanned", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("documents_indexed", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("chunks_created", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("chunks_deactivated", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("error_summary", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    # 4. chat_sessions
    op.create_table(
        "chat_sessions",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("consent_given", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("persona", sa.String(length=32), nullable=False, server_default="general"),
        sa.Column("ip_hash", sa.String(length=64), nullable=True),
        sa.Column("user_agent_preview", sa.String(length=256), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_chat_sessions_consent_given", "chat_sessions", ["consent_given"])
    op.create_index("ix_chat_sessions_expires_at", "chat_sessions", ["expires_at"])

    # 5. chat_messages
    op.create_table(
        "chat_messages",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("session_id", sa.UUID(), nullable=False),
        sa.Column("role", sa.String(length=16), nullable=False),
        sa.Column("redacted_content", sa.Text(), nullable=False),
        sa.Column("language_detected", sa.String(length=16), nullable=True),
        sa.Column("intent_label", sa.String(length=64), nullable=True),
        sa.Column("route_taken", sa.String(length=32), nullable=True),
        sa.Column("latency_ms", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["session_id"], ["chat_sessions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_chat_messages_session_id", "chat_messages", ["session_id"])

    # 6. retrieval_events
    op.create_table(
        "retrieval_events",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("message_id", sa.UUID(), nullable=True),
        sa.Column("query_text", sa.Text(), nullable=False),
        sa.Column("rewritten_query", sa.Text(), nullable=True),
        sa.Column("chunks_retrieved_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("cited_chunk_ids", sa.JSON().with_variant(postgresql.JSONB(), "postgresql"), nullable=False),
        sa.Column("similarity_scores", sa.JSON().with_variant(postgresql.JSONB(), "postgresql"), nullable=False),
        sa.Column("evidence_score", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["message_id"], ["chat_messages.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_retrieval_events_message_id", "retrieval_events", ["message_id"])

    # 7. chat_feedback
    op.create_table(
        "chat_feedback",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("message_id", sa.UUID(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("feedback_reason", sa.String(length=512), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["message_id"], ["chat_messages.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_chat_feedback_message_id", "chat_feedback", ["message_id"])

    # 8. model_releases
    op.create_table(
        "model_releases",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("model_name", sa.String(length=128), nullable=False),
        sa.Column("model_version", sa.String(length=64), nullable=False),
        sa.Column("model_type", sa.String(length=64), nullable=False),
        sa.Column("artifact_path", sa.String(length=512), nullable=False),
        sa.Column("metrics_json", sa.JSON().with_variant(postgresql.JSONB(), "postgresql"), nullable=False),
        sa.Column("is_champion", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("approved_by", sa.String(length=128), nullable=True),
        sa.Column("promoted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("model_version"),
    )
    op.create_index("ix_model_releases_model_name", "model_releases", ["model_name"])
    op.create_index("ix_model_releases_model_version", "model_releases", ["model_version"])
    op.create_index("ix_model_releases_is_champion", "model_releases", ["is_champion"])
    op.create_index("ix_model_releases_name_champion", "model_releases", ["model_name", "is_champion"])


def downgrade() -> None:
    op.drop_table("model_releases")
    op.drop_table("chat_feedback")
    op.drop_table("retrieval_events")
    op.drop_table("chat_messages")
    op.drop_table("chat_sessions")
    op.drop_table("index_runs")
    op.drop_table("document_chunks")
    op.drop_table("source_documents")
