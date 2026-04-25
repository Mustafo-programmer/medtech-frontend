import { useEffect } from 'react';
import { onlineAPI } from '../api';

export const useOnline = () => {
  useEffect(() => {
    // Пингуем сразу
    onlineAPI.ping().catch(() => {});

    // Пингуем каждые 30 секунд
    const interval = setInterval(() => {
      onlineAPI.ping().catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, []);
};