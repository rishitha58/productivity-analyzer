import { useEffect } from 'react';
import { useNotification as useNotificationContext } from '../context/NotificationContext';
import { notificationService } from '../services/notificationService';

export const useNotifications = () => {
  const context = useNotificationContext();

  // Sync with backend on mount
  useEffect(() => {
    // Optional: fetch backend notifications
    // syncWithBackend();
  }, []);

  const syncWithBackend = async () => {
    const result = await notificationService.getAllNotifications();
    if (result.success && result.data) {
      // Merge with local notifications
      console.log('Notifications synced:', result.data);
    }
  };

  // Schedule sleep reminder
  const scheduleSleepReminder = (bedtime) => {
    if (!bedtime) return;

    const [hours, mins] = bedtime.split(':').map(Number);
    const now = new Date();
    const sleepTime = new Date();
    sleepTime.setHours(hours, mins, 0, 0);

    // If sleep time already passed today, schedule for tomorrow
    if (sleepTime < now) {
      sleepTime.setDate(sleepTime.getDate() + 1);
    }

    // Schedule 30 min before sleep
    const reminderTime = new Date(sleepTime.getTime() - 30 * 60000);
    const delay = reminderTime - now;

    if (delay > 0) {
      setTimeout(() => {
        context.addNotification({
          title: '😴 Time to wind down',
          message: 'Sleep time in 30 minutes. Start preparing for bed!',
          type: 'info',
        });
      }, delay);
    }
  };

  // Schedule wake up alarm
  const scheduleWakeUpAlarm = (wakeupTime) => {
    if (!wakeupTime) return;
    context.addAlarm({
      time: wakeupTime,
      message: '🌅 Good morning! Time to start your day!',
      type: 'wakeup',
    });
  };

  // Schedule travel notification
  const scheduleTravelReminder = (departureTime, destination) => {
    context.addAlarm({
      time: departureTime,
      message: `🚗 Time to leave for ${destination}`,
      type: 'travel',
    });
  };

  // Task reminder
  const scheduleTaskReminder = (taskTime, taskTitle) => {
    context.addAlarm({
      time: taskTime,
      message: `📝 Reminder: ${taskTitle}`,
      type: 'task',
    });
  };

  return {
    ...context,
    syncWithBackend,
    scheduleSleepReminder,
    scheduleWakeUpAlarm,
    scheduleTravelReminder,
    scheduleTaskReminder,
  };
};

export default useNotifications;