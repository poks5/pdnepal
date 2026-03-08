
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';
import { ExchangeData } from '@/hooks/useExchangeForm';
import { calculateUF, getUFCalculationMessage } from '@/utils/ufCalculations';

interface VolumeSectionProps {
  formData: ExchangeData;
  updateField: (field: keyof ExchangeData, value: any) => void;
  previousFillVolume: number | null;
  isUFAutoCalculated: boolean;
  setIsUFAutoCalculated: (value: boolean) => void;
}

export const VolumeSection: React.FC<VolumeSectionProps> = ({
  formData,
  updateField,
  previousFillVolume,
  isUFAutoCalculated,
  setIsUFAutoCalculated
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();

  const manuallyCalculateUF = () => {
    const calculatedUF = calculateUF(formData.drainVolume, previousFillVolume, formData.fillVolume);
    updateField('ultrafiltration', calculatedUF);
    setIsUFAutoCalculated(true);
    
    toast({
      title: "UF Calculated",
      description: getUFCalculationMessage(previousFillVolume)
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="drainVolume">{t('drainVolume')}</Label>
        <Input
          id="drainVolume"
          type="number"
          min="0"
          value={formData.drainVolume}
          onChange={(e) => updateField('drainVolume', Number(e.target.value))}
          required
        />
      </div>
      <div>
        <Label htmlFor="fillVolume">{t('fillVolume')}</Label>
        <Input
          id="fillVolume"
          type="number"
          min="1"
          value={formData.fillVolume}
          onChange={(e) => updateField('fillVolume', Number(e.target.value))}
          required
        />
      </div>
      <div>
        <Label htmlFor="ultrafiltration" className="flex items-center justify-between">
          <span>{t('ultrafiltration')}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={manuallyCalculateUF}
            className="h-6 px-2"
          >
            <Calculator className="w-3 h-3" />
          </Button>
        </Label>
        <Input
          id="ultrafiltration"
          type="number"
          value={formData.ultrafiltration}
          onChange={(e) => updateField('ultrafiltration', Number(e.target.value))}
          placeholder={isUFAutoCalculated ? "Auto-calculated" : "Auto or manual entry"}
          className={isUFAutoCalculated ? "bg-green-50 border-green-200" : ""}
        />
      </div>
      <div>
        <Label htmlFor="weightAfter">Post-Fill Weight (kg)</Label>
        <Input
          id="weightAfter"
          type="number"
          step="0.1"
          min="0"
          value={formData.weightAfter ?? ''}
          onChange={(e) => updateField('weightAfter', e.target.value ? Number(e.target.value) : null)}
          placeholder="Weight after fill"
        />
      </div>
    </div>
  );
};
