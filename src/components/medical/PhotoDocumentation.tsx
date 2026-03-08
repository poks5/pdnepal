import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, Eye, AlertTriangle, Calendar } from 'lucide-react';

interface PhotoEntry {
  id: string;
  timestamp: string;
  type: 'catheter_site' | 'fluid_clarity' | 'skin_condition' | 'other';
  imageUrl: string;
  notes: string;
  flagged: boolean;
}

const photoTypes = [
  { value: 'catheter_site' as const, label: 'Catheter Site', icon: '🩹' },
  { value: 'fluid_clarity' as const, label: 'Fluid Clarity', icon: '💧' },
  { value: 'skin_condition' as const, label: 'Skin', icon: '🫴' },
  { value: 'other' as const, label: 'Other', icon: '📷' },
];

const PhotoDocumentation: React.FC = () => {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<PhotoEntry[]>([
    { id: '1', timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'catheter_site', imageUrl: '/placeholder.svg', notes: 'Exit site looks clean', flagged: false },
    { id: '2', timestamp: new Date(Date.now() - 43200000).toISOString(), type: 'fluid_clarity', imageUrl: '/placeholder.svg', notes: 'Slightly cloudy effluent', flagged: true },
  ]);
  const [selectedType, setSelectedType] = useState<PhotoEntry['type']>('catheter_site');
  const [notes, setNotes] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    setPhotos(prev => [{ id: Date.now().toString(), timestamp: new Date().toISOString(), type: selectedType, imageUrl, notes, flagged: false }, ...prev]);
    setNotes('');
    toast({ title: '📸 Photo Saved', description: `${photoTypes.find(t => t.value === selectedType)?.label} documented.` });
  };

  const toggleFlag = (id: string) => setPhotos(prev => prev.map(p => p.id === id ? { ...p, flagged: !p.flagged } : p));
  const flagged = photos.filter(p => p.flagged);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-foreground">📸 Photo Documentation</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Document catheter site, fluid clarity & more</p>
      </div>

      {/* Flagged */}
      {flagged.length > 0 && (
        <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/15 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-foreground">{flagged.length} flagged photo(s)</p>
            <p className="text-xs text-muted-foreground mt-0.5">Consider sharing with your healthcare provider.</p>
          </div>
        </div>
      )}

      {/* Capture */}
      <Card className="rounded-2xl border-border/30 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">New Photo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {photoTypes.map(t => (
              <button
                key={t.value}
                onClick={() => setSelectedType(t.value)}
                className={`p-3 rounded-xl text-center transition-all active:scale-95 ${selectedType === t.value ? 'bg-primary/10 border-2 border-primary/30 shadow-sm' : 'bg-muted/30 border-2 border-transparent'}`}
              >
                <span className="text-2xl">{t.icon}</span>
                <p className="text-[10px] font-semibold text-foreground mt-1 leading-tight">{t.label}</p>
              </button>
            ))}
          </div>

          <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes about this photo…" rows={2} className="rounded-xl text-sm" />

          <div className="grid grid-cols-2 gap-3">
            <label>
              <Button className="w-full rounded-xl h-11 text-sm font-semibold pointer-events-none" asChild>
                <span><Camera className="w-4 h-4 mr-1.5" /> Take Photo</span>
              </Button>
              <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
            </label>
            <label>
              <Button variant="outline" className="w-full rounded-xl h-11 text-sm font-semibold pointer-events-none" asChild>
                <span><Upload className="w-4 h-4 mr-1.5" /> Upload</span>
              </Button>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Gallery */}
      <Card className="rounded-2xl border-border/30 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">Photo History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map(photo => (
              <div key={photo.id} className="rounded-2xl border border-border/30 overflow-hidden bg-muted/10">
                <div className="relative">
                  <img src={photo.imageUrl} alt="" className="w-full h-32 object-cover" />
                  {photo.flagged && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-3 h-3 text-destructive-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Badge className="text-[9px] px-1.5 py-0 border-0 bg-muted/50 text-muted-foreground font-semibold">
                      {photoTypes.find(t => t.value === photo.type)?.icon} {photoTypes.find(t => t.value === photo.type)?.label}
                    </Badge>
                    <button onClick={() => toggleFlag(photo.id)} className={`${photo.flagged ? 'text-destructive' : 'text-muted-foreground/40'}`}>
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(photo.timestamp).toLocaleDateString()}
                  </p>
                  {photo.notes && <p className="text-[11px] text-muted-foreground line-clamp-2">{photo.notes}</p>}
                </div>
              </div>
            ))}
          </div>
          {photos.length === 0 && (
            <div className="text-center py-8">
              <span className="text-4xl">📷</span>
              <p className="text-sm text-muted-foreground mt-2">No photos yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PhotoDocumentation;
