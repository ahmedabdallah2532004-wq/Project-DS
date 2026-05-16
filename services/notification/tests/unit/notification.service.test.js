import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockInsertNotification = vi.fn();
const mockPublishNotificationSent = vi.fn();

vi.mock('../../src/modules/notifications/notification.repository.js', () => ({
  insertNotification: mockInsertNotification,
  fetchRecentNotifications: vi.fn()
}));

vi.mock('../../src/events/kafka.js', () => ({
  publishNotificationSent: mockPublishNotificationSent
}));

const {
  createManualNotification,
  processEventNotification
} = await import('../../src/modules/notifications/notification.service.js');

describe('notification service', () => {
  beforeEach(() => {
    mockInsertNotification.mockReset();
    mockPublishNotificationSent.mockReset();
  });

  it('stores and publishes manual notifications', async () => {
    mockInsertNotification.mockResolvedValue({
      id: 1,
      type: 'manual',
      to_address: 'ops@example.com',
      source_topic: 'manual',
      status: 'sent',
      sent_at: '2026-01-01T00:00:00.000Z'
    });

    await createManualNotification({
      type: 'manual',
      to_address: 'ops@example.com',
      subject: 'Alert',
      message: 'Triggered',
      metadata: {}
    });

    expect(mockInsertNotification).toHaveBeenCalledOnce();
    expect(mockPublishNotificationSent).toHaveBeenCalledOnce();
  });

  it('returns null for unmapped event topics', async () => {
    const result = await processEventNotification('unknown.topic', {});

    expect(result).toBeNull();
  });
});
