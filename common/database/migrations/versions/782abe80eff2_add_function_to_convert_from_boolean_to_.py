"""add function to convert from boolean to bit

Revision ID: 782abe80eff2
Revises: 2d60be9a5968
Create Date: 2023-06-22 16:11:31.724421+00:00

"""

import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "782abe80eff2"
down_revision = "2d60be9a5968"
branch_labels = None
depends_on = None


BIT_BOOL_FUNCTION = """
CREATE OR REPLACE FUNCTION bit_bool(bool)
RETURNS bit
AS $$
    BEGIN
        RETURN (CASE WHEN $1 = true THEN 1::bit WHEN $1 = false THEN 0::bit END);
    END;
$$
LANGUAGE plpgsql;
"""


def upgrade():
    op.execute(BIT_BOOL_FUNCTION)


def downgrade():
    op.execute("DROP FUNCTION bit_bool")
