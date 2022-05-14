from mailer import AsyncClient

from common import SETTINGS

from .mjml import MJMLClient

mailer_client = AsyncClient(SETTINGS.communication.mailer)
mjml_client = MJMLClient(SETTINGS.communication.mjml_api)


async def with_mail() -> AsyncClient:
    """
    Get a mailer client with session re-use
    :return: a mailer client
    """
    return mailer_client


async def with_mjml() -> MJMLClient:
    """
    Get a MJML API client with session re-use
    :return: a MJML client
    """
    return mjml_client
