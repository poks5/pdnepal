import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Camera, X, Loader2, ZoomIn } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ClinicalPhotoUploadProps {
  photoUrls: string[];
  folder: string;
  onPhotosChange: (urls: string[]) => void;
  maxPhotos?: number;
  readOnly?: boolean;
}

const BUCKET = 'clinical-photos';

const ClinicalPhotoUpload: React.FC<ClinicalPhotoUploadProps> = ({
  photoUrls,
  folder,
  onPhotosChange,
  maxPhotos = 5,
  readOnly = false,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  // Generate signed URLs for all stored paths
  useEffect(() => {
    const loadSignedUrls = async () => {
      const urlMap: Record<string, string> = {};
      for (const path of photoUrls) {
        if (path.startsWith('http')) {
          // Legacy public URL - extract path
          const storagePath = getStoragePath(path);
          const { data } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 3600);
          urlMap[path] = data?.signedUrl || path;
        } else {
          const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
          urlMap[path] = data?.signedUrl || path;
        }
      }
      setSignedUrls(urlMap);
    };
    if (photoUrls.length > 0) loadSignedUrls();
  }, [photoUrls]);

  const getStoragePath = (fullUrl: string): string => {
    try {
      const url = new URL(fullUrl);
      const match = url.pathname.match(/\/object\/(?:public|sign)\/clinical-photos\/(.+)/);
      return match ? decodeURIComponent(match[1]) : fullUrl;
    } catch {
      return fullUrl;
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    const remaining = maxPhotos - photoUrls.length;
    if (remaining <= 0) {
      toast({ title: t('error'), description: t('maxPhotosReached'), variant: 'destructive' });
      return;
    }

    setUploading(true);
    const newPaths: string[] = [];

    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: t('error'), description: t('fileTooLarge'), variant: 'destructive' });
        continue;
      }

      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user.id}/${folder}/${Date.now()}-${i}.${ext}`;

      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) {
        toast({ title: t('error'), description: error.message, variant: 'destructive' });
      } else {
        newPaths.push(path); // Store path only, not full URL
      }
    }

    if (newPaths.length > 0) {
      onPhotosChange([...photoUrls, ...newPaths]);
      toast({ title: '📸', description: t('photosUploaded') });
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (idx: number) => {
    onPhotosChange(photoUrls.filter((_, i) => i !== idx));
  };

  const getDisplayUrl = (path: string) => signedUrls[path] || '';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Camera className="w-3 h-3" /> {t('photos')} ({photoUrls.length}/{maxPhotos})
        </p>
        {!readOnly && photoUrls.length < maxPhotos && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-[10px] rounded-full gap-1"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
            {t('uploadPhoto')}
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={handleUpload}
      />

      {photoUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photoUrls.map((path, idx) => {
            const displayUrl = getDisplayUrl(path);
            return (
              <div key={idx} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-border/30 bg-muted/20">
                {displayUrl ? (
                  <img
                    src={displayUrl}
                    alt={`${t('clinicalPhoto')} ${idx + 1}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setPreviewUrl(displayUrl)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                <button
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  onClick={() => setPreviewUrl(displayUrl)}
                >
                  <ZoomIn className="w-4 h-4 text-white" />
                </button>
                {!readOnly && (
                  <button
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); removePhoto(idx); }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-2">
          {previewUrl && (
            <img
              src={previewUrl}
              alt={t('clinicalPhoto')}
              className="w-full h-full object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicalPhotoUpload;
