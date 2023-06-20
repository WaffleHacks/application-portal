"""add index to event code

Revision ID: 5bebce7e47f3
Revises: 185da460c739
Create Date: 2023-06-17 02:52:51.180893+00:00

"""
import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "5bebce7e47f3"
down_revision = "185da460c739"
branch_labels = None
depends_on = None


def upgrade():
    op.create_index("events_code_key", "events", ["code"])


def downgrade():
    op.drop_index("events_code_key")
