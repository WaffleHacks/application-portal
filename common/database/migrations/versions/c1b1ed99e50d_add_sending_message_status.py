"""add sending message status

Revision ID: c1b1ed99e50d
Revises: 55cbf28ab22e
Create Date: 2022-06-06 06:47:20.137754+00:00

"""

import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "c1b1ed99e50d"
down_revision = "55cbf28ab22e"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.execute("ALTER TYPE message_status ADD VALUE 'SENDING'")
    # ### end Alembic commands ###


def downgrade():
    # Change rows to sent status
    op.execute("UPDATE messages SET status = 'SENT' WHERE status = 'SENDING'")

    # Rename the old type
    op.execute("ALTER TYPE message_status RENAME TO message_status_old")

    # Create a new type with the state removed
    op.execute("CREATE TYPE message_status AS ENUM('DRAFT', 'READY', 'SENT')")

    # Switch to the new enum
    op.execute(
        "ALTER TABLE messages ALTER COLUMN status TYPE message_status USING message_status_old::text::message_status"
    )

    # Remove the old type
    op.execute("DROP TYPE message_status_old")
