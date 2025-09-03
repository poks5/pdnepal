
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface QueuedAction {
  id: string;
  type: 'exchange_log' | 'profile_update' | 'settings_change';
  data: any;
  timestamp: string;
}

export const useOfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedActions, setQueuedActions] = useState<QueuedAction[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load queued actions from localStorage
    const saved = localStorage.getItem('pd_offline_queue');
    if (saved) {
      try {
        setQueuedActions(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load offline queue:', error);
      }
    }

    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "Connection restored. Syncing data...",
      });
      syncQueuedActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline Mode",
        description: "Your data will be saved locally and synced when connection is restored.",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Save queued actions to localStorage whenever they change
    localStorage.setItem('pd_offline_queue', JSON.stringify(queuedActions));
  }, [queuedActions]);

  const queueAction = (type: QueuedAction['type'], data: any) => {
    const action: QueuedAction = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: new Date().toISOString()
    };

    setQueuedActions(prev => [...prev, action]);

    if (!isOnline) {
      toast({
        title: "Data Queued",
        description: "Your data has been saved offline and will sync when connected.",
      });
    }

    return action.id;
  };

  const syncQueuedActions = async () => {
    if (queuedActions.length === 0) return;

    console.log('Syncing queued actions:', queuedActions);

    // Simulate sync process
    try {
      // In a real app, you would send these to your backend
      for (const action of queuedActions) {
        console.log(`Syncing ${action.type}:`, action.data);
        // await syncToServer(action);
      }

      // Clear queue after successful sync
      setQueuedActions([]);
      localStorage.removeItem('pd_offline_queue');

      toast({
        title: "Sync Complete",
        description: `${queuedActions.length} actions synced successfully.`,
      });
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: "Sync Failed",
        description: "Will retry when connection improves.",
        variant: "destructive",
      });
    }
  };

  const clearQueue = () => {
    setQueuedActions([]);
    localStorage.removeItem('pd_offline_queue');
  };

  return {
    isOnline,
    queuedActions,
    queueAction,
    syncQueuedActions,
    clearQueue,
    hasQueuedActions: queuedActions.length > 0
  };
};
