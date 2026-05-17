# Tracing

Both services include `src/tracing.js` and use OpenTelemetry SDK for OTLP HTTP export.

Local Jaeger:

```bash
docker run --rm --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

Enable tracing:

```env
OTEL_TRACING_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

Open `http://localhost:16686` and search for:

- `webhook-service`
- `scheduler-service`

Screenshot placeholder: add a captured Jaeger trace image here before final submission if screenshots are required by the rubric.
