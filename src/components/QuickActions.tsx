
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const QuickActions: React.FC<QuickActionsProps> = ({
  onVoiceNote,
  onBarcodeScanned
}) => {
  const [showVoiceNote, setShowVoiceNote] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const { isOnline, hasQueuedActions, queuedActions } = useOfflineMode();
  const { toast } = useToast();

  const handleVoiceNoteSave = (audioBlob: Blob) => {
    console.log('Voice note saved:', audioBlob);
    if (onVoiceNote) {
      onVoiceNote(audioBlob);
    }
    setShowVoiceNote(false);
    
    toast({
      title: "Voice Note Saved",
      description: "Your voice note has been attached to this session.",
    });
  };

  const handleBarcodeScan = (barcode: string, bagInfo?: any) => {
    console.log('Barcode scanned:', barcode, bagInfo);
    if (onBarcodeScanned) {
      onBarcodeScanned(barcode, bagInfo);
    }
    setShowBarcodeScanner(false);
    
    if (bagInfo) {
      toast({
        title: "Bag Scanned",
        description: `${bagInfo.strength} ${bagInfo.volume}ml - Batch: ${bagInfo.batchNumber}`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Quick Actions</span>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm text-gray-600">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setShowVoiceNote(true)}
              variant="outline"
              className="h-20 flex-col space-y-2"
            >
              <Mic className="w-6 h-6" />
              <span className="text-xs">Voice Note</span>
            </Button>

            <Button
              onClick={() => setShowBarcodeScanner(true)}
              variant="outline"
              className="h-20 flex-col space-y-2"
            >
              <Camera className="w-6 h-6" />
              <span className="text-xs">Scan Bag</span>
            </Button>

            <Button
              onClick={() => setShowReminders(true)}
              variant="outline"
              className="h-20 flex-col space-y-2"
            >
              <Clock className="w-6 h-6" />
              <span className="text-xs">Reminders</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              disabled={!hasQueuedActions}
            >
              <div className="relative">
                <Wifi className="w-6 h-6" />
                {hasQueuedActions && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white">{queuedActions.length}</span>
                  </div>
                )}
              </div>
              <span className="text-xs">
                {hasQueuedActions ? 'Sync Pending' : 'Synced'}
              </span>
            </Button>
          </div>

          {!isOnline && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                You're offline. Data will be saved locally and synced when connection is restored.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showVoiceNote} onOpenChange={setShowVoiceNote}>
        <DialogContent>
          <VoiceNote
            onSave={handleVoiceNoteSave}
            onCancel={() => setShowVoiceNote(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showBarcodeScanner} onOpenChange={setShowBarcodeScanner}>
        <DialogContent>
          <BarcodeScanner
            onScan={handleBarcodeScan}
            onCancel={() => setShowBarcodeScanner(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showReminders} onOpenChange={setShowReminders}>
        <DialogContent className="max-w-2xl">
          <ReminderSystem />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuickActions;
