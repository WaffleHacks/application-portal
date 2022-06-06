from typing import Optional

from fastapi import FastAPI
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.aiohttp_client import AioHttpClientInstrumentor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from common import SETTINGS
from common.database.engine import engine

from .botocore import FilteredBotocoreInstrumentor


def init(app: Optional[FastAPI] = None):
    if SETTINGS.otel_enable:
        # Select the exporter
        if SETTINGS.otel_debug:
            print("OpenTelemetry: Jaeger")
            exporter = JaegerExporter(agent_port=9431)
        else:
            print("OpenTelemetry: OTLP")
            exporter = OTLPSpanExporter()

        # Setup the provider
        processor = BatchSpanProcessor(exporter)
        provider = TracerProvider()
        provider.add_span_processor(processor)

        trace.set_tracer_provider(provider)

        # Setup default instrumentation
        AioHttpClientInstrumentor().instrument()
        FilteredBotocoreInstrumentor().instrument(excluded=["SQS.ReceiveMessage"])
        if app:
            FastAPIInstrumentor.instrument_app(app)
        SQLAlchemyInstrumentor().instrument(engine=engine.sync_engine)
    else:
        print("OpenTelemetry: disabled")
