const config = require('../config');
const kafka = require('../config/kafka');
const logger = require('../logger');
const topics = require('../../../../contracts/topics');

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
    const topicsToCreate = [
      topics.UPLOAD_COMPLETED,
      topics.REPLICATION_COMPLETED,
      topics.QUOTA_EXCEEDED,
      topics.BACKUP_COMPLETED
    ];
    
    await admin.createTopics({
      waitForLeaders: true,
      topics: topicsToCreate.map(t => ({
        topic: t,
        numPartitions: 1,
        replicationFactor: 1
      }))
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
      
      const topicsToSubscribe = [
        topics.UPLOAD_COMPLETED,
        topics.REPLICATION_COMPLETED,
        topics.QUOTA_EXCEEDED,
        topics.BACKUP_COMPLETED
      ];

      for (const t of topicsToSubscribe) {
        await consumer.subscribe({
          topic: t,
          fromBeginning: false
        });
      }

      consumerStatus.connected = true;
      consumerStatus.lastError = null;

      logger.info('Kafka consumer connected and subscribed.', {
        topics: topicsToSubscribe,
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

            // Process event (e.g., send notification)
            logger.info(`Notification Service processing event of type ${event.type}`);
            
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
