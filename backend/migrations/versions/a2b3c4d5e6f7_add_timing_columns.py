"""Add response_ms and is_timed columns to user_responses

Revision ID: a2b3c4d5e6f7
Revises: 6c1a91a3737b
Create Date: 2026-04-17 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "a2b3c4d5e6f7"
down_revision = "6c1a91a3737b"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("user_responses", sa.Column("response_ms", sa.Integer(), nullable=True))
    op.add_column("user_responses", sa.Column("is_timed", sa.Boolean(), server_default="false", nullable=False))


def downgrade():
    op.drop_column("user_responses", "is_timed")
    op.drop_column("user_responses", "response_ms")
