"""Add schools

Revision ID: 423e059e8b64
Revises: 58d2280520b8
Create Date: 2022-02-12 07:44:42.189067+00:00

"""
import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "423e059e8b64"
down_revision = "58d2280520b8"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "schools",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.add_column("applications", sa.Column("school_id", sa.Integer(), nullable=False))
    op.create_foreign_key(None, "applications", "schools", ["school_id"], ["id"])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, "applications", type_="foreignkey")
    op.drop_column("applications", "school_id")
    op.drop_table("schools")
    # ### end Alembic commands ###
