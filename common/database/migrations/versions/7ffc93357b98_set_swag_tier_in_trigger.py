"""set swag tier in trigger

Revision ID: 7ffc93357b98
Revises: 30c18033bf06
Create Date: 2022-06-04 01:33:56.049202+00:00

"""
import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "7ffc93357b98"
down_revision = "30c18033bf06"
branch_labels = None
depends_on = None

function = """
CREATE FUNCTION application_portal_set_swag_tier_on_accept_function() RETURNS trigger AS $$
    BEGIN
        UPDATE participants SET swag_tier_id = (
            SELECT id
            FROM swag_tiers
            ORDER BY required_attendance
            LIMIT 1
        ) WHERE id = NEW.participant_id;
        RETURN coalesce(NEW, OLD);
    END;
$$ LANGUAGE plpgsql;
"""

trigger = """
CREATE TRIGGER application_portal_set_swag_tier_on_accept_trigger
    AFTER UPDATE OF status ON applications
    FOR EACH ROW
    WHEN ( NEW.status = 'ACCEPTED' )
    EXECUTE FUNCTION application_portal_set_swag_tier_on_accept_function();
"""


def upgrade():
    op.execute(function)
    op.execute(trigger)


def downgrade():
    op.execute("DROP TRIGGER application_portal_set_swag_tier_on_accept_trigger")
    op.execute("DROP FUNCTION application_portal_set_swag_tier_on_accept_function")
