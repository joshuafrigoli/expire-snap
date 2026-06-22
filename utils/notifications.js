import * as Notifications from 'expo-notifications';
import i18n from '@/utils/i18n';

export async function scheduleExpiryNotification(item) {
  const expiryDate = new Date(item.estimated_expiry_date);
  const triggerDate = new Date(expiryDate);
  triggerDate.setDate(triggerDate.getDate() - 1);

  const result = await Notifications.scheduleNotificationAsync({
    content: {
      title: i18n.t('notifications.expiringTitle', { name: item.name }),
      body: i18n.t('notifications.expiringBody', { name: item.name }),
    },
    trigger: { type: 'date', date: triggerDate },
  });

  return result;
}

export async function cancelExpiryNotification(notificationId) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
