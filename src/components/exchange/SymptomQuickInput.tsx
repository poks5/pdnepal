import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const QUICK_SYMPTOMS = [
  { id: 'fever', emoji: '🤒', labelKey: 'fever' },
  { id: 'abdominal_pain', emoji: '😣', labelKey: 'abdominalPain' },
  { id: 'nausea', emoji: '🤢', labelKey: 'nausea' },
  { id: 'headache', emoji: '🤕', labelKey: 'headache' },
  { id: 'dizziness', emoji: '😵', labelKey: 'dizziness' },
  { id: 'constipation', emoji: '💤', labelKey: 'constipation' },
] as const;

interface SymptomQuickInputProps {
  selected: string[];
  onChange: (symptoms: string[]) => void;
}

const SymptomQuickInput: React.FC<SymptomQuickInputProps> = ({ selected, onChange }) => {
  const { t } = useLanguage();

  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter(s => s !== id)
        : [...selected, id]
    );
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground">⚡ Quick symptoms</p>
      <div className="flex flex-wrap gap-2">
        {QUICK_SYMPTOMS.map(({ id, emoji, labelKey }) => {
          const active = selected.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 border ${
                active
                  ? 'bg-destructive/10 border-destructive/30 text-destructive shadow-sm'
                  : 'bg-muted/50 border-border/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              <span>{emoji}</span>
              <span>{t(labelKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SymptomQuickInput;
