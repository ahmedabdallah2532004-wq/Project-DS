# Jaeger Notes

Jaeger is wired through OTLP HTTP on `http://jaeger:4318/v1/traces` in Docker Compose and in the shared Helm values.

Capture the PM3 submission screenshot from:

- `http://localhost:16686`

Recommended screenshot:

- one trace crossing at least the metrics service, Kafka-triggered flow, and notification service
