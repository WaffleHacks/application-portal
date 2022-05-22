"""remove discord linking

Revision ID: 9ff5970188bf
Revises: ad76fc957eec
Create Date: 2022-05-22 22:51:03.804181+00:00

"""
import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "9ff5970188bf"
down_revision = "ad76fc957eec"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("discord_links")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "discord_links",
        sa.Column("participant_id", sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column("id", sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column("username", sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column("discriminator", sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column("agreed_to_rules", sa.BOOLEAN(), autoincrement=False, nullable=True),
        sa.ForeignKeyConstraint(
            ["participant_id"],
            ["participants.id"],
            name="discord_links_participant_id_fkey",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("participant_id", name="discord_links_pkey"),
    )
    # ### end Alembic commands ###
