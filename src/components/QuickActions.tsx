import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Mic, Bell, Scan, Wifi, WifiOff } from 'lucide-react';
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
    { icon: Mic, label: 'Voice', emoji: '🎙️', onClick: () => setShowVoiceNote(true) },
    { icon: Scan, label: 'Scan', emoji: '📷', onClick: () => setShowBarcodeScanner(true) },
    { icon: Bell, label: 'Reminders', emoji: '⏰', onClick: () => setShowReminders(true) },
  ];

  return (
    <div className="space-y-2">
      {/* Compact status */}
      <div className="flex items-center gap-1.5 px-0.5">
        {isOnline
          ? <><Wifi className="w-2.5 h-2.5 text-[hsl(var(--mint))]" /><span className="text-[10px] text-muted-foreground">Connected</span></>
          : <><WifiOff className="w-2.5 h-2.5 text-destructive" /><span className="text-[10px] text-muted-foreground">Offline</span></>
        }
        {hasQueuedActions && (
          <span className="text-[10px] font-semibold text-[hsl(var(--coral))] ml-auto">{queuedActions.length} pending</span>
        )}
      </div>

      {/* Action row – compact native style */}
      <div className="grid grid-cols-3 gap-2">
        {actions.map(({ label, emoji, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl native-card native-press"
          >
            <span className="text-xl">{emoji}</span>
            <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
          </button>
        ))}
      </div>

      {!isOnline && (
        <div className="p-2.5 bg-[hsl(var(--peach))]/10 border border-[hsl(var(--coral))]/20 rounded-xl">
          <p className="text-[11px] text-[hsl(var(--coral))] font-medium">📡 Offline — data syncs when reconnected</p>
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
