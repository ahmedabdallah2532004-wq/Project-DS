import { pool } from './pool.js';
import { logger } from '../lib/logger.js';

export const migrationSql = `
CREATE TABLE IF NOT EXISTS metrics (
  id BIGSERIAL PRIMARY KEY,
  service VARCHAR(120) NOT NULL,
  name VARCHAR(120) NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  threshold DOUBLE PRECISION NOT NULL,
  threshold_breached BOOLEAN NOT NULL DEFAULT FALSE,
  labels JSONB NOT NULL DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metrics_service_name_recorded_at
  ON metrics (service, name, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_metrics_threshold_breached
  ON metrics (threshold_breached, recorded_at DESC);
`;

export async function runMigration(targetPool = pool) {
  await targetPool.query(migrationSql);
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  try {
    await runMigration();
    logger.info('Metrics schema migration completed');
  } catch (error) {
    logger.error({ err: error }, 'Metrics schema migration failed');
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
