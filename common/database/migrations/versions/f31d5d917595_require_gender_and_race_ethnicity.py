"""require gender and race/ethnicity

Revision ID: f31d5d917595
Revises: 6369ca71dc38
Create Date: 2022-04-18 06:33:04.850673+00:00

"""
import sqlalchemy as sa
import sqlmodel
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "f31d5d917595"
down_revision = "6369ca71dc38"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "applications",
        "gender",
        existing_type=postgresql.ENUM(
            "MALE", "FEMALE", "NON_BINARY", "OTHER", name="gender"
        ),
        nullable=False,
    )
    op.alter_column(
        "applications",
        "race_ethnicity",
        existing_type=postgresql.ENUM(
            "AMERICAN_INDIAN",
            "ASIAN",
            "PACIFIC_ISLANDER",
            "BLACK",
            "HISPANIC",
            "CAUCASIAN",
            "MULTIPLE_OTHER",
            name="raceethnicity",
        ),
        nullable=False,
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "applications",
        "race_ethnicity",
        existing_type=postgresql.ENUM(
            "AMERICAN_INDIAN",
            "ASIAN",
            "PACIFIC_ISLANDER",
            "BLACK",
            "HISPANIC",
            "CAUCASIAN",
            "MULTIPLE_OTHER",
            name="raceethnicity",
        ),
        nullable=True,
    )
    op.alter_column(
        "applications",
        "gender",
        existing_type=postgresql.ENUM(
            "MALE", "FEMALE", "NON_BINARY", "OTHER", name="gender"
        ),
        nullable=True,
    )
    # ### end Alembic commands ###
