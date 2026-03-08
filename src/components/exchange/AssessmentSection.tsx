
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ExchangeData } from '@/hooks/useExchangeForm';

const SYMPTOM_OPTIONS = [
  { id: 'fever', label: 'Fever' },
  { id: 'abdominal_pain', label: 'Abdominal Pain' },
  { id: 'constipation', label: 'Constipation' },
  { id: 'nausea', label: 'Nausea' },
  { id: 'headache', label: 'Headache' },
  { id: 'dizziness', label: 'Dizziness' },
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
          <Label htmlFor="color">Color</Label>
          <Select value={formData.color} onValueChange={(value) => updateField('color', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal (Clear/Light Yellow)</SelectItem>
              <SelectItem value="yellow">Dark Yellow</SelectItem>
              <SelectItem value="red">Red/Pink</SelectItem>
              <SelectItem value="brown">Brown</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pain Scale */}
      <div>
        <Label htmlFor="pain">{t('pain')} (0-10 scale)</Label>
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
          <span>No Pain (0)</span>
          <span>Current: {formData.pain}</span>
          <span>Severe (10)</span>
        </div>
      </div>

      {/* Symptoms */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Symptoms</Label>
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
              <span className="text-sm">{symptom.label}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
};
