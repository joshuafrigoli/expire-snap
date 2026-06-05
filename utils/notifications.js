import * as Notifications from 'expo-notifications';

export async function scheduleExpiryNotification(item) {
  const expiryDate = new Date(item.estimated_expiry_date);
  const triggerDate = new Date(expiryDate);
  triggerDate.setDate(triggerDate.getDate() - 1);

  const result = await Notifications.scheduleNotificationAsync({
    content: {
      title: item.name + ' expiring soon',
      body: item.name + ' expires tomorrow',
    },
    trigger: { type: 'date', date: triggerDate },
  });

  return result;
}

export async function cancelExpiryNotification(notificationId) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
