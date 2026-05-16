# Metrics Service

The Metrics Service is the `#27` hybrid microservice from the project specification. It records metric values synchronously through REST and publishes a Kafka event only when a configured threshold is exceeded.

## Responsibilities

- Expose the required `GET /health` and `GET /ready` endpoints.
- Accept metric writes through `POST /metrics`.
- Persist metrics in its own PostgreSQL database.
- Publish `metrics.threshold.exceeded` to Kafka when a critical threshold is breached.
- Consume `config.updated` and `flag.updated` events to support runtime behavior changes without restart.
- Run under PM2 and inside Docker.

## Architecture

The service follows a layered architecture:

- `src/api`: Express app and middleware.
- `src/config`: environment validation and runtime settings.
- `src/db`: PostgreSQL pool and schema migration.
- `src/events`: Kafka producer and consumer setup.
- `src/modules/metrics`: controller, service, repository, and validation logic.
- `src/modules/system`: health and readiness endpoints.
- `src/tests`: API-level tests.

## API

### `GET /health`

Liveness probe.

### `GET /ready`

Readiness probe that checks PostgreSQL and Kafka connectivity state.

### `POST /metrics`

Stores a metric and evaluates its threshold.

Request body:

```json
{
  "service": "upload-session",
  "name": "queue_depth",
  "value": 97,
  "threshold": 80,
  "labels": {
    "region": "eu-central"
  }
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "metric": {
      "id": 1,
      "service": "upload-session",
      "name": "queue_depth",
      "value": 97,
      "threshold": 80,
      "threshold_breached": true,
      "labels": {
        "region": "eu-central"
      },
      "recorded_at": "2026-04-23T00:00:00.000Z"
    }
  },
  "meta": {
    "service": "metrics-service",
    "request_id": "uuid"
  }
}
```

## Kafka Topics

- Produces: `metrics.threshold.exceeded`
- Consumes: `config.updated`, `flag.updated`

## Environment Variables

Create a local `.env` file from `.env.example` if you want to override defaults.

```env
PORT=3000
NODE_ENV=development
SERVICE_NAME=metrics-service
DATABASE_URL=postgresql://postgres:postgres@metrics-db:5432/metrics_service
KAFKA_BROKERS=kafka:29092
KAFKA_CLIENT_ID=metrics-service
KAFKA_CONSUMER_GROUP=metrics-service-group
KAFKA_THRESHOLD_TOPIC=metrics.threshold.exceeded
KAFKA_CONFIG_TOPIC=config.updated
KAFKA_FLAG_TOPIC=flag.updated
DEFAULT_THRESHOLD=80
ENABLE_THRESHOLD_ALERTS=true
```

## Run Locally

```bash
cd services/metrics
npm install
npm run migrate
npm start
```

## Run With PM2

```bash
cd services/metrics
npm install
npm run pm2
```

## Run With Docker Compose

From the repository root:

```bash
docker compose up --build
```

This starts:

- `metrics-db`
- `zookeeper`
- `kafka`
- `metrics-service`
- `notification-db`
- `notification-service`

For local host access outside Docker, the matching values are:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/metrics_service
KAFKA_BROKERS=localhost:9092
```

## Testing

```bash
cd services/metrics
npm test
```

## Verification

Example request:

```bash
curl -X POST http://localhost:3000/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "service": "storage-gateway",
    "name": "cpu_usage",
    "value": 95,
    "threshold": 80,
    "labels": {
      "node": "node-a",
      "ops_email": "ops@example.com"
    }
  }'
```

Expected behavior:

- the metric is stored in PostgreSQL
- `threshold_breached` becomes `true`
- Kafka receives `metrics.threshold.exceeded`
- `Notification` consumes the event
