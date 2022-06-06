import logging
from collections import namedtuple
from typing import Dict, List
from urllib.parse import urljoin, urlparse

from aiohttp import ClientSession
from aws_requests_auth.boto_utils import BotoAWSRequestsAuth
from boto3.session import Session
from pydantic import parse_obj_as
from sqlalchemy.future import select

from common import SETTINGS
from common.database import Participant, db_context

from .models import Profile

session = Session()
credentials = session.get_credentials()

logger = logging.getLogger(__name__)


async def sync():
    """
    Perform the initial sync of participants on boot
    """
    if SETTINGS.sync.disable_initial_pull:
        logger.info("skipping initial synchronization")
        return

    async with db_context() as db:
        result = await db.execute(select(Participant.id))
        participants = set(result.scalars().all())

        profiles = await fetch_profiles()

        # We don't particularly care if the u
        if len(participants) >= len(profiles):
            logger.info("already in sync")
            return

        logger.info("databases out of sync, fixing...")

        for profile in profiles:
            if profile.id not in participants:
                logger.debug(f"adding {profile.id}")

                db.add(Participant.from_orm(profile))

        await db.commit()
        logger.info("initial sync complete!")


async def fetch_profiles() -> List[Profile]:
    """
    Get a list of all the known profiles
    """
    url = urljoin(SETTINGS.sync.profiles_api, "manage")
    headers = generate_auth_headers(url)

    async with ClientSession(headers=headers, raise_for_status=True) as client:
        response = await client.get(url)
        json = await response.json()

        return parse_obj_as(List[Profile], json)


def generate_auth_headers(url: str) -> Dict[str, str]:
    """
    Generate AWS signature v4 authorization headers for the given URL
    """
    # Create a fake requests.Request
    Request = namedtuple("Request", ["url", "body", "method"])
    request = Request(url=url, body=None, method="GET")

    # Initialize the auth
    parts = urlparse(url)
    auth = BotoAWSRequestsAuth(parts.hostname, session.region_name, "execute-api")

    # Generate the headers
    frozen = credentials.get_frozen_credentials()
    return auth.get_aws_request_headers(
        request,
        aws_access_key=frozen.access_key,
        aws_secret_access_key=frozen.secret_key,
        aws_token=frozen.token,
    )
