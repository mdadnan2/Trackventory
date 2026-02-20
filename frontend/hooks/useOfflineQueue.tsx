'use client';

import { useState, useEffect } from 'react';

interface QueuedAction {
  id: string;
  type: 'DISTRIBUTION' | 'DAMAGE' | 'LOSS' | 'RETURN';
  data: any;
  timestamp: number;
  retries: number;
}

export function useOfflineQueue() {
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('offline_queue');
    if (stored) setQueue(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('offline_queue', JSON.stringify(queue));
  }, [queue]);

  const addToQueue = (type: QueuedAction['type'], data: any) => {
    const action: QueuedAction = {
      id: `${type}-${Date.now()}`,
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
    };
    setQueue((prev) => [...prev, action]);
  };

  const removeFromQueue = (id: string) => {
    setQueue((prev) => prev.filter((a) => a.id !== id));
  };

  const clearQueue = () => setQueue([]);

  return { queue, syncing, setSyncing, addToQueue, removeFromQueue, clearQueue };
}
