"""add description to events

Revision ID: 2d60be9a5968
Revises: 3d5fffb36407
Create Date: 2023-06-20 14:31:43.524717+00:00

"""
import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "2d60be9a5968"
down_revision = "3d5fffb36407"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "events",
        sa.Column("description", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("events", "description")
    # ### end Alembic commands ###
