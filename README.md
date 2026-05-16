# Team 3 PM3 Integration Repository

This branch packages the `metrics` and `notification` microservices into one shared repository for PM3 submission work without changing `main`.

## Repository Layout

```text
services/
  metrics/
  notification/
k8s/
chart/
observability/
.github/workflows/ci-cd.yml
n8n/workflows/
report/
```

## Services

- `services/metrics`: REST + Kafka metrics service with Swagger, Prometheus metrics, tracing bootstrap, PM2 config, Dockerfile, tests, and k8s manifests.
- `services/notification`: REST + Kafka notification service with Swagger, Prometheus metrics, tracing bootstrap, PM2 config, Dockerfile, tests, and k8s manifests.

## Quick Start

```bash
docker compose up --build
```

Service URLs:

- Metrics API: `http://localhost:3000`
- Metrics Swagger: `http://localhost:3000/docs`
- Notification API: `http://localhost:3001`
- Notification Swagger: `http://localhost:3001/docs`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3002`
- Jaeger: `http://localhost:16686`
- n8n: `http://localhost:5678`

## Tests

```bash
cd services/metrics
npm install
npm run test

cd ../notification
npm install
npm run test
```

Coverage reports are written to:

- `services/metrics/tests/coverage/`
- `services/notification/tests/coverage/`

## Kubernetes

Raw manifests live in `k8s/`.

```bash
kubectl apply -f k8s/
```

The Helm chart is in `chart/`.

```bash
helm install cse474 ./chart
```

## CI/CD

The workflow file is:

- `.github/workflows/ci-cd.yml`

It runs lint, dependency install, tests with coverage, Docker builds, registry push, and guarded Helm-based deployment on `main`.

## Observability

- Prometheus config: `observability/prometheus.yml`
- Grafana dashboard export: `observability/grafana/team3-platform-dashboard.json`
- Loki config: `observability/loki-config.yml`
- Promtail config: `observability/promtail-config.yml`
- Jaeger traces: `observability/jaeger/README.md`

## Bonus n8n

The example workflow export is committed at:

- `n8n/workflows/metrics-notification-pipeline.json`
