import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

export interface AdditiveData {
  additiveType: 'none' | 'heparin' | 'antibiotic' | 'other';
  drugName: string;
  dose: string;
  reason: string;
}

interface AdditiveSectionProps {
  additive: AdditiveData;
  onChange: (additive: AdditiveData) => void;
}

const COMMON_ADDITIVES: Record<string, { drugs: string[]; doses: string[] }> = {
  heparin: { drugs: ['Heparin'], doses: ['500 units/L', '1000 units/L'] },
  antibiotic: {
    drugs: ['Cefazolin', 'Ceftazidime', 'Vancomycin', 'Gentamicin', 'Amikacin', 'Fluconazole'],
    doses: ['1g', '2g', '0.6mg/kg', '2mg/kg', '25mg/kg'],
  },
};

export const AdditiveSection: React.FC<AdditiveSectionProps> = ({ additive, onChange }) => {
  const { t } = useLanguage();
  const update = (field: keyof AdditiveData, value: string) =>
    onChange({ ...additive, [field]: value });

  return (
    <div className="border border-border rounded-xl p-4 bg-muted/30">
      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        💉 Additives
      </h4>

      <div className="space-y-3">
        <div>
          <Label className="text-xs">Additive Used</Label>
          <Select
            value={additive.additiveType}
            onValueChange={(v) =>
              onChange({
                additiveType: v as AdditiveData['additiveType'],
                drugName: v === 'heparin' ? 'Heparin' : '',
                dose: '',
                reason: '',
              })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="heparin">Heparin</SelectItem>
              <SelectItem value="antibiotic">Antibiotic</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {additive.additiveType !== 'none' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Drug Name</Label>
              {additive.additiveType === 'antibiotic' ? (
                <Select value={additive.drugName} onValueChange={(v) => update('drugName', v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select drug" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_ADDITIVES.antibiotic.drugs.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={additive.drugName}
                  onChange={(e) => update('drugName', e.target.value)}
                  placeholder={additive.additiveType === 'heparin' ? 'Heparin' : 'Drug name'}
                  className="mt-1"
                />
              )}
            </div>
            <div>
              <Label className="text-xs">Dose</Label>
              {COMMON_ADDITIVES[additive.additiveType] ? (
                <Select value={additive.dose} onValueChange={(v) => update('dose', v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select dose" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_ADDITIVES[additive.additiveType].doses.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={additive.dose}
                  onChange={(e) => update('dose', e.target.value)}
                  placeholder="e.g. 500mg"
                  className="mt-1"
                />
              )}
            </div>
            <div>
              <Label className="text-xs">Reason</Label>
              <Input
                value={additive.reason}
                onChange={(e) => update('reason', e.target.value)}
                placeholder="e.g. peritonitis treatment"
                className="mt-1"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
