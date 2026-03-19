import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Thermometer, Loader2, Droplets } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UnifiedSymptomEntry {
  id: string;
  timestamp: string;
  source: 'exchange' | 'standalone';
  pain: number;
  nausea: number;
  fatigue: number;
  breathlessness: number;
  fever: boolean;
  temperature?: number;
  severity: 'mild' | 'moderate' | 'severe';
  notes: string;
  // Exchange-specific
  exchangeType?: string;
  symptoms?: string[];
}

const SymptomTracker: React.FC = () => {
  const { toast } = useToast();
  const { user, activeRole } = useAuth();
  const [form, setForm] = useState({ pain: 0, nausea: 0, fatigue: 0, breathlessness: 0, fever: false, temperature: 0 });
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState<UnifiedSymptomEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const targetPatient = useMemo(() => {
    if (!user) return null;
    if (activeRole === 'patient') return user.id;
    const ctx = (user as any).viewingPatientId;
    return ctx || user.id;
  }, [user, activeRole]);

  const calcSeverity = (s: { pain: number; nausea: number; fatigue: number; breathlessness: number; fever: boolean }): 'mild' | 'moderate' | 'severe' => {
    const max = Math.max(s.pain, s.nausea, s.fatigue, s.breathlessness);
    const avg = (s.pain + s.nausea + s.fatigue + s.breathlessness) / 4;
    if (s.fever || max >= 8 || avg >= 6) return 'severe';
    if (max >= 5 || avg >= 3) return 'moderate';
    return 'mild';
  };

  // Load from both exchange_logs and symptom_reports
  useEffect(() => {
    if (!targetPatient) return;
    const load = async () => {
      setLoading(true);
      const [exchangeRes, reportRes] = await Promise.all([
        supabase
          .from('exchange_logs')
          .select('id, created_at, exchange_type, pain_level, symptoms, temperature, notes')
          .eq('patient_id', targetPatient)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('symptom_reports')
          .select('*')
          .eq('patient_id', targetPatient)
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      const entries: UnifiedSymptomEntry[] = [];

      // Map exchange logs — only include those with symptoms or pain > 0
      if (exchangeRes.data) {
        for (const ex of exchangeRes.data) {
          const hasPain = (ex.pain_level || 0) > 0;
          const hasSymptoms = ex.symptoms && ex.symptoms.length > 0;
          if (!hasPain && !hasSymptoms) continue;

          const symptomList = ex.symptoms || [];
          const hasNausea = symptomList.includes('nausea');
          const hasFever = symptomList.includes('fever');

          const mapped: UnifiedSymptomEntry = {
            id: ex.id,
            timestamp: ex.created_at,
            source: 'exchange',
            pain: ex.pain_level || 0,
            nausea: hasNausea ? 5 : 0,
            fatigue: 0,
            breathlessness: 0,
            fever: hasFever,
            temperature: ex.temperature ? Number(ex.temperature) : undefined,
            severity: 'mild',
            notes: ex.notes || '',
            exchangeType: ex.exchange_type,
            symptoms: symptomList,
          };
          mapped.severity = calcSeverity(mapped);
          entries.push(mapped);
        }
      }

      // Map standalone symptom_reports
      if (reportRes.data) {
        for (const r of reportRes.data) {
          const symptomList = r.symptoms || [];
          entries.push({
            id: r.id,
            timestamp: r.created_at,
            source: 'standalone',
            pain: symptomList.includes('abdominal_pain') ? 5 : 0,
            nausea: symptomList.includes('nausea') ? 5 : 0,
            fatigue: symptomList.includes('fatigue') ? 5 : 0,
            breathlessness: symptomList.includes('breathlessness') ? 5 : 0,
            fever: symptomList.includes('fever'),
            severity: r.severity as 'mild' | 'moderate' | 'severe',
            notes: r.notes || '',
            symptoms: symptomList,
          });
        }
      }

      // Sort by timestamp desc
      entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setHistory(entries);
      setLoading(false);
    };
    load();
  }, [targetPatient]);

  const severity = calcSeverity(form);

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

  const logSymptoms = async () => {
    if (!targetPatient) return;
    setSaving(true);

    // Build symptoms array for symptom_reports
    const symptomTags: string[] = [];
    if (form.pain > 0) symptomTags.push('abdominal_pain');
    if (form.nausea > 0) symptomTags.push('nausea');
    if (form.fatigue > 0) symptomTags.push('fatigue');
    if (form.breathlessness > 0) symptomTags.push('breathlessness');
    if (form.fever) symptomTags.push('fever');

    const { data, error } = await supabase.from('symptom_reports').insert({
      patient_id: targetPatient,
      symptoms: symptomTags,
      severity,
      notes: notes || null,
      status: severity === 'severe' ? 'urgent' : 'new',
    }).select().single();

    setSaving(false);

    if (error) {
      toast({ title: '❌ Save Failed', description: error.message, variant: 'destructive' });
      return;
    }

    // Add to local history
    const entry: UnifiedSymptomEntry = {
      id: data.id,
      timestamp: data.created_at,
      source: 'standalone',
      ...form,
      severity,
      notes,
      symptoms: symptomTags,
    };
    setHistory(prev => [entry, ...prev]);
    setForm({ pain: 0, nausea: 0, fatigue: 0, breathlessness: 0, fever: false, temperature: 0 });
    setNotes('');
    toast({ title: '🩺 Symptoms Logged', description: `${severity.charAt(0).toUpperCase() + severity.slice(1)} severity recorded.`, variant: severity === 'severe' ? 'destructive' : 'default' });
    if (severity === 'severe') toast({ title: '⚠️ High Severity Alert', description: 'Your care team has been notified.', variant: 'destructive' });
  };

  const cfg = severityConfig[severity];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-foreground">🩺 Symptom Tracker</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Tracks symptoms from exchanges + standalone reports</p>
      </div>

      {/* New Standalone Entry */}
      <Card className="rounded-2xl border-border/30 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold">Log New Symptoms</CardTitle>
            <Badge className={`text-[10px] px-2.5 py-0.5 border-0 font-semibold ${cfg.bg} ${cfg.text}`}>
              {cfg.emoji} {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">For symptoms between exchanges. Exchange symptoms are imported automatically.</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {sliders.map(({ key, label, emoji }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-foreground">{emoji} {label}</span>
                <span className={`text-sm font-black ${scoreColor(form[key])}`}>{form[key]}/10</span>
              </div>
              <Slider value={[form[key]]} onValueChange={v => setForm(p => ({ ...p, [key]: v[0] }))} max={10} step={1} className="w-full" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>None</span><span>Severe</span>
              </div>
            </div>
          ))}

          {/* Fever */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
            <input type="checkbox" id="fever" checked={form.fever} onChange={e => setForm(p => ({ ...p, fever: e.target.checked }))} className="w-4 h-4 rounded" />
            <label htmlFor="fever" className="text-xs font-semibold text-foreground flex-1">🌡️ Fever</label>
            {form.fever && (
              <div className="flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-destructive" />
                <input type="number" step="0.1" placeholder="°F" value={form.temperature || ''} onChange={e => setForm(p => ({ ...p, temperature: parseFloat(e.target.value) || 0 }))} className="w-16 p-1.5 text-xs border border-border/50 rounded-lg bg-background" />
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

          <Button onClick={logSymptoms} disabled={saving} className="w-full h-11 rounded-xl text-sm font-semibold">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {saving ? 'Saving…' : 'Log Symptoms'}
          </Button>
        </CardContent>
      </Card>

      {/* Unified History */}
      <Card className="rounded-2xl border-border/30 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">Symptom History</CardTitle>
          <p className="text-[10px] text-muted-foreground">Combined from exchanges and standalone reports</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">No symptom entries yet</p>
          ) : (
            history.map(entry => {
              const c = severityConfig[entry.severity];
              return (
                <div key={entry.id} className="p-3.5 rounded-xl bg-muted/20 border border-border/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</span>
                      {entry.source === 'exchange' ? (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 gap-1 border-primary/30 text-primary">
                          <Droplets className="w-2.5 h-2.5" /> Exchange
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-muted-foreground/30">
                          Standalone
                        </Badge>
                      )}
                    </div>
                    <Badge className={`text-[10px] px-2 py-0 border-0 ${c.bg} ${c.text}`}>{c.emoji} {entry.severity}</Badge>
                  </div>

                  {/* Scores grid — show if we have slider data */}
                  {(entry.pain > 0 || entry.nausea > 0 || entry.fatigue > 0 || entry.breathlessness > 0) && (
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { label: 'Pain', val: entry.pain, emoji: '😣' },
                        { label: 'Nausea', val: entry.nausea, emoji: '🤢' },
                        { label: 'Fatigue', val: entry.fatigue, emoji: '😴' },
                        { label: 'Breath', val: entry.breathlessness, emoji: '😤' },
                      ].map(s => (
                        <div key={s.label} className="p-1.5 rounded-lg bg-background/60">
                          <span className="text-sm">{s.emoji}</span>
                          <p className={`text-xs font-bold ${scoreColor(s.val)}`}>{s.val}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Symptom tags from exchange */}
                  {entry.symptoms && entry.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.symptoms.map(s => (
                        <Badge key={s} variant="secondary" className="text-[9px] px-1.5 py-0">
                          {s.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {entry.fever && (
                    <div className="flex items-center gap-1.5 text-xs text-destructive">
                      <Thermometer className="w-3 h-3" />
                      Fever {entry.temperature ? `(${entry.temperature}°F)` : ''}
                    </div>
                  )}

                  {entry.notes && <p className="text-xs text-muted-foreground">{entry.notes}</p>}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SymptomTracker;
