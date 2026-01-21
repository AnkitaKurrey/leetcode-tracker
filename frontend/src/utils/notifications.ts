/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Show a browser notification
 */
export function showNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/vite.svg',
      badge: '/vite.svg',
      ...options,
    });
  }
}

/**
 * Check for due/overdue problems and show notifications
 */
export async function checkAndNotifyDueProblems(
  dueCount: number,
  overdueCount: number,
) {
  const hasPermission = await requestNotificationPermission();

  if (!hasPermission) {
    return;
  }

  if (overdueCount > 0) {
    showNotification(
      `📚 LeetCode Tracker`,
      {
        body: `You have ${overdueCount} overdue problem${overdueCount > 1 ? 's' : ''} to revise!`,
        tag: 'overdue',
        requireInteraction: true,
      }
    );
  } else if (dueCount > 0) {
    showNotification(
      `📚 LeetCode Tracker`,
      {
        body: `You have ${dueCount} problem${dueCount > 1 ? 's' : ''} due for revision today!`,
        tag: 'due-today',
      }
    );
  }
}
