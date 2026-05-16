import { pool } from '../../db/pool.js';

export async function insertMetric(metric) {
  const query = `
    INSERT INTO metrics (service, name, value, threshold, threshold_breached, labels)
    VALUES ($1, $2, $3, $4, $5, $6::jsonb)
    RETURNING id, service, name, value, threshold, threshold_breached, labels, recorded_at;
  `;

  const values = [
    metric.service,
    metric.name,
    metric.value,
    metric.threshold,
    metric.thresholdBreached,
    JSON.stringify(metric.labels)
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

export async function fetchRecentMetrics(limit = 20) {
  const { rows } = await pool.query(
    `
      SELECT id, service, name, value, threshold, threshold_breached, labels, recorded_at
      FROM metrics
      ORDER BY recorded_at DESC
      LIMIT $1;
    `,
    [limit]
  );

  return rows;
}
