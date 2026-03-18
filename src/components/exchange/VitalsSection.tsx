import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExchangeData } from '@/hooks/useExchangeForm';

interface VitalsSectionProps {
  formData: ExchangeData;
  updateField: (field: keyof ExchangeData, value: any) => void;
}

export const VitalsSection: React.FC<VitalsSectionProps> = ({
  formData,
  updateField,
}) => {
  const { t } = useLanguage();

  return (
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
          <Label htmlFor="temperature">{t('temperature') || 'Temperature'} (°F)</Label>
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
  );
};
