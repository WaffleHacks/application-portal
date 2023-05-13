# Use Python 3.10 debian
FROM python:3.10-slim as base

ENV PYTHONUNBUFFERED 1
ENV PYTHONFAULTHANDLER 1

# Update global dependencies
RUN apt-get update && \
    apt-get upgrade -y

# Build the MJML package
FROM ghcr.io/pyo3/maturin:v0.15.1 as mjml-build

COPY ./mjml .

RUN pwd; maturin build --release --strip


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
COPY --from=mjml-build /io/target/wheels/*.whl ./
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt --prefix=/dependencies --no-warn-script-location && \
    pip install --no-cache-dir --prefix=/dependencies ./*.whl --no-warn-script-location


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
ARG COMMIT_SHA=dev
RUN echo "commit = \"$COMMIT_SHA\"" > common/version.py


###
#  API
###
FROM common as api
EXPOSE 8000/tcp

COPY --chown=app api ./api
COPY --chown=app --chmod=775 docker-entrypoints/api.sh ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]


###
#  Tasks
###
FROM common as tasks

COPY --chown=app tasks ./tasks
COPY --chown=app --chmod=775 docker-entrypoints/tasks.sh ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
