# Use Python 3.10 debian
FROM python:3.10-slim as base

ENV PYTHONUNBUFFERED 1
ENV PYTHONFAULTHANDLER 1

# Update global dependencies
RUN apt-get update && \
    apt-get upgrade -y


FROM base as export-dependencies

RUN pip install --no-cache-dir poetry

# Export dependencies to requirements.txt format
COPY poetry.lock pyproject.toml ./
RUN poetry export -f requirements.txt -o requirements.txt


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

# Add commit info
RUN set -ex \
    short_sha=$(git rev-parse --short HEAD) \
    echo 'version = "$short_sha"' > common/version.py


###
#  API
###
FROM common as api
EXPOSE 8000/tcp

COPY --chown=app api ./api
COPY --chown=app --chmod=775 docker-entrypoints/api.sh ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]


###
#  MJML API
###
FROM node:18-alpine as mjml

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
#  Tasks
###
FROM common as tasks

COPY --chown=app tasks ./tasks
COPY --chown=app --chmod=775 docker-entrypoints/tasks.sh ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
