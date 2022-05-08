from os import environ
from typing import Dict, List, Union, cast

from dotenv import load_dotenv

from .general import App, Settings

INVALID_KEYS = [a.value for a in App]
GLOBALS = "globals"
GLOBAL_KEYS = ["issuer_url", "jwks_url"]


def group_raw() -> Dict[str, Union[Dict[str, str], str]]:
    """
    Get the raw values from the environment and group them
    """
    raw: Dict[str, Union[Dict[str, str], str]] = {a.inner: {} for a in App}
    raw[GLOBALS] = {}

    for key, value in environ.items():
        key = key.lower()
        if key in INVALID_KEYS:
            raise ValueError(
                f"configuration key '{key}' cannot be one of: {', '.join(INVALID_KEYS)}"
            )

        # Set global key
        if key in GLOBAL_KEYS:
            cast(Dict[str, str], raw[GLOBALS])[key] = value
            continue

        try:
            # Determine which app the key is for
            app = App(key.split("_")[0])

            # Set it for the app
            unprefixed_key = key.removeprefix(app.value + "_")
            cast(Dict[str, str], raw[app.inner])[unprefixed_key] = value
        except ValueError:
            # Not app specific, just set it globally
            raw[key] = value

    return raw


def keep_configured_section(raw: Dict[str, Union[Dict[str, str], str]]):
    """
    Keep only the desired section configured in APP
    """
    apps: List[App] = []
    try:
        raw_apps = cast(str, raw.get("apps")) or ""
        apps = [App(raw_app) for raw_app in raw_apps.split(",")]

        # Merge the globals into the app configuration
        globals = cast(Dict[str, str], raw[GLOBALS])
        for app in apps:
            cast(Dict[str, str], raw[app.inner]).update(globals)
        del raw[GLOBALS]
    except ValueError:
        pass
    finally:
        # Keep only the given app's configuration
        # Also prevents excessive validation errors if app was not defined
        for app in App:
            if app not in apps:
                del raw[app.inner]


def load() -> Settings:
    """
    Load settings from the environment
    """
    load_dotenv()

    raw = group_raw()
    keep_configured_section(raw)

    return Settings(**raw)


SETTINGS = load()
