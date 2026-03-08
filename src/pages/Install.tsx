import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Smartphone, Share, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install: React.FC = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="rounded-full mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="text-center space-y-3">
          <div className="w-20 h-20 gradient-medical rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/25">
            <span className="text-primary-foreground font-bold text-3xl">PD</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Install PDsathi</h1>
          <p className="text-muted-foreground text-sm">Get the full app experience on your device</p>
        </div>

        {isInstalled ? (
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <h2 className="text-lg font-semibold text-foreground">Already Installed!</h2>
              <p className="text-sm text-muted-foreground">PDsathi is installed on your device. Open it from your home screen.</p>
            </CardContent>
          </Card>
        ) : isIOS ? (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-foreground">Install on iPhone/iPad</h2>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">1</span>
                  <span>Tap the <Share className="w-4 h-4 inline -mt-0.5 text-primary" /> <strong className="text-foreground">Share</strong> button in Safari</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">2</span>
                  <span>Scroll down and tap <strong className="text-foreground">"Add to Home Screen"</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">3</span>
                  <span>Tap <strong className="text-foreground">"Add"</strong> to confirm</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-foreground">Install on Android</h2>
              {deferredPrompt ? (
                <Button onClick={handleInstall} className="w-full h-12 rounded-xl font-semibold">
                  <Download className="w-5 h-5 mr-2" /> Install PDsathi
                </Button>
              ) : (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Use Chrome browser menu (⋮) → <strong className="text-foreground">"Install app"</strong> or <strong className="text-foreground">"Add to Home screen"</strong></p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm text-foreground mb-3">Why install?</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-primary shrink-0" /> Works like a native app — no browser bar</li>
              <li className="flex items-center gap-2"><Download className="w-4 h-4 text-primary shrink-0" /> Loads instantly, even with slow internet</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary shrink-0" /> Quick access from your home screen</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Install;
