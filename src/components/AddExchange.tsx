import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, X, Droplets, Loader2, ChevronDown, Check } from 'lucide-react';
import { useExchangeForm, ExchangeData } from '@/hooks/useExchangeForm';
import { TimeTypeSection } from '@/components/exchange/TimeTypeSection';
import { VolumeSection } from '@/components/exchange/VolumeSection';
import { VitalsSection } from '@/components/exchange/VitalsSection';
import { AssessmentSection } from '@/components/exchange/AssessmentSection';
import { AdditiveSection } from '@/components/exchange/AdditiveSection';

interface AddExchangeProps {
  onSave: (data: ExchangeData) => Promise<void> | void;
  onCancel: () => void;
  saving?: boolean;
}

interface CollapsibleSectionProps {
  step: number;
  title: string;
  icon: string;
  id: string;
  open: boolean;
  onToggle: () => void;
  filled?: boolean;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  step, title, icon, id, open, onToggle, filled, children,
}) => (
  <section id={id} className="scroll-mt-16 rounded-xl border border-border overflow-hidden transition-all">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-2 p-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
    >
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
        {filled ? <Check className="w-3.5 h-3.5" /> : step}
      </span>
      <span className="text-sm font-semibold text-foreground flex-1">{icon} {title}</span>
      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
    </button>
    <div
      className={`transition-all duration-200 ease-in-out overflow-hidden ${open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
    >
      <div className="p-3 pt-2 space-y-3">
        {children}
      </div>
    </div>
  </section>
);

const AddExchange: React.FC<AddExchangeProps> = ({ onSave, onCancel, saving = false }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const {
    formData,
    updateField,
    previousFillVolume,
    recentAdditive,
    isLoadingReferenceData,
    isUFAutoCalculated,
    setIsUFAutoCalculated,
  } = useExchangeForm();

  // Sections 1 & 2 open by default (required fields), rest collapsed
  const [openSections, setOpenSections] = useState<Set<number>>(() => new Set([1, 2]));

  const toggle = (step: number) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(step)) next.delete(step);
      else next.add(step);
      return next;
    });
  };

  const hasBP = formData.bloodPressureSystolic != null || formData.bloodPressureDiastolic != null;
  const hasTemp = formData.temperature != null;
  const hasVitals = hasBP || hasTemp;
  const hasAssessment = formData.clarity !== 'clear' || formData.pain > 0 || formData.symptoms.length > 0;
  const hasAdditive = formData.additive?.additiveType !== 'none';
  const hasNotes = !!formData.notes;

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

      {isLoadingReferenceData ? (
        <div className="rounded-xl border border-border bg-muted/40 p-3">
          <p className="text-sm text-muted-foreground">Loading recent exchange references…</p>
        </div>
      ) : recentAdditive ? (
        <div className="rounded-xl border border-border bg-accent/40 p-3">
          <p className="text-sm font-medium text-foreground">
            Recently added additive: <strong>{recentAdditive.drugName || recentAdditive.additiveType}</strong>
            {recentAdditive.dose ? ` • ${recentAdditive.dose}` : ''}
          </p>
          {recentAdditive.reason && (
            <p className="mt-1 text-xs text-muted-foreground">Reason: {recentAdditive.reason}</p>
          )}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-3">
        <CollapsibleSection
          step={1} title={t('time') + ' & ' + t('exchangeType')} icon="🕐"
          id="exchange-section-time" open={openSections.has(1)} onToggle={() => toggle(1)}
          filled={!!formData.time}
        >
          <TimeTypeSection formData={formData} updateField={updateField} />
        </CollapsibleSection>

        <CollapsibleSection
          step={2} title={t('fillVolume') + ' / ' + t('drainVolume')} icon="💧"
          id="exchange-section-volumes" open={openSections.has(2)} onToggle={() => toggle(2)}
          filled={formData.drainVolume > 0 && formData.fillVolume > 0}
        >
          <VolumeSection
            formData={formData}
            updateField={updateField}
            previousFillVolume={previousFillVolume}
            isUFAutoCalculated={isUFAutoCalculated}
            setIsUFAutoCalculated={setIsUFAutoCalculated}
          />
        </CollapsibleSection>

        <CollapsibleSection
          step={3} title="Vitals" icon="🩺"
          id="exchange-section-vitals" open={openSections.has(3)} onToggle={() => toggle(3)}
          filled={hasVitals}
        >
          <VitalsSection formData={formData} updateField={updateField} />
        </CollapsibleSection>

        <CollapsibleSection
          step={4} title={t('clarity') + ' / ' + t('pain') + ' / ' + t('symptoms')} icon="🔍"
          id="exchange-section-assessment" open={openSections.has(4)} onToggle={() => toggle(4)}
          filled={hasAssessment}
        >
          <AssessmentSection formData={formData} updateField={updateField} />
        </CollapsibleSection>

        <CollapsibleSection
          step={5} title="Additives" icon="💉"
          id="exchange-section-additives" open={openSections.has(5)} onToggle={() => toggle(5)}
          filled={hasAdditive}
        >
          <AdditiveSection
            additive={formData.additive}
            onChange={(additive) => updateField('additive', additive)}
          />
        </CollapsibleSection>

        <CollapsibleSection
          step={6} title={t('notes')} icon="📝"
          id="exchange-section-notes" open={openSections.has(6)} onToggle={() => toggle(6)}
          filled={hasNotes}
        >
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
        </CollapsibleSection>

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
