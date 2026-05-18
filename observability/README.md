# Observability

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000
- Jaeger: http://localhost:16686

Prometheus scrapes all eight services on /metrics. Tracing uses OTLP HTTP to Jaeger at http://jaeger:4318/v1/traces in Docker Compose.
