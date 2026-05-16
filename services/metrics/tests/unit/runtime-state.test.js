import { describe, expect, it } from 'vitest';
import { applyConfigEvent, applyFlagEvent, getRuntimeState } from '../../src/events/runtime-state.js';

describe('metrics runtime state', () => {
  it('applies matching config events', () => {
    const applied = applyConfigEvent({
      service: 'metrics-service',
      key: 'DEFAULT_THRESHOLD',
      value: 91
    });

    expect(applied).toBe(true);
    expect(getRuntimeState().defaultThreshold).toBe(91);
  });

  it('applies matching flag events', () => {
    const applied = applyFlagEvent({
      service: 'metrics-service',
      name: 'ENABLE_THRESHOLD_ALERTS',
      enabled: false
    });

    expect(applied).toBe(true);
    expect(getRuntimeState().alertsEnabled).toBe(false);
  });
});
