# Use Python 3.10 debian
FROM python:3.10-slim as base

ENV PYTHONUNBUFFERED 1
ENV PYTHONFAULTHANDLER 1

# Update global dependencies
RUN apt-get update && \
    apt-get upgrade -y


# Export dependencies from poetry
FROM base as export-dependencies

# Install poetry
RUN pip install --no-cache-dir poetry

# Export dependencies in requirements.txt format
COPY poetry.lock pyproject.toml ./
RUN poetry export -f requirements.txt -o requirements.txt --without-hashes


# Install dependencies for caching
FROM base as dependencies

# System build dependencies
RUN apt-get install -y --no-install-recommends build-essential git

# Install the depednencies
COPY --from=export-dependencies /requirements.txt ./
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt --prefix=/dependencies --no-warn-script-location


# Setup the common files
FROM base as common

# Switch to a new user
RUN adduser --disabled-password app
USER app

WORKDIR /application-portal

# Copy over dependencies
COPY --from=dependencies /dependencies /usr/local

# Copy common project files
COPY --chown=app alembic.ini ./alembic.ini
COPY --chown=app common ./common
COPY --chown=app manage.py ./manage.py


###
#  Celery
###
FROM common as celery

COPY --chown=app communication ./communication
COPY --chown=app integrations ./integrations
COPY --chown=app registration ./registration
COPY --chown=app sync ./sync
COPY --chown=app workshops ./workshops

COPY --chown=app --chmod=775 docker-entrypoints/celery.sh ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]


###
#  Communication
###
FROM common as communication
EXPOSE 8000/tcp

ENV APP communication

COPY --chown=app communication ./communication
COPY --chown=app --chmod=775 docker-entrypoints/web.sh ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]


###
#  MJML API
###
FROM node:16-alpine as mjml

ENV HOST 0.0.0.0
ENV PORT 8000

EXPOSE 8000/tcp

RUN apk add dumb-init

# Switch to a new user
RUN adduser --disabled-password app
USER app

WORKDIR /application-portal

COPY --chown=app mjml .
RUN yarn && yarn build

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "."]


###
#  Registration
###
FROM common as registration
EXPOSE 8000/tcp

ENV APP registration

COPY --chown=app registration ./registration
COPY --chown=app --chmod=775 docker-entrypoints/web.sh ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]


###
#  Sync
###
FROM common as sync

COPY --chown=app sync ./sync
COPY --chown=app --chmod=775 docker-entrypoints/sync.sh ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
