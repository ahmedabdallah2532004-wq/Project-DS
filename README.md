# Distributed File Processing System - Student 20

This project contains two microservices for the Distributed Systems Project:
1. **Access Analytics Service (#39)**: Tracks file access events via REST and Kafka.
2. **Backup Service (#40)**: Manages metadata backups and history.

## Architecture
Both services follow a **Hybrid REST + Kafka** pattern:
- **REST**: Synchronous API for reports and manual triggers.
- **Kafka**: Asynchronous event consumption and production.
- **PM2**: Used as a process manager inside containers to ensure reliability.

## Prerequisites
- Docker and Docker Compose
- Node.js (for local development)

## Setup & Running

### Using Docker (Recommended)
This will start MongoDB, Kafka, and both services.
```bash
docker-compose up --build
```

### Endpoints

#### Access Analytics Service (Port 3010)
- `POST /access/log`: Log a file access event manually.
- `GET /analytics/file/:id`: Get access logs for a specific file.
- `GET /health`: Health check.
- `GET /ready`: Readiness check.

#### Backup Service (Port 3001)
- `POST /backup/run`: Trigger a manual backup.
- `GET /backup/history`: Get backup history.
- `GET /health`: Health check.
- `GET /ready`: Readiness check.

## Design Patterns Used
- **Layered Architecture**: Controller -> Service -> Repository.
- **Event-Driven**: Integration with Kafka for decoupled communication.
- **Sidecar/Process Management**: PM2 for enterprise-grade process management.
- **Containerization**: Fully Dockerized with multi-stage builds and `pm2-runtime`.

## Integration
- **Access Analytics** consumes `file.downloaded` and `file.shared` topics.
- **Backup Service** publishes to `backup.completed` and consumes from `scheduler.trigger.backup`.
