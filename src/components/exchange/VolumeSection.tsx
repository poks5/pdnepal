
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator } from 'lucide-react';
import { ExchangeData } from '@/hooks/useExchangeForm';
import { calculateUF, getUFCalculationMessage } from '@/utils/ufCalculations';
import { MEDICAL_CONSTANTS } from '@/utils/constants';

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
      title: t('ufCalculated'),
      description: getUFCalculationMessage(previousFillVolume)
    });
  };

  return (
    <div className="space-y-5">
      {/* Fluid volumes and vitals are a required part of Add Exchange and should never be removed in later UI edits. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="solutionType">{t('solutionType') || 'Solution Type'}</Label>
          <Select value={formData.solutionType} onValueChange={(value) => updateField('solutionType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select solution" />
            </SelectTrigger>
            <SelectContent>
              {MEDICAL_CONSTANTS.solutionTypes.map((sol) => (
                <SelectItem key={sol} value={sol}>{sol}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="drainVolume">{t('drainVolume')}</Label>
          <Input
            id="drainVolume"
            type="number"
            min="0"
            value={formData.drainVolume ?? ''}
            onChange={(e) => updateField('drainVolume', e.target.value ? Number(e.target.value) : null)}
            placeholder="Enter drain volume"
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
            placeholder={isUFAutoCalculated ? t('autoCalculated') : t('autoOrManual')}
            className={isUFAutoCalculated ? 'bg-accent/40 border-border' : ''}
          />
        </div>
        <div>
          <Label htmlFor="weightAfter">{t('postFillWeight')}</Label>
          <Input
            id="weightAfter"
            type="number"
            step="0.1"
            min="0"
            value={formData.weightAfter ?? ''}
            onChange={(e) => updateField('weightAfter', e.target.value ? Number(e.target.value) : null)}
            placeholder={t('weightAfterFill')}
          />
        </div>
      </div>

      <div className="border border-border rounded-xl p-4 bg-muted/30">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          🩺 Vitals
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="bpSystolic">BP Systolic (mmHg)</Label>
            <Input
              id="bpSystolic"
              type="number"
              min="50"
              max="250"
              value={formData.bloodPressureSystolic ?? ''}
              onChange={(e) => updateField('bloodPressureSystolic', e.target.value ? Number(e.target.value) : null)}
              placeholder="e.g. 120"
            />
          </div>
          <div>
            <Label htmlFor="bpDiastolic">BP Diastolic (mmHg)</Label>
            <Input
              id="bpDiastolic"
              type="number"
              min="30"
              max="150"
              value={formData.bloodPressureDiastolic ?? ''}
              onChange={(e) => updateField('bloodPressureDiastolic', e.target.value ? Number(e.target.value) : null)}
              placeholder="e.g. 80"
            />
          </div>
          <div>
            <Label htmlFor="temperature">Temperature (°F)</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              min="93"
              max="108"
              value={formData.temperature ?? ''}
              onChange={(e) => updateField('temperature', e.target.value ? Number(e.target.value) : null)}
              placeholder="e.g. 98.6"
            />
          </div>
        </div>
      </div>
    </div>
  );
};