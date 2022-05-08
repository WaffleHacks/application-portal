from celery import Celery

from common import SETTINGS

celery = Celery()
celery.config_from_object(
    {
        "enable_utc": True,
        "broker_url": SETTINGS.redis_url,
        "accept_content": ["json"],
        "task_serializer": "json",
        "result_backend": SETTINGS.redis_url,
        "result_accept_content": ["json"],
        "result_persistent": False,
        "result_serializer": "json",
        "worker_send_task_events": True,
    }
)

celery.autodiscover_tasks(
    packages=["communication", "integrations", "registration", "sync", "workshops"]
)
