import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  SERVICE_NAME: z.string().default('metrics-service'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/metrics_service'),
  KAFKA_BROKERS: z.string().default('localhost:9092'),
  KAFKA_CLIENT_ID: z.string().default('metrics-service'),
  KAFKA_CONSUMER_GROUP: z.string().default('metrics-service-group'),
  KAFKA_THRESHOLD_TOPIC: z.string().default('metrics.threshold.exceeded'),
  KAFKA_CONFIG_TOPIC: z.string().default('config.updated'),
  KAFKA_FLAG_TOPIC: z.string().default('flag.updated'),
  DEFAULT_THRESHOLD: z.coerce.number().default(80),
  ENABLE_THRESHOLD_ALERTS: z
    .string()
    .default('true')
    .transform((value) => value.toLowerCase() === 'true')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

export const env = {
  ...parsed.data,
  kafkaBrokers: parsed.data.KAFKA_BROKERS.split(',').map((broker) => broker.trim())
};
