"""remove application draft status

Revision ID: 0cf086aa6b96
Revises: 5a4b8a4896fb
Create Date: 2022-05-29 20:48:52.443056+00:00

"""

import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "0cf086aa6b96"
down_revision = "5a4b8a4896fb"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("applications", "draft_status")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "applications",
        sa.Column(
            "draft_status",
            sa.Enum("PENDING", "REJECTED", "ACCEPTED", name="status"),
            server_default="PENDING",
            nullable=False,
        ),
    )
    # ### end Alembic commands ###
