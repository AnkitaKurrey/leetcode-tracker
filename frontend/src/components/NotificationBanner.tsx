import { useEffect, useState } from 'react';
import { requestNotificationPermission, checkAndNotifyDueProblems } from '../utils/notifications';
import { useDashboard } from '../hooks/useProblems';

export default function NotificationBanner() {
  const [permission, setPermission] = useState<NotificationPermission>(
    'default'
  );
  const [isDismissed, setIsDismissed] = useState(false);
  const { data: dashboard } = useDashboard();

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (
      dashboard &&
      permission === 'granted' &&
      (dashboard.stats.due > 0 || dashboard.stats.overdue > 0)
    ) {
      checkAndNotifyDueProblems(
        dashboard.stats.due,
        dashboard.stats.overdue
      );
    }
  }, [dashboard, permission]);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setPermission('granted');
      setIsDismissed(true);
      
      // Show immediate notification if there are due/overdue problems
      if (dashboard) {
        checkAndNotifyDueProblems(
          dashboard.stats.due,
          dashboard.stats.overdue
        );
      }
    } else {
      setPermission('denied');
    }
  };

  if (!('Notification' in window) || isDismissed || permission === 'granted') {
    return null;
  }

  if (permission === 'denied') {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Browser notifications are blocked. Please enable them in your browser settings to receive reminders for due problems.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-blue-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-blue-700 mb-2">
            <strong>Enable Browser Notifications</strong> to receive reminders when problems are due for revision.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleEnableNotifications}
              className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Enable Notifications
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
