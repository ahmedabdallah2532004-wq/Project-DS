import { z } from 'zod';

export const recordMetricSchema = z.object({
  service: z.string().min(2).max(120),
  name: z.string().min(2).max(120),
  value: z.coerce.number().finite(),
  threshold: z.coerce.number().finite().optional(),
  labels: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({})
});
