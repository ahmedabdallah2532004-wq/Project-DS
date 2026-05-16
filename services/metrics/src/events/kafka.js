import { Kafka } from 'kafkajs';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import {
  applyConfigEvent,
  applyFlagEvent,
  setKafkaConnected
} from './runtime-state.js';

const kafka = new Kafka({
  clientId: env.KAFKA_CLIENT_ID,
  brokers: env.kafkaBrokers
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: env.KAFKA_CONSUMER_GROUP });

export async function connectKafka() {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: env.KAFKA_CONFIG_TOPIC, fromBeginning: false });
  await consumer.subscribe({ topic: env.KAFKA_FLAG_TOPIC, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const payload = JSON.parse(message.value?.toString() ?? '{}');
        const handled =
          topic === env.KAFKA_CONFIG_TOPIC
            ? applyConfigEvent(payload)
            : applyFlagEvent(payload);

        if (handled) {
          logger.info({ topic, payload }, 'Runtime state updated from Kafka');
        }
      } catch (error) {
        logger.error({ err: error, topic }, 'Failed to process Kafka message');
      }
    }
  });

  setKafkaConnected(true);
  logger.info({ brokers: env.kafkaBrokers }, 'Kafka producer and consumer connected');
}

export async function disconnectKafka() {
  setKafkaConnected(false);
  await Promise.allSettled([producer.disconnect(), consumer.disconnect()]);
}

export async function publishThresholdExceeded(payload) {
  await producer.send({
    topic: env.KAFKA_THRESHOLD_TOPIC,
    messages: [
      {
        key: `${payload.service}:${payload.name}`,
        value: JSON.stringify(payload)
      }
    ]
  });
}
