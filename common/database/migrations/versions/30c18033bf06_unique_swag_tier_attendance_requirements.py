"""unique swag tier attendance requirements

Revision ID: 30c18033bf06
Revises: c94b4d9f880f
Create Date: 2022-06-04 00:50:58.141711+00:00

"""
import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "30c18033bf06"
down_revision = "c94b4d9f880f"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_unique_constraint(None, "swag_tiers", ["required_attendance"])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, "swag_tiers", type_="unique")
    # ### end Alembic commands ###
