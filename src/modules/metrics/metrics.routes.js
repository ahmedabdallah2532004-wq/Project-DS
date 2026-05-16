import { Router } from 'express';
import { createMetric, getRecentMetrics } from './metrics.controller.js';

export const metricsRouter = Router();

metricsRouter.post('/', createMetric);
metricsRouter.get('/', getRecentMetrics);
