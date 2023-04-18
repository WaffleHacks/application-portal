"""change participant id to integer

Revision ID: 5663152229b0
Revises: 111fd0c489b8
Create Date: 2023-04-18 02:37:08.065079+00:00

"""
import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "5663152229b0"
down_revision = "111fd0c489b8"
branch_labels = None
depends_on = None

TABLES_WITH_FOREIGN_KEYS = ["applications", "event_attendance", "feedback"]


def upgrade():
    for table in TABLES_WITH_FOREIGN_KEYS:
        op.drop_constraint(f"{table}_participant_id_fkey", table, type_="foreignkey")
        op.alter_column(
            table,
            "participant_id",
            type_=sa.Integer(),
            nullable=False,
            postgresql_using="participant_id::integer",
        )

    op.alter_column(
        "participants",
        "id",
        type_=sa.Integer(),
        nullable=False,
        postgresql_using="id::integer",
    )

    for table in TABLES_WITH_FOREIGN_KEYS:
        op.create_foreign_key(
            None,
            table,
            "participants",
            ["participant_id"],
            ["id"],
            ondelete="CASCADE",
        )


def downgrade():
    for table in TABLES_WITH_FOREIGN_KEYS:
        op.drop_constraint(f"{table}_participant_id_fkey", table, type_="foreignkey")
        op.alter_column(
            table,
            "participant_id",
            type_=sqlmodel.sql.sqltypes.AutoString(),
            nullable=False,
        )

    op.alter_column(
        "participants",
        "id",
        type_=sqlmodel.sql.sqltypes.AutoString(),
        nullable=False,
    )

    for table in TABLES_WITH_FOREIGN_KEYS:
        op.create_foreign_key(
            None,
            table,
            "participants",
            ["participant_id"],
            ["id"],
            ondelete="CASCADE",
        )
