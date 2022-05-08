#!/bin/sh

python manage.py migrations run
exec python manage.py celery
