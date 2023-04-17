from algoliasearch.configs import SearchConfig
from algoliasearch.http.requester_async import RequesterAsync
from algoliasearch.http.transporter_async import TransporterAsync
from algoliasearch.search_client import SearchClient
from algoliasearch.search_client_async import SearchClientAsync, SearchIndexAsync

from common import SETTINGS

_config = SearchConfig(
    SETTINGS.api.algolia_app_id,
    SETTINGS.api.algolia_api_key,
)
_sync_client = SearchClient.create_with_config(_config)
_client = SearchClientAsync(
    _sync_client,
    TransporterAsync(RequesterAsync(), _config),
    _config,
)


async def with_schools_index() -> SearchIndexAsync:
    """
    Get an Algolia search client for the schools index
    :return:
    """
    return _client.init_index("schools")
