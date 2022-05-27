import { credentials } from '@grpc/grpc-js';
import { trace } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation, IgnoreIncomingRequestFunction } from '@opentelemetry/instrumentation-http';
import { Resource } from '@opentelemetry/resources';
import { BatchSpanProcessor, SpanExporter } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

import logger from './logging';

function getBooleanFromEnv(key: string): boolean {
  const raw = (process.env[key] || 'no').toLowerCase();
  return raw === 'true' || raw === 't' || raw === 'yes' || raw === 'y';
}

function getExporter(): SpanExporter {
  const debug = getBooleanFromEnv('OTEL_DEBUG');

  logger.info('opentelemetry', { enabled: true, exporter: debug ? 'jaeger' : 'otlp' });

  if (debug) return new ZipkinExporter();
  else
    return new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
      credentials: credentials.createSsl(),
    });
}

const ignoreIncomingRequestHook: IgnoreIncomingRequestFunction = (request) => {
  if (request.url) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    return url.pathname === '/health';
  } else return false;
};

export function withSpan<T>(name: string, fn: () => T): T {
  const span = trace.getTracer('mjml').startSpan(name);
  try {
    return fn();
  } finally {
    span.end();
  }
}

export default function () {
  const enable = getBooleanFromEnv('OTEL_ENABLE');

  if (enable) {
    const processor = new BatchSpanProcessor(getExporter());

    const provider = new NodeTracerProvider({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || '',
      }),
    });
    provider.addSpanProcessor(processor);

    registerInstrumentations({
      tracerProvider: provider,
      instrumentations: [new HttpInstrumentation({ ignoreIncomingRequestHook }), new ExpressInstrumentation()],
    });

    provider.register();
  } else logger.info('opentelemetry', { enabled: false });
}
