import importlib.util as importlib_util
import inspect
import logging
import os
import sys
from inspect import Parameter, Signature
from pathlib import Path
from types import ModuleType
from typing import Awaitable, Callable, Dict, List, Optional

from .errors import InvalidArgument, InvalidReturnType, LoaderException
from .types import AutomatedEvent, Event, Handler, ManualEvent


def resolve(
    base: Path, parent_module: Optional[str] = None
) -> Dict[Event, List[Handler]]:
    """
    Resolve all the handlers under the given path to a mapping from events to handlers
    :param base: the base path to search for service handlers under
    :param parent_module: the parent module to import under
    """
    logger = logging.getLogger(__name__)
    handler_mapping: Dict[Event, List[Handler]] = {}

    # Create a default parent if not present
    if parent_module is None:
        parent_module = f"{base.parent.name}.{base.name}"

    # Find all services
    services: List[str] = os.listdir(base)
    for service in services:
        service_path = base / service

        # Ignore non-directories and python-generated folders
        if not service_path.is_dir():
            logger.debug(f"skipping path {service!r}, must be a directory")
            continue
        elif service.startswith("__"):
            logger.debug(f"skipping service {service!r}, invalid name")
            continue

        # Find all handlers
        handlers: List[str] = os.listdir(service_path)
        for handler in handlers:
            handler_path = service_path / handler

            # Ignore invalid names, wrong file types, and directories
            if not handler_path.is_file():
                logger.debug(f"{service}: skipping path {handler!r}, must be a file")
                continue
            elif not handler.endswith(".py"):
                logger.debug(
                    f"{service}: skipping handler file {handler!r}, must be a python file"
                )
                continue
            elif handler.startswith("__"):
                logger.debug(
                    f"{service}: skipping handler {handler.removesuffix('.py')!r}, invalid name"
                )
                continue

            module = import_file(handler_path, parent_module)

            handler_name = handler.removesuffix(".py")
            qualified_handler_name = f"{service}.{handler_name}"

            try:
                # Check if the file should be skipped
                if getattr(module, "shared", False) is True:
                    logger.debug(
                        f"{service}: skipping handler {handler_name}, shared module"
                    )
                    continue

                # Get the fields
                event = load_event(module)
                callback = load_callback(module, event)

                # Register the handler for the specified event
                if handler_mapping.get(event) is None:
                    handler_mapping[event] = [
                        Handler(name=qualified_handler_name, callback=callback)
                    ]
                else:
                    handler_mapping[event].append(
                        Handler(name=qualified_handler_name, callback=callback)
                    )

                logger.info(
                    f"{service}: loaded handler {handler_name!r} for {str(event)!r}"
                )
            except AttributeError as e:
                logger.error(
                    f"{service}: failed to load {handler_name!r}, missing attribute {e.name!r}"  # type: ignore
                )
                del sys.modules[module.__name__]
            except (TypeError, LoaderException) as e:
                logger.error(f"{service}: failed to load {handler_name!r}, {e}")
                del sys.modules[module.__name__]

    return handler_mapping


def import_file(path: Path, parent: str) -> ModuleType:
    """
    Import a file programmatically
    :param path: the path to the file
    :param parent: the parent module
    :returns: an imported module
    """
    # Build the module name
    handler_name = path.name.removesuffix(".py")
    service_name = path.parent.name
    module_name = f"{parent}.{service_name}.{handler_name}"

    # Get the module
    spec = importlib_util.spec_from_file_location(module_name, path)
    assert spec is not None
    module = importlib_util.module_from_spec(spec)

    # Load the module
    sys.modules[module_name] = module
    assert spec.loader is not None
    spec.loader.exec_module(module)

    return module


def load_event(module: ModuleType) -> Event:
    """
    Load the event from the handler module
    """
    # Manually triggered event override automated events
    manual = getattr(module, "manual", False)
    if manual:
        parts = module.__name__.split(".")
        return ManualEvent(belongs_to=parts[-2], method=parts[-1])

    # Fallback on trying to load as an automated event
    raw = getattr(module, "event")
    if not isinstance(raw, str):
        raise TypeError(f"expected type 'str' for 'event', got {type(raw).__name__!r}")

    return AutomatedEvent.parse(raw)


def load_callback(module: ModuleType, event: Event) -> Callable[..., Awaitable[None]]:
    """
    Load the callback function from the handler module
    """
    callback = getattr(module, "handler")
    if not inspect.iscoroutinefunction(callback):
        raise TypeError(
            f"expected 'coroutine function' for 'handler', got {type(callback).__name__!r}"
        )

    signature = inspect.signature(callback)

    # Check callback does not return anything
    if not (
        signature.return_annotation is None
        or signature.return_annotation == Signature.empty
    ):
        raise InvalidReturnType(
            f"expected return type of 'None', got {signature.return_annotation.__name__!r}"
        )

    # Input validation can only be done on automated events
    if isinstance(event, AutomatedEvent):
        # TODO: allow arguments to change based on action
        parameters = dict(signature.parameters)
        check_callback_argument("participant_id", str, parameters)

        # Ensure any extra parameters have defaults
        for param in parameters.values():
            if param.default == Parameter.empty:
                raise InvalidArgument(
                    f"unused argument {param.name!r} must have default"
                )

    return callback


def check_callback_argument(name: str, type_: type, params: Dict[str, Parameter]):
    """
    Check the argument is as expected
    """
    # Ensure parameter exists
    try:
        param = params.pop(name)
    except KeyError:
        raise InvalidArgument(f"missing required argument {name!r}")

    # Ensure
    if param.annotation != Parameter.empty and param.annotation != type_:
        raise InvalidArgument(
            f"mismatch argument type for {name!r}: provided {type_.__name__!r}, "
            f"function expected {param.annotation.__name__!r}"
        )

    # Ensure we can always pass arguments
    if param.kind in [
        Parameter.POSITIONAL_ONLY,
        Parameter.VAR_POSITIONAL,
        Parameter.VAR_KEYWORD,
    ]:
        raise InvalidArgument(
            f"argument {name!r} must be able to be passed as a keyword argument"
        )
