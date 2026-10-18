"""Add voice_session_usages table for accounting and quota protection

Revision ID: 0002_voice_session_usage
Revises: 0001_initial_schema
Create Date: 2026-10-03 04:30:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0002_voice_session_usage"
down_revision: str | None = "0001_initial_schema"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "voice_session_usages",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("session_id", sa.String(length=128), nullable=False),
        sa.Column("provider_conversation_id", sa.String(length=128), nullable=True),
        sa.Column("ip_hash", sa.String(length=64), nullable=True),
        sa.Column("reserved_seconds", sa.Integer(), nullable=False, server_default="120"),
        sa.Column("used_seconds", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="reserved"),
        sa.Column("termination_reason", sa.String(length=128), nullable=True),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("session_id"),
    )
    op.create_index("ix_voice_session_usages_session_id", "voice_session_usages", ["session_id"])
    op.create_index("ix_voice_session_usages_provider_conv_id", "voice_session_usages", ["provider_conversation_id"])
    op.create_index("ix_voice_session_usages_ip_hash", "voice_session_usages", ["ip_hash"])
    op.create_index("ix_voice_session_usages_status", "voice_session_usages", ["status"])


def downgrade() -> None:
    op.drop_index("ix_voice_session_usages_status", table_name="voice_session_usages")
    op.drop_index("ix_voice_session_usages_ip_hash", table_name="voice_session_usages")
    op.drop_index("ix_voice_session_usages_provider_conv_id", table_name="voice_session_usages")
    op.drop_index("ix_voice_session_usages_session_id", table_name="voice_session_usages")
    op.drop_table("voice_session_usages")
