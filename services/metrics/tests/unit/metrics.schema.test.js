import { describe, expect, it } from 'vitest';
import { recordMetricSchema } from '../../src/modules/metrics/metrics.schema.js';

describe('recordMetricSchema', () => {
  it('accepts a valid payload', () => {
    const result = recordMetricSchema.safeParse({
      service: 'gateway',
      name: 'cpu',
      value: 95,
      threshold: 80,
      labels: { node: 'n1' }
    });

    expect(result.success).toBe(true);
  });

  it('rejects a short service name', () => {
    const result = recordMetricSchema.safeParse({
      service: 'x',
      name: 'cpu',
      value: 95
    });

    expect(result.success).toBe(false);
  });

  it('coerces value and threshold to numbers', () => {
    const result = recordMetricSchema.parse({
      service: 'gateway',
      name: 'cpu',
      value: '95',
      threshold: '80'
    });

    expect(result.value).toBe(95);
    expect(result.threshold).toBe(80);
  });
});
