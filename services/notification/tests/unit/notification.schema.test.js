import { describe, expect, it } from 'vitest';
import { manualNotificationSchema } from '../../src/modules/notifications/notification.schema.js';

describe('manualNotificationSchema', () => {
  it('accepts a valid payload', () => {
    const result = manualNotificationSchema.safeParse({
      type: 'manual',
      to_address: 'ops@example.com',
      subject: 'Alert',
      message: 'Triggered',
      metadata: { source: 'admin' }
    });

    expect(result.success).toBe(true);
  });

  it('rejects an invalid email address', () => {
    const result = manualNotificationSchema.safeParse({
      type: 'manual',
      to_address: 'ops',
      subject: 'Alert',
      message: 'Triggered'
    });

    expect(result.success).toBe(false);
  });

  it('defaults metadata to an empty object', () => {
    const result = manualNotificationSchema.parse({
      type: 'manual',
      to_address: 'ops@example.com',
      subject: 'Alert',
      message: 'Triggered'
    });

    expect(result.metadata).toEqual({});
  });
});
