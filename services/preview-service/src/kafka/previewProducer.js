const config = require('../config');
const kafka = require('../config/kafka');
const logger = require('../logger');
const topics = require('../../../../contracts/topics');

let producer;
let connected = false;

async function ensureProducerTopics() {
  const admin = kafka.admin();
  await admin.connect();
  try {
    await admin.createTopics({
      waitForLeaders: true,
      topics: [
        {
          topic: topics.PREVIEW_GENERATED,
          numPartitions: 1,
          replicationFactor: 1
        },
        {
          topic: topics.COMPRESSION_REQUESTED,
          numPartitions: 1,
          replicationFactor: 1
        }
      ]
    });
  } finally {
    await admin.disconnect();
  }
}

async function getProducer() {
  if (!producer) {
    producer = kafka.producer();
  }
  if (!connected) {
    await ensureProducerTopics();
    await producer.connect();
    connected = true;
  }
  return producer;
}

async function publishPreviewEvent(topic, payload) {
  try {
    const kafkaProducer = await getProducer();
    await kafkaProducer.send({
      topic: topic,
      messages: [
        {
          key: payload.file_id || payload.request_id,
          value: JSON.stringify({
            ...payload,
            emittedAt: new Date().toISOString()
          })
        }
      ]
    });
    logger.info(`Published event to topic ${topic}`);
  } catch (error) {
    logger.warn(`Kafka publish failed for topic ${topic}`, {
      error: error.message
    });
  }
}

async function disconnect() {
  if (producer && connected) {
    await producer.disconnect();
    connected = false;
  }
}

module.exports = {
  publishPreviewEvent,
  disconnect
};
