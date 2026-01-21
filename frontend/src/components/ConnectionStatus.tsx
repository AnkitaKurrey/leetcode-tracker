import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await api.get('/problems');
        setIsConnected(true);
      } catch (error) {
        setIsConnected(false);
      }
    };

    checkConnection();
  }, []);

  if (isConnected === null) {
    return null;
  }

  if (!isConnected) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              <strong>Backend Connection Failed</strong>
            </p>
            <p className="mt-1 text-sm text-red-600">
              Cannot connect to backend at {import.meta.env.VITE_API_URL || 'http://localhost:3000'}. 
              Please ensure the backend server is running.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
