from typing import Optional

import ujson
from aiohttp import ClientSession

from common import SETTINGS


class MJMLClient(object):
    def __init__(self, base_url: str):
        self.url = base_url + "/render"
        self.session: Optional[ClientSession] = None

    async def __init_session(self):
        """
        Initialize the client session if it does not exist
        """
        if self.session is None:
            self.session = ClientSession(json_serialize=ujson.dumps)

    async def render(self, source: str) -> str:
        """
        Render a string of valid MJML to minified HTML
        :param source: the input MJML
        :returns: HTML
        """
        await self.__init_session()
        assert self.session is not None

        resp = await self.session.post(self.url, json={"mjml": source})
        resp.raise_for_status()

        result = await resp.json()
        return result["html"]


client = MJMLClient(SETTINGS.communication.mjml_api)


async def with_mjml() -> MJMLClient:
    """
    Get a MJML API client with session re-use
    :return: a MJML client
    """
    return client
