import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Thermometer, Activity } from 'lucide-react';

interface SymptomEntry {
  id: string;
  timestamp: string;
  symptoms: { pain: number; nausea: number; fatigue: number; breathlessness: number; fever: boolean; temperature?: number };
  severity: 'mild' | 'moderate' | 'severe';
  notes: string;
}

const SymptomTracker: React.FC = () => {
  const { toast } = useToast();
  const [symptoms, setSymptoms] = useState({ pain: 0, nausea: 0, fatigue: 0, breathlessness: 0, fever: false, temperature: 0 });
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState<SymptomEntry[]>([
    { id: '1', timestamp: new Date(Date.now() - 7200000).toISOString(), symptoms: { pain: 3, nausea: 1, fatigue: 4, breathlessness: 2, fever: false }, severity: 'mild', notes: 'Mild discomfort after morning exchange' },
  ]);

  const calcSeverity = (s: typeof symptoms): 'mild' | 'moderate' | 'severe' => {
    const max = Math.max(s.pain, s.nausea, s.fatigue, s.breathlessness);
    const avg = (s.pain + s.nausea + s.fatigue + s.breathlessness) / 4;
    if (s.fever || max >= 8 || avg >= 6) return 'severe';
    if (max >= 5 || avg >= 3) return 'moderate';
    return 'mild';
  };

  const severity = calcSeverity(symptoms);

  const severityConfig: Record<string, { emoji: string; bg: string; text: string }> = {
    mild: { emoji: '🟢', bg: 'bg-[hsl(var(--mint))]/10', text: 'text-[hsl(var(--mint))]' },
    moderate: { emoji: '🟡', bg: 'bg-[hsl(var(--coral))]/10', text: 'text-[hsl(var(--coral))]' },
    severe: { emoji: '🔴', bg: 'bg-destructive/10', text: 'text-destructive' },
  };

  const scoreColor = (v: number) => v >= 7 ? 'text-destructive' : v >= 4 ? 'text-[hsl(var(--coral))]' : 'text-[hsl(var(--mint))]';

  const sliders = [
    { key: 'pain' as const, label: 'Abdominal Pain', emoji: '😣' },
    { key: 'nausea' as const, label: 'Nausea', emoji: '🤢' },
    { key: 'fatigue' as const, label: 'Fatigue', emoji: '😴' },
    { key: 'breathlessness' as const, label: 'Shortness of Breath', emoji: '😤' },
  ];

  const logSymptoms = () => {
    const entry: SymptomEntry = { id: Date.now().toString(), timestamp: new Date().toISOString(), symptoms: { ...symptoms }, severity, notes };
    setHistory(prev => [entry, ...prev]);
    setSymptoms({ pain: 0, nausea: 0, fatigue: 0, breathlessness: 0, fever: false, temperature: 0 });
    setNotes('');
    toast({ title: '🩺 Symptoms Logged', description: `${severity.charAt(0).toUpperCase() + severity.slice(1)} severity recorded.`, variant: severity === 'severe' ? 'destructive' : 'default' });
    if (severity === 'severe') toast({ title: '⚠️ High Severity', description: 'Consider contacting your healthcare provider.', variant: 'destructive' });
  };

  const cfg = severityConfig[severity];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-foreground">🩺 Symptom Tracker</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Score & track daily symptoms</p>
      </div>

      {/* Assessment */}
      <Card className="rounded-2xl border-border/30 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold">Current Assessment</CardTitle>
            <Badge className={`text-[10px] px-2.5 py-0.5 border-0 font-semibold ${cfg.bg} ${cfg.text}`}>
              {cfg.emoji} {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {sliders.map(({ key, label, emoji }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-foreground">{emoji} {label}</span>
                <span className={`text-sm font-black ${scoreColor(symptoms[key])}`}>{symptoms[key]}/10</span>
              </div>
              <Slider value={[symptoms[key]]} onValueChange={v => setSymptoms(p => ({ ...p, [key]: v[0] }))} max={10} step={1} className="w-full" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>None</span><span>Severe</span>
              </div>
            </div>
          ))}

          {/* Fever */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
            <input type="checkbox" id="fever" checked={symptoms.fever} onChange={e => setSymptoms(p => ({ ...p, fever: e.target.checked }))} className="w-4 h-4 rounded" />
            <label htmlFor="fever" className="text-xs font-semibold text-foreground flex-1">🌡️ Fever</label>
            {symptoms.fever && (
              <div className="flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-destructive" />
                <input type="number" step="0.1" placeholder="°F" value={symptoms.temperature || ''} onChange={e => setSymptoms(p => ({ ...p, temperature: parseFloat(e.target.value) || 0 }))} className="w-16 p-1.5 text-xs border border-border/50 rounded-lg bg-background" />
              </div>
            )}
          </div>

          <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes…" rows={2} className="rounded-xl text-sm" />

          {/* Recommendation */}
          <div className={`p-3.5 rounded-2xl ${severity === 'severe' ? 'bg-destructive/5 border border-destructive/15' : severity === 'moderate' ? 'bg-[hsl(var(--coral))]/5 border border-[hsl(var(--coral))]/15' : 'bg-[hsl(var(--mint))]/5 border border-[hsl(var(--mint))]/15'}`}>
            <p className="text-xs font-semibold text-foreground mb-0.5">💡 Recommendation</p>
            <p className="text-xs text-muted-foreground">
              {severity === 'severe' ? 'Contact your healthcare provider immediately.' : severity === 'moderate' ? 'Monitor closely. Contact provider if symptoms persist.' : 'Continue normal routine. Log any changes.'}
            </p>
          </div>

          <Button onClick={logSymptoms} className="w-full h-11 rounded-xl text-sm font-semibold">Log Symptoms</Button>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="rounded-2xl border-border/30 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {history.map(entry => {
            const c = severityConfig[entry.severity];
            return (
              <div key={entry.id} className="p-3.5 rounded-xl bg-muted/20 border border-border/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</span>
                  <Badge className={`text-[10px] px-2 py-0 border-0 ${c.bg} ${c.text}`}>{c.emoji} {entry.severity}</Badge>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'Pain', val: entry.symptoms.pain, emoji: '😣' },
                    { label: 'Nausea', val: entry.symptoms.nausea, emoji: '🤢' },
                    { label: 'Fatigue', val: entry.symptoms.fatigue, emoji: '😴' },
                    { label: 'Breath', val: entry.symptoms.breathlessness, emoji: '😤' },
                  ].map(s => (
                    <div key={s.label} className="p-1.5 rounded-lg bg-background/60">
                      <span className="text-sm">{s.emoji}</span>
                      <p className={`text-xs font-bold ${scoreColor(s.val)}`}>{s.val}</p>
                    </div>
                  ))}
                </div>
                {entry.notes && <p className="text-xs text-muted-foreground">{entry.notes}</p>}
              </div>
            );
          })}
          {history.length === 0 && <p className="text-center text-sm text-muted-foreground py-6">No symptom entries yet</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default SymptomTracker;
