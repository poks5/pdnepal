
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, CameraOff, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BarcodeScannerProps {
  onScan: (barcodeData: string, bagInfo?: BagInfo) => void;
  onCancel?: () => void;
}

interface BagInfo {
  strength: string;
  volume: number;
  batchNumber: string;
  expiryDate: string;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onCancel }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualEntry, setManualEntry] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const mockBagDatabase: Record<string, BagInfo> = {
    '1234567890123': {
      strength: '1.5%',
      volume: 2000,
      batchNumber: 'BTH001',
      expiryDate: '2024-12-31'
    },
    '9876543210987': {
      strength: '2.5%',
      volume: 2500,
      batchNumber: 'BTH002',
      expiryDate: '2024-11-30'
    },
    '5555666677778': {
      strength: '4.25%',
      volume: 2000,
      batchNumber: 'BTH003',
      expiryDate: '2025-01-15'
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsScanning(true);
      
      toast({
        title: "Camera started",
        description: "Point camera at the barcode",
      });
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access camera",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const simulateScan = () => {
    // Simulate successful scan for demo
    const mockBarcode = '1234567890123';
    const bagInfo = mockBagDatabase[mockBarcode];
    
    toast({
      title: "Barcode Scanned",
      description: `Found ${bagInfo?.strength} ${bagInfo?.volume}ml bag`,
    });
    
    onScan(mockBarcode, bagInfo);
    stopCamera();
  };

  const handleManualEntry = () => {
    if (manualEntry.trim()) {
      const bagInfo = mockBagDatabase[manualEntry.trim()];
      
      if (bagInfo) {
        toast({
          title: "Bag Found",
          description: `${bagInfo.strength} ${bagInfo.volume}ml bag`,
        });
      } else {
        toast({
          title: "Unknown Barcode",
          description: "Bag not found in database",
          variant: "destructive",
        });
      }
      
      onScan(manualEntry.trim(), bagInfo);
      setManualEntry('');
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="w-5 h-5" />
          <span>Scan Dialysate Bag</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isScanning ? (
          <div className="space-y-4">
            <Button onClick={startCamera} className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or enter manually
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manual-barcode">Barcode Number</Label>
              <Input
                id="manual-barcode"
                value={manualEntry}
                onChange={(e) => setManualEntry(e.target.value)}
                placeholder="Enter barcode manually"
              />
              <Button onClick={handleManualEntry} variant="outline" className="w-full">
                Submit
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-48 bg-gray-200 rounded"
              />
              <div className="absolute inset-0 border-2 border-red-500 rounded">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-red-500"></div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 text-center">
              Align barcode within the red frame
            </p>
            
            <div className="flex space-x-2">
              <Button onClick={simulateScan} className="flex-1">
                Simulate Scan
              </Button>
              <Button onClick={stopCamera} variant="outline">
                <CameraOff className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {onCancel && (
          <Button onClick={onCancel} variant="outline" className="w-full">
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default BarcodeScanner;
