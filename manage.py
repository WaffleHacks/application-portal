import importlib
import sys
from typing import Optional

import click
from alembic import command
from alembic.config import Config
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
        sys.exit(1)
    except AttributeError:
        click.echo(f"{app} is misconfigured, could not find 'run' function")
        sys.exit(1)


if __name__ == "__main__":
    cli()
