import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, Loader2 } from 'lucide-react';

const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowReconnected(true);
        setTimeout(() => setShowReconnected(false), 3000);
      }
    };
    const goOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [wasOffline]);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold transition-all duration-300 ${
        isOnline
          ? 'bg-[hsl(var(--mint))]/90 text-foreground'
          : 'bg-destructive/90 text-destructive-foreground'
      }`}
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)' }}
    >
      {isOnline ? (
        <>
          <Wifi className="w-3.5 h-3.5" />
          Back online — syncing data…
        </>
      ) : (
        <>
          <WifiOff className="w-3.5 h-3.5" />
          You're offline — exchanges will save locally and sync when connected
        </>
      )}
    </div>
  );
};

export default OfflineBanner;
