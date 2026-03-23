import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import pdsathiLogo from '@/assets/pdsathi-logo.png';

const SharePDsathiCard: React.FC = () => {
  const { toast } = useToast();

  const handleShare = async () => {
    const url = 'https://pdnepal.lovable.app';
    if (navigator.share) {
      await navigator.share({ title: 'PDsathi – PD Companion', text: 'Track your Peritoneal Dialysis with PDsathi.', url });
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied! 📋', description: 'PDsathi link copied to clipboard.' });
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/5 via-card to-[hsl(var(--mint))]/5 border border-border/30 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="bg-white p-2.5 rounded-xl shadow-inner border border-border/20 shrink-0">
          <QRCodeSVG value="https://pdnepal.lovable.app" size={90} bgColor="#ffffff" fgColor="#1a1a2e" level="M" imageSettings={{ src: pdsathiLogo, x: undefined, y: undefined, height: 22, width: 22, excavate: true }} />
        </div>
        <div className="text-center sm:text-left space-y-2 flex-1">
          <h4 className="font-bold text-sm text-foreground">Share PDsathi</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">Help other PD patients by sharing this app with them.</p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full gap-1.5 border-primary/30 text-primary hover:bg-primary/10 font-semibold text-xs"
            onClick={handleShare}
          >
            <Share2 className="w-3.5 h-3.5" /> Share App Link
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SharePDsathiCard;
