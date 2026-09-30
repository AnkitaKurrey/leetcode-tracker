import { useEffect, useState } from 'react';
import api from '../services/api';
import { Banner } from './ui/Banner';
import { Button } from './ui/Button';

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/problems', { params: { is_solved: 'true' } })
      .then(() => !cancelled && setIsConnected(true))
      .catch(() => !cancelled && setIsConnected(false));
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  if (isConnected !== false) return null;

  return (
    <Banner
      tone="error"
      actions={
        <Button size="sm" onClick={() => setAttempt((a) => a + 1)}>
          Retry
        </Button>
      }
    >
      <span className="font-medium">Backend unreachable.</span>{' '}
      Start the API server at{' '}
      <code className="rounded bg-red-100 px-1 text-xs">
        {import.meta.env.VITE_API_URL || 'http://localhost:3000'}
      </code>{' '}
      and make sure MySQL is running.
    </Banner>
  );
}
