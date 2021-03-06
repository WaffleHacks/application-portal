"""add discord linking

Revision ID: ad76fc957eec
Revises: 98708b2dcb89
Create Date: 2022-05-18 04:03:23.907965+00:00

"""
import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "ad76fc957eec"
down_revision = "98708b2dcb89"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "discord_links",
        sa.Column("participant_id", sa.String(), nullable=False),
        sa.Column("id", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("username", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("discriminator", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("agreed_to_rules", sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(
            ["participant_id"], ["participants.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("participant_id"),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("discord_links")
    # ### end Alembic commands ###
