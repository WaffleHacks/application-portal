#!/bin/sh

if [ "$1" = "migrate" ]; then
  python manage.py migrations run
else
  exec gunicorn -k uvicorn.workers.UvicornWorker \
    --access-logfile - \
    --bind '[::]:8000' \
    --worker-tmp-dir /dev/shm \
    --workers "${GUNICORN_WORKERS:-3}" \
    api.main:app
fi
