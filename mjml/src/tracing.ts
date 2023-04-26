import { hostname } from 'os';

import { ChannelCredentials, credentials } from '@grpc/grpc-js';
import { trace } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation, IgnoreIncomingRequestFunction } from '@opentelemetry/instrumentation-http';
import { Resource } from '@opentelemetry/resources';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

import logger from './logging';
import { COMMIT } from './version';

function getBooleanFromEnv(key: string): boolean {
  const raw = (process.env[key] || 'no').toLowerCase();
  return raw === 'true' || raw === 't' || raw === 'yes' || raw === 'y';
}

const ignoreIncomingRequestHook: IgnoreIncomingRequestFunction = (request) => {
  if (request.url) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    return url.pathname === '/health';
  } else return false;
};

const otlpCredentials = (u: string): ChannelCredentials => {
  const url = new URL(u);
  if (url.protocol === 'https:') return credentials.createSsl();
  else return credentials.createInsecure();
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
    const url = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || '';
    if (url.length === 0) {
      logger.warn('missing exporter url in OTLP_EXPORTER_OTLP_ENDPOINT');
      return;
    }

    const processor = new BatchSpanProcessor(
      new OTLPTraceExporter({
        url,
        credentials: otlpCredentials(url),
      }),
    );

    const provider = new NodeTracerProvider({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || '',
        [SemanticResourceAttributes.SERVICE_VERSION]: COMMIT,
        [SemanticResourceAttributes.HOST_NAME]: hostname(),
        [SemanticResourceAttributes.PROCESS_RUNTIME_VERSION]: process.versions.node,
        [SemanticResourceAttributes.PROCESS_RUNTIME_NAME]: 'nodejs',
        [SemanticResourceAttributes.PROCESS_RUNTIME_DESCRIPTION]: 'Node.js',
      }),
    });
    provider.addSpanProcessor(processor);

    registerInstrumentations({
      tracerProvider: provider,
      instrumentations: [new HttpInstrumentation({ ignoreIncomingRequestHook }), new ExpressInstrumentation()],
    });

    provider.register();
  }

  logger.info('opentelemetry', { enabled: enable });
}
