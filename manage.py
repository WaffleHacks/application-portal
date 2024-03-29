import asyncio
import importlib
import json
import sys
from functools import wraps
from traceback import format_exc
from typing import Any, Dict, Iterable, List, Optional

import click
from alembic import command
from alembic.config import Config
from algoliasearch.search_client import SearchClient  # type: ignore
from dotenv import load_dotenv
from sqlalchemy.dialects.postgresql import Insert, insert

from common import nats

# Load from environment file
load_dotenv()


def coroutine(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        return asyncio.run(f(*args, **kwargs))

    return wrapper


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


@migrations.command()
@click.option("--no-autogenerate", is_flag=True, help="Create an empty migration")
@click.argument("message", type=str, metavar="MSG", required=True)
@click.pass_obj
def generate(obj: Config, message: str, no_autogenerate: bool):
    """
    Generate a new database migration
    """

    command.revision(obj, message=message, autogenerate=not no_autogenerate)


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
@click.option("-a", "--api", "app", flag_value="api")
@click.option("-s", "--statistics", "app", flag_value="statistics")
@click.option("-t", "--tasks", "app", flag_value="tasks")
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


@cli.group()
@click.pass_context
def seed(ctx: click.Context):
    """
    Seed different data sources
    """
    ctx.obj = {
        "schools": json.load(open("./common/database/migrations/schools.json", "r")),
        "majors": json.load(open("./common/database/migrations/majors.json", "r")),
    }


@seed.command(name="algolia")
@click.option(
    "-i",
    "--app-id",
    "app_id",
    type=str,
    envvar="REGISTRATION_ALGOLIA_APP_ID",
)
@click.option(
    "-k",
    "--api-key",
    "api_key",
    type=str,
    envvar="REGISTRATION_ALGOLIA_API_KEY",
)
@click.pass_obj
def seed_algolia(obj: Dict[str, List[Dict[str, Any]]], app_id: str, api_key: str):
    """
    Seed the Algolia search indexes
    """
    client = SearchClient.create(app_id, api_key)

    def id_to_object_id(entry: Dict[str, str]) -> Dict[str, str]:
        entry["objectID"] = entry["id"]
        del entry["id"]
        return entry

    schools_index = client.init_index("schools")
    schools_index.save_objects(map(id_to_object_id, obj["schools"]))

    majors_index = client.init_index("majors")
    majors_index.save_objects(map(id_to_object_id, obj["majors"]))


@seed.command(name="database")
@click.pass_obj
@coroutine
async def seed_database(obj: Dict[str, List[Dict[str, Any]]]):
    """
    Seed the database with all the schools
    """
    # Import here, so we don't need a database connection for every command
    from common.database import School, db_context

    schools = obj["schools"]

    async with db_context() as db:
        base_statement: Insert = insert(School).values(schools)
        statement = base_statement.on_conflict_do_update(
            index_elements=[School.id],  # type: ignore
            set_={
                "name": base_statement.excluded.name,
                "abbreviations": base_statement.excluded.abbreviations,
                "alternatives": base_statement.excluded.alternatives,
            },
        )

        await db.execute(statement)
        await db.commit()


@cli.command()
@click.argument("namespace")
@click.argument("event")
@click.argument("data", nargs=-1)
@click.option(
    "--manual",
    is_flag=True,
    help="Send a manually triggered event, defaults to automated events",
)
@coroutine
async def publish_event(
    namespace: str,
    event: str,
    data: Iterable[str],
    manual: bool = True,
):
    """
    Publish an event to the NATS message bus
    """
    await nats.healthcheck()

    payload = {}
    for pair in data:
        try:
            [key, value] = pair.split("=")
        except ValueError:
            click.echo("data must be formatted as key=value pairs")
            sys.exit(1)

        if value.isdecimal():
            value = int(value)  # type: ignore

        payload[key] = value

    event_type = "manual" if manual else "automated"
    await nats.publish(f"{namespace}.{event_type}.{event}", payload)


if __name__ == "__main__":
    cli()
