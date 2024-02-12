"""add project code to participants table

Revision ID: ed2fee02e591
Revises: fcdb492ecec9
Create Date: 2023-06-24 15:56:25.393662+00:00

"""

import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "ed2fee02e591"
down_revision = "fcdb492ecec9"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "participants",
        sa.Column(
            "project_code",
            sqlmodel.sql.sqltypes.AutoString(),
            nullable=False,
            server_default=sa.func.substr(
                sa.func.md5(sa.func.random().cast(sa.String)),
                0,
                8,
            ),
        ),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("participants", "project_code")
    # ### end Alembic commands ###
