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
#  Registration
###
FROM common as registration
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
