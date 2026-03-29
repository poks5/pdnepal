import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QueuedAction {
  id: string;
  type: 'exchange_log' | 'profile_update' | 'settings_change';
  data: any;
  timestamp: string;
}

export const useOfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedActions, setQueuedActions] = useState<QueuedAction[]>([]);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('pd_offline_queue');
    if (saved) {
      try {
        setQueuedActions(JSON.parse(saved));
      } catch {
        // ignore corrupt data
      }
    }

    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persist queue to localStorage
  useEffect(() => {
    localStorage.setItem('pd_offline_queue', JSON.stringify(queuedActions));
  }, [queuedActions]);

  // Auto-sync when coming back online
  const syncQueuedActions = useCallback(async () => {
    if (queuedActions.length === 0 || syncing) return;
    setSyncing(true);

    const failed: QueuedAction[] = [];

    for (const action of queuedActions) {
      try {
        if (action.type === 'exchange_log') {
          const { error } = await supabase.from('exchange_logs').insert(action.data);
          if (error) throw error;
        }
        // Add other action types as needed
      } catch (err) {
        console.error(`Sync failed for ${action.id}:`, err);
        failed.push(action);
      }
    }

    setQueuedActions(failed);
    if (failed.length === 0) {
      localStorage.removeItem('pd_offline_queue');
    }

    setSyncing(false);

    toast({
      title: failed.length === 0 ? 'Sync complete ✅' : 'Partial sync',
      description: failed.length === 0
        ? `${queuedActions.length} queued actions synced.`
        : `${queuedActions.length - failed.length} synced, ${failed.length} will retry.`,
      variant: failed.length > 0 ? 'destructive' : 'default',
    });
  }, [queuedActions, syncing, toast]);

  // Trigger sync when online and queue has items
  useEffect(() => {
    if (isOnline && queuedActions.length > 0) {
      syncQueuedActions();
    }
  }, [isOnline, syncQueuedActions]);

  const queueAction = (type: QueuedAction['type'], data: any) => {
    const action: QueuedAction = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: new Date().toISOString(),
    };
    setQueuedActions(prev => [...prev, action]);
    return action.id;
  };

  const clearQueue = () => {
    setQueuedActions([]);
    localStorage.removeItem('pd_offline_queue');
  };

  return {
    isOnline,
    syncing,
    queuedActions,
    queueAction,
    syncQueuedActions,
    clearQueue,
    hasQueuedActions: queuedActions.length > 0,
  };
};
