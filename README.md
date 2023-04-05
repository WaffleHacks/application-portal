# Application Portal

The application portal for WaffleHacks.

### Development

For development, you will need the following programs installed:
- [Python](https://www.python.org) 3.9 or later
- [Poetry](https://www.python-poetry.org)
- [Docker](https://www.docker.com)

Once the required programs are installed, it is time to set up your local environment. The following commands will
install all the project dependencies and install pre-commit hooks to ensure consistent code formatting and conventions.
```shell
poetry install
poetry shell
pre-commit install
```

Whenever you are running a Python command in the project, you must make sure you have the virtual environment active.
There are two options to activate the virtual environment: use Poetry or do it manually.
```shell
# Poetry
poetry shell

# Manual
source ./.venv/bin/activate  # (Linux, MacOS, WSL)
.venv/Scripts/Activate.ps1   # (Windows)
```

#### Database Setup

To test the APIs, you will need to have access to a PostgreSQL database. This is where it is handy to have Docker
installed. Simply run `docker-compose up -d`, and a database container will be automatically started for you. The
database can be accessed at `127.0.0.1:9427`.

Once the database is running, you will need to apply any missing migrations:
```shell
python3 manage.py migrations run
```

To stop the database, simply run `docker-compose down`.

#### Running Applications

Once all the previous steps have been completed, you can (finally) start an application. Simply use the `manage.py`
script in the root of the repository to start the necessary application(s).

```shell
python3 manage.py run -<app>

# Show all the options
python3 manage.py run --help

# i.e. start the API server
python3 manage.py run --api
```

(Make sure you're in the project virtual environment when you're using the `manage.py` script)
