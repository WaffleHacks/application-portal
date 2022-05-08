import importlib
import json
import sys
from traceback import format_exc
from typing import Dict, Optional

import click
from alembic import command
from alembic.config import Config
from algoliasearch.search_client import SearchClient  # type: ignore
from dotenv import load_dotenv

# Load from environment file
load_dotenv()


@click.group()
def cli():
    pass


@cli.group()
@click.option(
    "--database", "-d", type=str, metavar="URL", envvar="DATABASE_URL", required=True
)
@click.pass_context
def migrations(ctx: click.Context, database: str):
    """
    Manage the database migrations
    """

    ctx.obj = Config("./alembic.ini")
    ctx.obj.attributes["sqlalchemy.url"] = database


@migrations.command()
@click.pass_obj
def current(obj: Config):
    """
    Get the current migration status
    """

    command.current(obj)


@migrations.command(name="run")
@click.option("--revision", "-r", type=str, metavar="REVISION", default="head")
@click.pass_obj
def migrations_run(obj: Config, revision: str):
    """
    Apply all pending migrations
    """

    command.upgrade(obj, revision)


@migrations.command()
@click.option("--revision", "-r", type=str, metavar="REVISION", default="base")
@click.pass_obj
def reset(obj: Config, revision: str):
    """
    Rollback migrations to a given point
    """

    command.downgrade(obj, revision)


@cli.command()
@click.option("-r", "--registration", "app", flag_value="registration")
@click.option("-c", "--communication", "app", flag_value="communication")
@click.option("-w", "--workshops", "app", flag_value="workshops")
@click.option("-s", "--statistics", "app", flag_value="statistics")
@click.option("-i", "--integrations", "app", flag_value="integrations")
@click.option("-y", "--sync", "app", flag_value="sync")
def run(app: Optional[str]):
    """
    Run an API development server
    """
    if app is None:
        click.echo("An API server must be selected")
        sys.exit(1)

    try:
        # Load the module
        module = importlib.import_module(app)

        # Ensure the runner function exists
        run_fn = getattr(module, "run")
        run_fn()
    except ModuleNotFoundError:
        click.echo(f"{app} is not implemented yet")
        click.echo(f"Reason:\n{format_exc()}")
        sys.exit(1)
    except AttributeError:
        click.echo(f"{app} is misconfigured, could not find 'run' function")
        click.echo(f"Reason:\n{format_exc()}")
        sys.exit(1)


@cli.command()
def celery():
    """
    Run the celery worker
    """
    from common.tasks import celery

    worker = celery.Worker()
    worker.start()


@cli.command(name="seed-algolia")
@click.option("-i", "--app-id", "app_id", type=str, envvar="ALGOLIA_APP_ID")
@click.option("-k", "--api-key", "api_key", type=str, envvar="ALGOLIA_API_KEY")
def seed_algolia(app_id: str, api_key: str):
    """
    Seed the Algolia search indexes
    """
    client = SearchClient.create(app_id, api_key)

    def id_to_object_id(entry: Dict[str, str]) -> Dict[str, str]:
        entry["objectID"] = entry["id"]
        del entry["id"]
        return entry

    schools = json.load(open("./common/database/migrations/schools.json", "r"))
    schools_index = client.init_index("schools")
    schools_index.save_objects(map(id_to_object_id, schools))

    majors = json.load(open("./common/database/migrations/majors.json", "r"))
    majors_index = client.init_index("majors")
    majors_index.save_objects(map(id_to_object_id, majors))


if __name__ == "__main__":
    cli()
