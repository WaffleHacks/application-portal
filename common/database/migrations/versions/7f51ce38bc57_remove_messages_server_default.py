"""remove messages server default

Revision ID: 7f51ce38bc57
Revises: d2388da5bbfd
Create Date: 2022-05-06 18:55:36.778505+00:00

"""
import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "7f51ce38bc57"
down_revision = "d2388da5bbfd"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column("messages", "created_at", server_default=None)
    op.alter_column("messages", "updated_at", server_default=None)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column("messages", "created_at", server_default=sa.func.now())
    op.alter_column("messages", "updated_at", server_default=sa.func.now())
    # ### end Alembic commands ###