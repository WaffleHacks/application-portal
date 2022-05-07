from mailer import AsyncClient

from common import SETTINGS

client = AsyncClient(SETTINGS.communication.mailer)


async def with_mail() -> AsyncClient:
    """
    Get a mailer client with session re-use
    :return: a mailer client
    """
    return client
