import * as Notifications from 'expo-notifications';
import { scheduleExpiryNotification, cancelExpiryNotification } from '@/utils/notifications';

describe('Notification scheduling', () => {
  beforeEach(() => jest.clearAllMocks());

  it('schedules notification 1 day before expiry date', async () => {
    const expiryDate = '2026-06-10';
    await scheduleExpiryNotification({ id: 'uuid-001', name: 'Milk', estimated_expiry_date: expiryDate });
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    const call = Notifications.scheduleNotificationAsync.mock.calls[0][0];
    expect(call.content.title).toMatch(/Milk/);
    // Compare date at ISO-string level to avoid timezone-dependent millisecond mismatches
    expect(call.trigger.date.toISOString().split('T')[0]).toBe('2026-06-09');
  });

  it('returns notification id from scheduleNotificationAsync', async () => {
    const id = await scheduleExpiryNotification({ id: 'uuid-001', name: 'Milk', estimated_expiry_date: '2026-06-10' });
    expect(id).toBe('notification-id-123');
  });

  it('calls cancelScheduledNotificationAsync with stored notification id', async () => {
    await cancelExpiryNotification('notification-id-123');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('notification-id-123');
  });
});
