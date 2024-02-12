"""make applications date_of_birth a date

Revision ID: 8b11d0c53677
Revises: ef1249d3aa86
Create Date: 2023-05-21 20:05:05.883852+00:00

"""

import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "8b11d0c53677"
down_revision = "ef1249d3aa86"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        "applications",
        "date_of_birth",
        nullable=False,
        type_=sa.Date(),
        postgresql_using="to_date(date_of_birth, 'DD-MM-YYYY')",
    )


def downgrade():
    op.alter_column(
        "applications",
        "date_of_birth",
        nullable=False,
        type_=sqlmodel.sql.sqltypes.AutoString(),
        postgresql_using="to_char(date_of_birth, 'DD-MM-YYYY')",
    )
