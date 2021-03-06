"""add events

Revision ID: 02338256c6aa
Revises: 108677b68119
Create Date: 2022-06-01 03:17:51.063172+00:00

"""
import sqlalchemy as sa
import sqlmodel
from alembic import op

from common.database.tables.types import TimeStamp

# revision identifiers, used by Alembic.
revision = "02338256c6aa"
down_revision = "108677b68119"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "events",
        sa.Column(
            "valid_from",
            TimeStamp(timezone=True),
            nullable=False,
        ),
        sa.Column(
            "valid_until",
            TimeStamp(timezone=True),
            nullable=False,
        ),
        sa.Column("name", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("code", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("enabled", sa.Boolean(), nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("events")
    # ### end Alembic commands ###
