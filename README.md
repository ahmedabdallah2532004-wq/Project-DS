# PM3 Microservices Final Submission

## Project Overview

This repository contains the PM3 microservices platform with eight Node.js services, Docker Compose, Kubernetes manifests, Helm chart, CI/CD, Prometheus, Grafana, Jaeger tracing, and n8n workflow artifacts.

## Services

| Service | Folder | Port |
|---|---|---:|
| metrics-service | `services/metrics-service` | 3001 |
| notification-service | `services/notification-service` | 3002 |
| preview-service | `services/preview-service` | 3003 |
| compression-service | `services/compression-service` | 3004 |
| webhook-service | `services/webhook-service` | 3005 |
| scheduler-service | `services/scheduler-service` | 3006 |
| access-analytics-service | `services/access-analytics-service` | 3007 |
| backup-service | `services/backup-service` | 3008 |

## Common Endpoints

Each service exposes:

- `GET /health`
- `GET /ready`
- `GET /metrics`
- `GET /docs`
- `GET /api-docs`

Swagger URLs:

- `http://localhost:3001/docs`
- `http://localhost:3002/docs`
- `http://localhost:3003/docs`
- `http://localhost:3004/docs`
- `http://localhost:3005/docs`
- `http://localhost:3006/docs`
- `http://localhost:3007/docs`
- `http://localhost:3008/docs`

Metrics URLs use the same ports with `/metrics`.

## Local Service Commands

```bash
cd services/<service-name>
npm install
npm run lint
npm test
npm run test:coverage
npm start
```

## Docker Build

```bash
docker build -t pm3/metrics-service:local services/metrics-service
docker build -t pm3/notification-service:local services/notification-service
docker build -t pm3/preview-service:local services/preview-service
docker build -t pm3/compression-service:local services/compression-service
docker build -t pm3/webhook-service:local services/webhook-service
docker build -t pm3/scheduler-service:local services/scheduler-service
docker build -t pm3/access-analytics-service:local services/access-analytics-service
docker build -t pm3/backup-service:local services/backup-service
```

## Docker Compose

```bash
docker compose config
docker compose up -d --build
docker compose ps
docker compose logs --tail=100
```

Observability URLs:

- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000`
- Jaeger: `http://localhost:16686`
- n8n: `http://localhost:5678`

## Kubernetes

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/
```

## Helm

```bash
helm lint ./helm/pm3-microservices
helm template cse474 ./helm/pm3-microservices
helm upgrade --install cse474 ./helm/pm3-microservices --namespace cse474-prod --create-namespace
```

## CI/CD Secrets

GitHub Actions expects:

- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `KUBE_CONFIG`

## Screenshots Required

Add final screenshots under `report/screenshots/`:

- `swagger-metrics-service.png`
- `swagger-webhook-service.png`
- `prometheus-targets.png`
- `grafana-dashboard.png`
- `jaeger-trace.png`
- `n8n-workflow.gif`

## Viva Notes

- All services use structured JSON logs with `timestamp`, `service`, `request_id`, `level`, and `message`.
- Every service exposes Prometheus metrics and OpenTelemetry tracing setup.
- Docker Compose runs all services plus Prometheus, Grafana, Jaeger, n8n, MongoDB, and Kafka.
- Kubernetes and Helm include replicas, probes, ConfigMaps, and resource requests/limits.
