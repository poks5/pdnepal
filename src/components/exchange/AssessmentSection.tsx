
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ExchangeData } from '@/hooks/useExchangeForm';

const SYMPTOM_OPTIONS = [
  { id: 'fever', labelKey: 'fever' },
  { id: 'abdominal_pain', labelKey: 'abdominalPain' },
  { id: 'constipation', labelKey: 'constipation' },
  { id: 'nausea', labelKey: 'nausea' },
  { id: 'headache', labelKey: 'headache' },
  { id: 'dizziness', labelKey: 'dizziness' },
];

interface AssessmentSectionProps {
  formData: ExchangeData;
  updateField: (field: keyof ExchangeData, value: any) => void;
}

export const AssessmentSection: React.FC<AssessmentSectionProps> = ({
  formData,
  updateField
}) => {
  const { t } = useLanguage();

  return (
    <>
      {/* Fluid Assessment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="clarity">{t('clarity')}</Label>
          <Select value={formData.clarity} onValueChange={(value) => updateField('clarity', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clear">{t('clear')}</SelectItem>
              <SelectItem value="cloudy">{t('cloudy')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="color">{t('color')}</Label>
          <Select value={formData.color} onValueChange={(value) => updateField('color', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">{t('colorNormal')}</SelectItem>
              <SelectItem value="yellow">{t('colorYellow')}</SelectItem>
              <SelectItem value="red">{t('colorRed')}</SelectItem>
              <SelectItem value="brown">{t('colorBrown')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pain Scale */}
      <div>
        <Label htmlFor="pain">{t('pain')} (0-10)</Label>
        <Input
          id="pain"
          type="range"
          min="0"
          max="10"
          value={formData.pain}
          onChange={(e) => updateField('pain', Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-muted-foreground mt-1">
          <span>{t('noPain')} (0)</span>
          <span>{t('current')}: {formData.pain}</span>
          <span>{t('severe')} (10)</span>
        </div>
      </div>

      {/* Symptoms */}
      <div>
        <Label className="text-sm font-medium mb-2 block">{t('symptoms')}</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SYMPTOM_OPTIONS.map((symptom) => (
            <label key={symptom.id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={formData.symptoms.includes(symptom.id)}
                onCheckedChange={(checked) => {
                  const updated = checked
                    ? [...formData.symptoms, symptom.id]
                    : formData.symptoms.filter((s) => s !== symptom.id);
                  updateField('symptoms', updated);
                }}
              />
              <span className="text-sm">{t(symptom.labelKey)}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
};
