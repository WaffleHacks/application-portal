import ujson
from aiohttp import ClientSession


class MJMLClient(object):
    def __init__(self, base_url: str):
        self.url = base_url + "/render"
        self.session = ClientSession(json_serialize=ujson.dumps)

    async def render(self, source: str) -> str:
        """
        Render a string of valid MJML to minified HTML
        :param source: the input MJML
        :returns: HTML
        """
        resp = await self.session.post(self.url, json={"mjml": source})
        resp.raise_for_status()

        result = await resp.json()
        return result["html"]
