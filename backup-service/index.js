require('dotenv').config();
const express = require('express');
const controller = require('./src/controllers/BackupRestController');
const consumer = require('./src/consumers/BackupEventConsumer');

const app = express();
app.use(express.json());

// Routes
app.post('/backup/run', (req, res) => controller.runBackup(req, res));
app.get('/backup/history', (req, res) => controller.getHistory(req, res));
app.get('/health', (req, res) => controller.health(req, res));
app.get('/ready', (req, res) => controller.ready(req, res));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backup Service running on port ${PORT}`);
  
  // Start Kafka Consumer
  consumer.start().catch(err => {
    console.error('Failed to start Kafka consumer:', err);
  });
});
