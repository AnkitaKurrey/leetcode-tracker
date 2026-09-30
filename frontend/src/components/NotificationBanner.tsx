import { useEffect, useState } from 'react';
import {
  notificationsSupported,
  notifyDueProblemsOncePerDay,
  requestNotificationPermission,
} from '../utils/notifications';
import { useDashboard } from '../hooks/useProblems';
import { Banner } from './ui/Banner';
import { Button } from './ui/Button';

const DISMISS_KEY = 'lt.notifications.dismissed';

function readDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

export default function NotificationBanner() {
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    notificationsSupported() ? Notification.permission : 'default',
  );
  const [isDismissed, setIsDismissed] = useState(readDismissed);
  const { data: dashboard } = useDashboard();

  // Fires at most once per day; safe to run on every dashboard refetch.
  useEffect(() => {
    if (dashboard && permission === 'granted') {
      notifyDueProblemsOncePerDay(dashboard.stats.due, dashboard.stats.overdue);
    }
  }, [dashboard, permission]);

  const dismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  const enable = async () => {
    const granted = await requestNotificationPermission();
    // The effect above sends the first notification once permission flips.
    setPermission(granted ? 'granted' : 'denied');
  };

  if (!notificationsSupported() || isDismissed || permission !== 'default') {
    return null;
  }

  return (
    <Banner
      tone="info"
      actions={
        <>
          <Button size="sm" variant="ghost" onClick={dismiss}>
            Not now
          </Button>
          <Button size="sm" onClick={enable}>
            Enable notifications
          </Button>
        </>
      }
    >
      Get a browser notification when problems are due for revision.
    </Banner>
  );
}
