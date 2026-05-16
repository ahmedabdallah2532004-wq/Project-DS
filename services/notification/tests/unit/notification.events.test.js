import { describe, expect, it } from 'vitest';
import { buildNotificationFromEvent } from '../../src/modules/notifications/notification.events.js';

describe('buildNotificationFromEvent', () => {
  it('maps quota exceeded events', () => {
    const notification = buildNotificationFromEvent('quota.exceeded', {
      user_id: 'u1',
      user_email: 'owner@example.com'
    });

    expect(notification.type).toBe('quota-exceeded');
    expect(notification.toAddress).toBe('owner@example.com');
  });

  it('returns null for unknown topics', () => {
    expect(buildNotificationFromEvent('unknown.topic', {})).toBeNull();
  });
});
