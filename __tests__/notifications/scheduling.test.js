import * as Notifications from 'expo-notifications';
import { scheduleExpiryNotification, cancelExpiryNotification } from '@/utils/notifications';
import i18n from '@/utils/i18n';

describe('Notification scheduling', () => {
  beforeEach(() => jest.clearAllMocks());
  afterEach(async () => { await i18n.changeLanguage('en'); });

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

  it('uses Italian strings when app language is Italian', async () => {
    await i18n.changeLanguage('it');
    await scheduleExpiryNotification({ id: 'uuid-002', name: 'Latte', estimated_expiry_date: '2026-06-10' });
    const call = Notifications.scheduleNotificationAsync.mock.calls[0][0];
    expect(call.content.title).toBe('Latte in scadenza');
    expect(call.content.body).toBe('Latte scade domani');
  });

  it('uses English strings when app language is English', async () => {
    await i18n.changeLanguage('en');
    await scheduleExpiryNotification({ id: 'uuid-003', name: 'Milk', estimated_expiry_date: '2026-06-10' });
    const call = Notifications.scheduleNotificationAsync.mock.calls[0][0];
    expect(call.content.title).toBe('Milk expiring soon');
    expect(call.content.body).toBe('Milk expires tomorrow');
  });
});
