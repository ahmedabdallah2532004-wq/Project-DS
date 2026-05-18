const config = require('../config');
const kafka = require('../config/kafka');
const logger = require('../logger');
const topics = require('../../../../contracts/topics');
const previewProducer = require('./previewProducer');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let consumer;
const consumerStatus = {
  running: false,
  connected: false,
  lastError: null
};

function parseKafkaMessage(message) {
  const rawValue = message.value ? message.value.toString('utf8') : '';
  if (!rawValue) {
    throw new Error('Received empty Kafka message.');
  }
  const parsedValue = JSON.parse(rawValue);
  return {
    id: parsedValue.id,
    eventId: parsedValue.eventId,
    type: parsedValue.type || parsedValue.eventType || parsedValue.event,
    payload: parsedValue.payload ?? parsedValue.data ?? {},
    metadata: parsedValue.metadata ?? {},
    createdAt: parsedValue.createdAt,
    source: 'kafka'
  };
}

async function ensureTopic() {
  const admin = kafka.admin();
  await admin.connect();
  try {
    await admin.createTopics({
      waitForLeaders: true,
      topics: [
        {
          topic: topics.UPLOAD_COMPLETED,
          numPartitions: 1,
          replicationFactor: 1
        }
      ]
    });
  } finally {
    await admin.disconnect();
  }
}

async function start() {
  if (consumerStatus.running) return;
  consumerStatus.running = true;

  while (consumerStatus.running) {
    try {
      await ensureTopic();

      consumer = kafka.consumer({
        groupId: config.kafka.groupId
      });

      await consumer.connect();
      await consumer.subscribe({
        topic: topics.UPLOAD_COMPLETED,
        fromBeginning: false
      });

      consumerStatus.connected = true;
      consumerStatus.lastError = null;

      logger.info('Kafka consumer connected and subscribed.', {
        topic: topics.UPLOAD_COMPLETED,
        brokers: config.kafka.brokers
      });

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const event = parseKafkaMessage(message);

            logger.info('Kafka event received.', {
              topic,
              partition,
              offset: message.offset,
              eventType: event.type
            });

            // Simulate preview generation
            logger.info(`Preview Service generating preview for file ${event.payload.file_id || event.id}`);
            await sleep(1000); // Simulate work

            // Produce preview.generated
            await previewProducer.publishPreviewEvent(topics.PREVIEW_GENERATED, {
              file_id: event.payload.file_id || event.id,
              status: 'success',
              generated_at: new Date().toISOString()
            });

            // Produce compression.requested
            await previewProducer.publishPreviewEvent(topics.COMPRESSION_REQUESTED, {
              file_id: event.payload.file_id || event.id,
              status: 'requested',
              requested_at: new Date().toISOString()
            });
            
          } catch (error) {
            logger.error('Kafka event processing failed.', {
              topic,
              partition,
              offset: message.offset,
              error: error.message
            });
          }
        }
      });

      return;
    } catch (error) {
      consumerStatus.connected = false;
      consumerStatus.lastError = error.message;

      logger.error('Kafka consumer failed to start. Retrying.', {
        error: error.message,
        retryInMs: config.kafka.retryConnectionDelayMs
      });

      if (consumer) {
        try {
          await consumer.disconnect();
        } catch (disconnectError) {
          logger.warn('Kafka consumer disconnect raised an error during retry.', {
            error: disconnectError.message
          });
        }
        consumer = null;
      }

      if (!consumerStatus.running) break;
      await sleep(config.kafka.retryConnectionDelayMs);
    }
  }
}

async function stop() {
  consumerStatus.running = false;
  consumerStatus.connected = false;

  if (consumer) {
    await consumer.disconnect();
    consumer = null;
    logger.info('Kafka consumer disconnected.');
  }
  await previewProducer.disconnect();
}

function getStatus() {
  return {
    ...consumerStatus,
    brokers: config.kafka.brokers
  };
}

module.exports = {
  start,
  stop,
  getStatus
};
