import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Mic, Camera, Clock, Wifi, WifiOff } from 'lucide-react';
import VoiceNote from './VoiceNote';
import BarcodeScanner from './BarcodeScanner';
import ReminderSystem from './ReminderSystem';
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
    { icon: Mic, label: 'Voice Note', onClick: () => setShowVoiceNote(true), color: 'text-primary' },
    { icon: Camera, label: 'Scan Bag', onClick: () => setShowBarcodeScanner(true), color: 'text-emerald-600' },
    { icon: Clock, label: 'Reminders', onClick: () => setShowReminders(true), color: 'text-violet-600' },
  ];

  return (
    <div className="space-y-3">
      {/* Online status */}
      <div className="flex items-center gap-1.5 px-1">
        {isOnline
          ? <Wifi className="w-3.5 h-3.5 text-emerald-500" />
          : <WifiOff className="w-3.5 h-3.5 text-destructive" />
        }
        <span className="text-[10px] font-medium text-muted-foreground">
          {isOnline ? 'Online' : 'Offline — data saved locally'}
        </span>
        {hasQueuedActions && (
          <span className="text-[10px] font-semibold text-amber-600 ml-auto">
            {queuedActions.length} pending sync
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-2">
        {actions.map(({ icon: Icon, label, onClick, color }) => (
          <Button
            key={label}
            onClick={onClick}
            variant="outline"
            className="h-16 sm:h-20 flex-col gap-1.5 rounded-xl border-border/50 hover:border-primary/30 hover:bg-primary/5 active:scale-95 transition-all"
          >
            <Icon className={`w-5 h-5 ${color}`} />
            <span className="text-[10px] sm:text-xs font-medium text-foreground">{label}</span>
          </Button>
        ))}
      </div>

      {!isOnline && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <p className="text-xs text-amber-700 font-medium">
            You're offline. Data will sync when connection is restored.
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
        <DialogContent className="max-w-2xl"><ReminderSystem /></DialogContent>
      </Dialog>
    </div>
  );
};

export default QuickActions;
