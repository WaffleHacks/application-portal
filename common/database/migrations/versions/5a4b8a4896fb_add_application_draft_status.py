"""add application draft status

Revision ID: 5a4b8a4896fb
Revises: a2327cf14296
Create Date: 2022-05-29 01:14:04.196440+00:00

"""
import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "5a4b8a4896fb"
down_revision = "a2327cf14296"
branch_labels = None
depends_on = None


def upgrade():
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


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("applications", "draft_status")
    # ### end Alembic commands ###