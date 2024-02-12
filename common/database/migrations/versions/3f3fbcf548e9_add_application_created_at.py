"""add application created at

Revision ID: 3f3fbcf548e9
Revises: 07061a7c250f
Create Date: 2022-04-30 08:01:06.360411+00:00

"""

import sqlalchemy as sa
import sqlmodel
from alembic import op

from common.database.tables.types import TimeStamp

# revision identifiers, used by Alembic.
revision = "3f3fbcf548e9"
down_revision = "07061a7c250f"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "applications",
        sa.Column(
            "created_at",
            TimeStamp(),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )


def downgrade():
    op.drop_column("applications", "created_at")
