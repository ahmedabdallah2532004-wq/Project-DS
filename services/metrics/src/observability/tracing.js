import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { env } from '../config/env.js';

let sdk;

export async function startTracing() {
  if (sdk || env.NODE_ENV === 'test' || !env.OTEL_ENABLED) {
    return;
  }

  sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
      url: env.otelTraceEndpoint
    }),
    instrumentations: [getNodeAutoInstrumentations()]
  });

  await sdk.start();
}

export async function stopTracing() {
  if (!sdk) {
    return;
  }

  await sdk.shutdown();
  sdk = undefined;
}
