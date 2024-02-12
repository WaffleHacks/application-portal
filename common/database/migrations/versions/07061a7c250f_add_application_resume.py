"""add application resume

Revision ID: 07061a7c250f
Revises: 378a9b9a491b
Create Date: 2022-04-26 08:00:47.428979+00:00

"""

import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "07061a7c250f"
down_revision = "378a9b9a491b"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "applications",
        sa.Column("resume", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    )


def downgrade():
    op.drop_column("applications", "resume")
