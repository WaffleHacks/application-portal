"""participant id as string

Revision ID: 7afacd80d932
Revises: 11505f38b11f
Create Date: 2022-04-04 04:34:56.202331+00:00

"""

import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "7afacd80d932"
down_revision = "11505f38b11f"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(
        "applications_participant_id_fkey", "applications", type_="foreignkey"
    )
    op.alter_column(
        "applications",
        "participant_id",
        type_=sqlmodel.sql.sqltypes.AutoString(),
        nullable=False,
    )
    op.alter_column(
        "participants", "id", type_=sqlmodel.sql.sqltypes.AutoString(), nullable=False
    )
    op.create_foreign_key(
        None,
        "applications",
        "participants",
        ["participant_id"],
        ["id"],
        ondelete="CASCADE",
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(
        "applications_participant_id_fkey", "applications", type_="foreignkey"
    )
    op.alter_column(
        "applications", "participant_id", type_=sa.Integer(), nullable=False
    )
    op.alter_column("participants", "id", type_=sa.Integer(), nullable=False)
    op.create_foreign_key(
        None,
        "applications",
        "participants",
        ["participant_id"],
        ["id"],
        ondelete="CASCADE",
    )
    # ### end Alembic commands ###
