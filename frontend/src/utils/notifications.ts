/**
 * Browser notifications for due/overdue revisions.
 *
 * Limitation: these use the plain Notification API, so they can only fire while
 * the app is open in a tab. There is no service worker or push backend.
 */

const LAST_NOTIFIED_KEY = 'lt.notify.lastDate';

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/** Ask for permission (no-op if already decided). */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    return (await Notification.requestPermission()) === 'granted';
  } catch {
    return false;
  }
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function readLastNotified(): string | null {
  try {
    return localStorage.getItem(LAST_NOTIFIED_KEY);
  } catch {
    return null;
  }
}

function writeLastNotified(value: string) {
  try {
    localStorage.setItem(LAST_NOTIFIED_KEY, value);
  } catch {
    /* storage unavailable: we simply may notify again later */
  }
}

export function revisionMessage(dueCount: number, overdueCount: number): string | null {
  const parts: string[] = [];
  if (dueCount > 0) parts.push(`${dueCount} due today`);
  if (overdueCount > 0) parts.push(`${overdueCount} overdue`);
  if (parts.length === 0) return null;
  const total = dueCount + overdueCount;
  return `${parts.join(', ')}. ${total === 1 ? 'One problem' : `${total} problems`} to revise.`;
}

/** Show the notification, returning false if the browser refused. */
export function showNotification(title: string, options?: NotificationOptions): boolean {
  if (!notificationsSupported() || Notification.permission !== 'granted') return false;
  try {
    const n = new Notification(title, {
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      ...options,
    });
    n.onclick = () => {
      window.focus();
      if (window.location.pathname !== '/due') window.location.assign('/due');
      n.close();
    };
    return true;
  } catch {
    // Some platforms (e.g. Android Chrome) throw without a service worker.
    return false;
  }
}

/**
 * Notify about due/overdue problems, at most once per calendar day.
 * Returns true if a notification was shown.
 */
export function notifyDueProblemsOncePerDay(dueCount: number, overdueCount: number): boolean {
  const message = revisionMessage(dueCount, overdueCount);
  if (!message) return false;
  if (!notificationsSupported() || Notification.permission !== 'granted') return false;

  const today = todayKey();
  if (readLastNotified() === today) return false;

  const shown = showNotification('Revisions due', { body: message, tag: 'revisions-due' });
  if (shown) writeLastNotified(today);
  return shown;
}
