import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const BUILD_VERSION = (window as any).__APP_BUILD_VERSION__ || 'unknown';

const AppVersionBadge: React.FC = () => {
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    // Check if a new service worker is waiting
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg?.waiting) setStale(true);
      reg?.addEventListener('updatefound', () => {
        const sw = reg.installing;
        sw?.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            setStale(true);
          }
        });
      });
    });
  }, []);

  const forceUpdate = async () => {
    setUpdating(true);
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      toast({ title: 'Updating…', description: 'Reloading with latest version.' });
      setTimeout(() => window.location.reload(), 500);
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
      setUpdating(false);
    }
  };

  return (
    <>
      {/* Stale-build banner */}
      {stale && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-primary text-primary-foreground text-center py-2 px-4 text-sm font-semibold flex items-center justify-center gap-3 shadow-lg animate-in slide-in-from-top-2">
          <span>🔄 A new version is available!</span>
          <Button
            size="sm"
            variant="secondary"
            className="h-7 text-xs rounded-full px-4"
            onClick={forceUpdate}
            disabled={updating}
          >
            {updating ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : null}
            Update Now
          </Button>
        </div>
      )}

      {/* Small version pill — bottom-left on desktop, hidden on mobile (save space) */}
      <div className="fixed bottom-3 left-3 z-40 hidden md:flex items-center gap-1.5 bg-muted/80 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] text-muted-foreground border border-border/30 shadow-sm">
        <span className="font-mono">v{BUILD_VERSION.slice(0, 16)}</span>
        <button
          onClick={forceUpdate}
          disabled={updating}
          className="hover:text-foreground transition-colors"
          title="Force update"
        >
          <RefreshCw className={`w-3 h-3 ${updating ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </>
  );
};

export default AppVersionBadge;
