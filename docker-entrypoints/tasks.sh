#!/bin/sh

python manage.py migrations run
exec python -m tasks.main
