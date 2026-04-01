import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Mic, Camera, Clock, Wifi, WifiOff, Sparkles, Bell, Scan } from 'lucide-react';
import VoiceNote from './VoiceNote';
import BarcodeScanner from './BarcodeScanner';
import SmartReminders from './SmartReminders';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { useToast } from '@/hooks/use-toast';

interface QuickActionsProps {
  onVoiceNote?: (audioBlob: Blob) => void;
  onBarcodeScanned?: (barcode: string, bagInfo?: any) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onVoiceNote, onBarcodeScanned }) => {
  const [showVoiceNote, setShowVoiceNote] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const { isOnline, hasQueuedActions, queuedActions } = useOfflineMode();
  const { toast } = useToast();

  const handleVoiceNoteSave = (audioBlob: Blob) => {
    onVoiceNote?.(audioBlob);
    setShowVoiceNote(false);
    toast({ title: 'Voice Note Saved', description: 'Attached to this session.' });
  };

  const handleBarcodeScan = (barcode: string, bagInfo?: any) => {
    onBarcodeScanned?.(barcode, bagInfo);
    setShowBarcodeScanner(false);
    if (bagInfo) toast({ title: 'Bag Scanned', description: `${bagInfo.strength} ${bagInfo.volume}ml` });
  };

  const actions = [
    {
      icon: Mic,
      label: 'Voice Note',
      emoji: '🎙️',
      onClick: () => setShowVoiceNote(true),
      gradient: 'from-primary/10 to-[hsl(var(--lavender))]/10',
      iconColor: 'text-primary',
    },
    {
      icon: Scan,
      label: 'Scan Bag',
      emoji: '📷',
      onClick: () => setShowBarcodeScanner(true),
      gradient: 'from-[hsl(var(--mint))]/10 to-accent/10',
      iconColor: 'text-[hsl(var(--mint))]',
    },
    {
      icon: Bell,
      label: 'Reminders',
      emoji: '⏰',
      onClick: () => setShowReminders(true),
      gradient: 'from-[hsl(var(--coral))]/10 to-[hsl(var(--peach))]/10',
      iconColor: 'text-[hsl(var(--coral))]',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Online status - more subtle */}
      <div className="flex items-center gap-1.5 px-1">
        {isOnline
          ? <><Wifi className="w-3 h-3 text-[hsl(var(--mint))]" /><span className="text-[10px] font-medium text-muted-foreground">Connected</span></>
          : <><WifiOff className="w-3 h-3 text-destructive" /><span className="text-[10px] font-medium text-muted-foreground">Offline — saved locally</span></>
        }
        {hasQueuedActions && (
          <span className="text-[10px] font-semibold text-[hsl(var(--coral))] ml-auto">
            {queuedActions.length} pending
          </span>
        )}
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {actions.map(({ icon: Icon, label, emoji, onClick, gradient, iconColor }) => (
          <button
            key={label}
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-2 p-4 sm:p-5 rounded-2xl bg-gradient-to-br ${gradient} border border-border/30 shadow-sm hover:shadow-md active:scale-95 transition-all`}
          >
            <span className="text-2xl">{emoji}</span>
            <span className="text-[11px] sm:text-xs font-semibold text-foreground">{label}</span>
          </button>
        ))}
      </div>

      {!isOnline && (
        <div className="p-3.5 bg-[hsl(var(--peach))]/10 border border-[hsl(var(--coral))]/20 rounded-2xl">
          <p className="text-xs text-[hsl(var(--coral))] font-medium">
            📡 You're offline. Data will sync when connection is restored.
          </p>
        </div>
      )}

      <Dialog open={showVoiceNote} onOpenChange={setShowVoiceNote}>
        <DialogContent><VoiceNote onSave={handleVoiceNoteSave} onCancel={() => setShowVoiceNote(false)} /></DialogContent>
      </Dialog>
      <Dialog open={showBarcodeScanner} onOpenChange={setShowBarcodeScanner}>
        <DialogContent><BarcodeScanner onScan={handleBarcodeScan} onCancel={() => setShowBarcodeScanner(false)} /></DialogContent>
      </Dialog>
      <Dialog open={showReminders} onOpenChange={setShowReminders}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto"><SmartReminders /></DialogContent>
      </Dialog>
    </div>
  );
};

export default QuickActions;
