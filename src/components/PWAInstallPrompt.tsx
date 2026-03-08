import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const ua = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for install prompt (Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after a short delay
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowBanner(true), 3000);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);

    // On iOS, show banner if not dismissed
    if (isIOSDevice) {
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowBanner(true), 5000);
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isInstalled || !showBanner) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 z-[60] animate-in slide-in-from-bottom-4 duration-300">
      <Card className="bg-card border-primary/20 shadow-xl shadow-primary/10 max-w-md mx-auto">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl gradient-medical flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
              <Smartphone className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground">Install PDsathi</h3>
              {isIOS ? (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tap <Share className="w-3 h-3 inline -mt-0.5" /> then <strong>"Add to Home Screen"</strong> to install
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Install for quick access, offline mode & push notifications
                </p>
              )}
              <div className="flex gap-2 mt-2.5">
                {!isIOS && (
                  <Button size="sm" onClick={handleInstall} className="h-8 rounded-lg text-xs font-semibold px-4">
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Install App
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={handleDismiss} className="h-8 rounded-lg text-xs text-muted-foreground">
                  Not now
                </Button>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleDismiss} className="shrink-0 w-7 h-7 rounded-full -mt-1 -mr-1">
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;
