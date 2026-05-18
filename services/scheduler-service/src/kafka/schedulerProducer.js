const { Kafka } = require('kafkajs');
const config = require('../config/config');
const logger = require('../config/logger');
const topics = require('../../../../contracts/topics');

class SchedulerProducer {
  constructor() {
    const kafka = new Kafka({
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
    });
    this.producer = kafka.producer();
    this.isConnected = false;
  }

  async ensureTopics() {
    const kafka = new Kafka({
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
    });
    const admin = kafka.admin();
    await admin.connect();
    try {
      await admin.createTopics({
        waitForLeaders: true,
        topics: [
          {
            topic: topics.GC_TRIGGERED,
            numPartitions: 1,
            replicationFactor: 1
          },
          {
            topic: topics.BACKUP_TRIGGERED,
            numPartitions: 1,
            replicationFactor: 1
          }
        ]
      });
    } finally {
      await admin.disconnect();
    }
  }

  async connect() {
    try {
      await this.ensureTopics();
      await this.producer.connect();
      this.isConnected = true;
      logger.info('Kafka producer connected.', { brokers: config.kafka.brokers });
    } catch (error) {
      logger.error('Kafka producer connection failed.', { error: error.message });
    }
  }

  async sendEvent(topic, payload) {
    if (!this.isConnected) {
      logger.warn('Kafka producer not connected. Attempting to connect.');
      await this.connect();
    }

    try {
      await this.producer.send({
        topic: topic,
        messages: [
          {
            key: payload.id || payload.request_id || 'scheduler_event',
            value: JSON.stringify({
              event: topic,
              payload,
              timestamp: new Date().toISOString(),
            }),
          },
        ],
      });
      logger.info('Kafka event produced.', { eventKey: topic, topic: topic });
      return true;
    } catch (error) {
      logger.error('Kafka event publish failed.', { eventKey: topic, error: error.message });
      return false;
    }
  }
}

module.exports = new SchedulerProducer();
