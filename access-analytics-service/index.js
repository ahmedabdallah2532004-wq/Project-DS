require('dotenv').config();
const express = require('express');
const controller = require('./src/controllers/AnalyticsRestController');
const consumer = require('./src/consumers/AnalyticsEventConsumer');

const app = express();
app.use(express.json());

// Routes
app.post('/access/log', (req, res) => controller.logAccess(req, res));
app.get('/analytics/file/:id', (req, res) => controller.getFileAnalytics(req, res));
app.get('/health', (req, res) => controller.health(req, res));
app.get('/ready', (req, res) => controller.ready(req, res));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Access Analytics Service running on port ${PORT}`);
  
  // Start Kafka Consumer
  consumer.start().catch(err => {
    console.error('Failed to start Kafka consumer:', err);
  });
});
