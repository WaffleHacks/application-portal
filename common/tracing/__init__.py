import platform
from typing import Optional

from fastapi import FastAPI
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.aiohttp_client import AioHttpClientInstrumentor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.sdk.resources import (
    HOST_NAME,
    SERVICE_VERSION,
    ProcessResourceDetector,
    Resource,
)
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from .. import version
from ..database.engine import engine
from ..settings import SETTINGS
from .botocore import FilteredBotocoreInstrumentor


def init(app: Optional[FastAPI] = None):
    if SETTINGS.otel_enable:
        # Select the exporter
        print("OpenTelemetry: enabled")
        exporter = OTLPSpanExporter()

        # Setup the provider
        processor = BatchSpanProcessor(exporter)
        resource = Resource.create(
            {
                SERVICE_VERSION: version.commit,
                HOST_NAME: platform.node(),
            }
        ).merge(ProcessResourceDetector().detect())
        provider = TracerProvider(resource=resource)
        provider.add_span_processor(processor)

        trace.set_tracer_provider(provider)

        # Setup default instrumentation
        AioHttpClientInstrumentor().instrument()
        FilteredBotocoreInstrumentor().instrument(excluded=["SQS.ReceiveMessage"])
        if app:
            FastAPIInstrumentor.instrument_app(app, excluded_urls="health")
        SQLAlchemyInstrumentor().instrument(engine=engine.sync_engine)
    else:
        print("OpenTelemetry: disabled")
