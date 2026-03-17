import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Loader2, CheckCircle, Send } from 'lucide-react';

const PD_SYMPTOMS = [
  { id: 'cloudy_dialysate', label: 'Cloudy Dialysate', emoji: '🌫️', severity: 'high' },
  { id: 'abdominal_pain', label: 'Abdominal Pain', emoji: '😖', severity: 'high' },
  { id: 'fever', label: 'Fever', emoji: '🤒', severity: 'high' },
  { id: 'exit_site_redness', label: 'Exit Site Redness', emoji: '🔴', severity: 'medium' },
  { id: 'exit_site_discharge', label: 'Exit Site Discharge', emoji: '💧', severity: 'medium' },
  { id: 'poor_drainage', label: 'Poor Drainage', emoji: '🚫', severity: 'medium' },
  { id: 'nausea_vomiting', label: 'Nausea / Vomiting', emoji: '🤢', severity: 'medium' },
  { id: 'swelling', label: 'Swelling / Edema', emoji: '🫧', severity: 'low' },
];

interface SymptomReportProps {
  onClose?: () => void;
}

const SymptomReport: React.FC<SymptomReportProps> = ({ onClose }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleSymptom = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const overallSeverity = () => {
    if (selected.some(s => PD_SYMPTOMS.find(ps => ps.id === s)?.severity === 'high')) return 'high';
    if (selected.some(s => PD_SYMPTOMS.find(ps => ps.id === s)?.severity === 'medium')) return 'moderate';
    return 'low';
  };

  const handleSubmit = async () => {
    if (!user || selected.length === 0) {
      toast({ title: 'Select at least one symptom', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('symptom_reports').insert({
      patient_id: user.id,
      symptoms: selected,
      severity: overallSeverity(),
      notes: notes || null,
    } as any);
    setSubmitting(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setSubmitted(true);
      toast({ title: '🚨 Symptom Report Sent', description: 'Your doctor will be notified.' });
    }
  };

  if (submitted) {
    return (
      <Card className="rounded-2xl border-[hsl(var(--mint))]/30 bg-[hsl(var(--mint))]/5">
        <CardContent className="py-8 text-center space-y-3">
          <CheckCircle className="w-12 h-12 text-[hsl(var(--mint))] mx-auto" />
          <h3 className="text-lg font-bold text-foreground">Report Submitted</h3>
          <p className="text-sm text-muted-foreground">Your doctor has been alerted and will review your symptoms.</p>
          {onClose && <Button variant="outline" onClick={onClose} className="rounded-xl mt-2">Close</Button>}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-destructive" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Report PD Problem</h2>
          <p className="text-xs text-muted-foreground">Select symptoms to alert your doctor</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {PD_SYMPTOMS.map(symptom => {
          const isSelected = selected.includes(symptom.id);
          return (
            <button
              key={symptom.id}
              onClick={() => toggleSymptom(symptom.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-destructive bg-destructive/5 shadow-sm'
                  : 'border-border/30 hover:border-border'
              }`}
            >
              <span className="text-lg">{symptom.emoji}</span>
              <p className={`text-xs font-semibold mt-1 ${isSelected ? 'text-destructive' : 'text-foreground'}`}>
                {symptom.label}
              </p>
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Severity:</span>
            <Badge className={`text-xs border-0 ${
              overallSeverity() === 'high' ? 'bg-destructive/10 text-destructive' :
              overallSeverity() === 'moderate' ? 'bg-[hsl(var(--coral))]/10 text-[hsl(var(--coral))]' :
              'bg-[hsl(var(--mint))]/10 text-[hsl(var(--mint))]'
            }`}>
              {overallSeverity() === 'high' ? '🔴 High' : overallSeverity() === 'moderate' ? '🟡 Moderate' : '🟢 Low'}
            </Badge>
          </div>

          <div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details (optional)..."
              rows={3}
              className="rounded-xl resize-none"
            />
          </div>

          <Button onClick={handleSubmit} disabled={submitting} className="w-full h-12 rounded-xl font-semibold bg-destructive hover:bg-destructive/90">
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            {submitting ? 'Sending...' : 'Send Report to Doctor'}
          </Button>
        </>
      )}
    </div>
  );
};

export default SymptomReport;
