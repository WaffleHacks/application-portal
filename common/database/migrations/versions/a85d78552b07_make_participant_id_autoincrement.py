"""make participant id autoincrement

Revision ID: a85d78552b07
Revises: bac759e7498c
Create Date: 2023-04-18 18:52:01.934234+00:00

"""
import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "a85d78552b07"
down_revision = "bac759e7498c"
branch_labels = None
depends_on = None

sequence: sa.Sequence = sa.Sequence("participant_id_seq")


def upgrade():
    bind = op.get_bind()
    sa.sql.ddl.CreateSequence(sequence).execute(bind)
    op.alter_column(
        "participants",
        "id",
        server_default=sequence.next_value(),
    )


def downgrade():
    op.alter_column("participants", "id", server_default=None)
    bind = op.get_bind()
    sa.sql.ddl.DropSequence(sequence).execute(bind)
