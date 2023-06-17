"""add check in start and end

Revision ID: 3d5fffb36407
Revises: 62b0211f43d3
Create Date: 2023-06-17 05:15:11.630162+00:00

"""
from datetime import datetime

import pytz
import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "3d5fffb36407"
down_revision = "62b0211f43d3"
branch_labels = None
depends_on = None


def upgrade():
    # We need to do this mess instead of using `ALTER TYPE <name> ADD VALUE <value>` since
    # we are trying to use the added values prior to the commit
    op.execute("ALTER TYPE key RENAME TO key_old")
    op.execute(
        "CREATE TYPE key AS ENUM('ACCEPTING_APPLICATIONS', 'CHECKIN_START', 'CHECKIN_END')"
    )

    op.execute(
        "ALTER TABLE settings ALTER COLUMN key TYPE key USING key::key_old::text::key"
    )

    op.execute("DROP TYPE key_old")

    # Set a dummy value for the setting
    now = datetime.now(tz=pytz.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")
    op.execute(
        f"INSERT INTO settings VALUES ('CHECKIN_START', '{now}'), ('CHECKIN_END', '{now}')"
    )


def downgrade():
    op.execute("DELETE FROM settings WHERE key IN ('CHECKIN_START', 'CHECKIN_END')")

    op.execute("ALTER TYPE key RENAME TO key_old")
    op.execute("CREATE TYPE key AS ENUM('ACCEPTING_APPLICATIONS')")

    op.execute(
        "ALTER TABLE settings ALTER COLUMN key TYPE key USING key::key_old::text::key"
    )

    op.execute("DROP TYPE key_old")
