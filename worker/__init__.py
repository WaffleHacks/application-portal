from .main import celery


def run():
    """
    Start the worker
    """
    worker = celery.Worker()
    worker.start()
