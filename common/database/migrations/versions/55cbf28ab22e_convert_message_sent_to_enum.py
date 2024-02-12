"""convert message sent to enum

Revision ID: 55cbf28ab22e
Revises: 7ffc93357b98
Create Date: 2022-06-06 06:07:27.120547+00:00

"""

import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "55cbf28ab22e"
down_revision = "7ffc93357b98"
branch_labels = None
depends_on = None


def upgrade():
    # Add the new column
    enum = sa.Enum("DRAFT", "READY", "SENT", name="message_status")
    enum.create(op.get_bind())
    op.add_column(
        "messages",
        sa.Column(
            "status",
            enum,
            server_default="DRAFT",
        ),
    )

    # Convert the sent boolean to its enum form
    op.execute("UPDATE messages SET status = 'DRAFT' WHERE sent = false")
    op.execute("UPDATE messages SET status = 'SENT' WHERE sent = true")

    # Remove the old column and make status non-null
    op.alter_column("messages", "status", nullable=False)
    op.drop_column("messages", "sent")


def downgrade():
    # Add the old column
    op.add_column("messages", sa.Column("sent", sa.BOOLEAN(), autoincrement=False))

    # Convert back to a boolean
    op.execute(
        "UPDATE messages SET sent = false WHERE status = 'DRAFT' OR status = 'READY'"
    )
    op.execute("UPDATE messages SET sent = true WHERE status = 'SENT'")

    # Remove status column and make sent non-null
    op.alter_column("messages", "sent", nullable=False)
    op.drop_column("messages", "status")
