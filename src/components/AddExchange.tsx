import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, X, Droplets, Loader2 } from 'lucide-react';
import { useExchangeForm, ExchangeData } from '@/hooks/useExchangeForm';
import { TimeTypeSection } from '@/components/exchange/TimeTypeSection';
import { VolumeSection } from '@/components/exchange/VolumeSection';
import { AssessmentSection } from '@/components/exchange/AssessmentSection';

interface AddExchangeProps {
  onSave: (data: ExchangeData) => Promise<void> | void;
  onCancel: () => void;
  saving?: boolean;
}

const AddExchange: React.FC<AddExchangeProps> = ({ onSave, onCancel, saving = false }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { formData, updateField, previousFillVolume, isUFAutoCalculated, setIsUFAutoCalculated } = useExchangeForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.drainVolume || formData.drainVolume < 0 || formData.fillVolume <= 0) {
      toast({ title: t('validationError'), description: t('enterValidVolumes'), variant: 'destructive' });
      return;
    }
    let finalUF = formData.ultrafiltration;
    if (!finalUF && !isUFAutoCalculated) {
      finalUF = formData.drainVolume - formData.fillVolume;
    }
    onSave({ ...formData, ultrafiltration: finalUF });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Droplets className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{t('addExchange')}</h2>
            <p className="text-xs text-muted-foreground">{t('recordExchange')}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {previousFillVolume && (
        <div className="bg-primary/5 border border-primary/10 p-3 rounded-xl">
          <p className="text-sm text-primary font-medium">
            {t('previousFill')}: <strong>{previousFillVolume}ml</strong>
            {isUFAutoCalculated && ` ${t('usedForUF')}`}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <TimeTypeSection formData={formData} updateField={updateField} />
        <VolumeSection
          formData={formData}
          updateField={updateField}
          previousFillVolume={previousFillVolume}
          isUFAutoCalculated={isUFAutoCalculated}
          setIsUFAutoCalculated={setIsUFAutoCalculated}
        />
        <AssessmentSection formData={formData} updateField={updateField} />

        <div className="space-y-1.5">
          <Label htmlFor="notes" className="text-sm font-medium">{t('notes')}</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder={t('anyConcerns')}
            rows={3}
            className="rounded-xl resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saving} className="flex-1 h-12 rounded-xl font-semibold shadow-md shadow-primary/20 active:scale-[0.98] transition-transform">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {saving ? t('saving') : t('save')}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving} className="rounded-xl h-12">
            {t('cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddExchange;
