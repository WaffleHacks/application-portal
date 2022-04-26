"""seed schools

Revision ID: 8d04b7943264
Revises: 03e3fe94e1ed
Create Date: 2022-04-18 00:38:38.618682+00:00

"""
import json
from os import getcwd
from pathlib import Path

import sqlalchemy as sa
import sqlalchemy.sql as sql
import sqlmodel
from alembic import context, op

# revision identifiers, used by Alembic.
revision = "8d04b7943264"
down_revision = "03e3fe94e1ed"
branch_labels = None
depends_on = None

# Ad-hoc schools table for bulk import
schools_table = sql.table(
    "schools", sql.column("id", sa.String), sql.column("name", sa.String)
)


def load_schools():
    migrations_dir = Path(getcwd(), context.script.dir)
    schools_path = migrations_dir.joinpath("schools.json")
    return json.load(open(schools_path, "r"))


def upgrade():
    # Change schools.id to a string
    op.drop_constraint(
        "applications_school_id_fkey", "applications", type_="foreignkey"
    )
    op.alter_column(
        "applications",
        "school_id",
        type_=sqlmodel.sql.sqltypes.AutoString(),
        nullable=False,
    )
    op.alter_column(
        "schools", "id", type_=sqlmodel.sql.sqltypes.AutoString(), nullable=False
    )
    op.create_foreign_key(
        None, "applications", "schools", ["school_id"], ["id"], ondelete="CASCADE"
    )

    # Insert stuff
    schools = load_schools()
    op.bulk_insert(schools_table, [{"id": s["id"], "name": s["name"]} for s in schools])


def downgrade():
    # Delete added records
    schools = load_schools()
    for school in schools:
        op.execute(
            schools_table.delete().where(
                schools_table.c.id == op.inline_literal(school["id"])
            )
        )

    # Change schools.id back to an integer
    op.drop_constraint(
        "applications_school_id_fkey", "applications", type_="foreignkey"
    )
    op.alter_column(
        "applications",
        "school_id",
        type_=sa.Integer(),
        nullable=False,
        postgresql_using="school_id::integer",
    )
    op.alter_column(
        "schools",
        "id",
        type_=sa.Integer(),
        nullable=False,
        postgresql_using="id::integer",
    )
    op.create_foreign_key(
        None, "applications", "schools", ["school_id"], ["id"], ondelete="CASCADE"
    )
