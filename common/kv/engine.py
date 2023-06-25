import json
from typing import Any, Optional

from pydantic.json import pydantic_encoder
from redis.asyncio import ConnectionPool, Redis

GLOBAL_PREFIX = "application-portal"


class Engine(object):
    """
    A user- and context-friendly wrapper around a Redis connection pool
    """

    def __init__(self, url: str):
        self._pool = ConnectionPool.from_url(url, max_connections=10)

    def client(self) -> Redis:
        """
        Get a raw Redis client from the engine
        """
        return Redis(
            connection_pool=self._pool, encoding="utf-8", decode_responses=True
        )

    def namespaced(self, prefix: str) -> "NamespacedClient":
        """
        Get a namespaced Redis client wrapper
        :param prefix: the prefix for every key
        """
        return NamespacedClient(self._pool, f"{GLOBAL_PREFIX}:{prefix}")


class NamespacedClient(object):
    """
    A Redis client that has all keys prefixed with a value
    """

    def __init__(self, pool: ConnectionPool, prefix: str):
        self._client: Redis = Redis(
            connection_pool=pool, encoding="utf-8", decode_responses=True
        )
        self._prefix = prefix

    def __format_key(self, key: str) -> str:
        return f"{self._prefix}:{key}"

    async def get(self, key: str, *, is_json: bool = False) -> Optional[Any]:
        """
        Get a value from Redis
        :param key: the key to read from
        :param is_json: whether to decode the response as JSON
        """
        value = await self._client.get(self.__format_key(key))
        if value is None:
            return None

        if is_json:
            return json.loads(value)
        else:
            return value.decode("utf-8")

    async def set(self, key: str, value: Any, expires_in: Optional[int] = None):
        """
        Set a value in Redis. If the value is not a string, it will be converted to JSON
        :param key: the key to store the value at
        :param value: the value to store
        :param expires_in: when the value should expire
        """
        if not isinstance(value, str):
            value = json.dumps(value, default=pydantic_encoder)

        if expires_in is None:
            await self._client.set(self.__format_key(key), value)
        else:
            await self._client.setex(self.__format_key(key), expires_in, value)

    async def delete(self, key: str):
        """
        Delete a value from Redis
        :param key: the key to delete
        """
        await self._client.delete(self.__format_key(key))
