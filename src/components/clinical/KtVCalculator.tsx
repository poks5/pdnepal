import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2, Calculator, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

interface KtVCalculatorProps {
  patientId: string;
}

interface AdequacyResult {
  id: string;
  test_date: string;
  weekly_kt_v: number | null;
  weekly_creatinine_clearance: number | null;
  residual_renal_kt_v: number | null;
  peritoneal_kt_v: number | null;
  total_body_water: number | null;
  assessment: string | null;
  created_at: string;
}

// Watson formula for Total Body Water (TBW)
const watsonTBW = (gender: string, heightCm: number, weightKg: number, ageYears: number): number => {
  if (gender === 'male') {
    return 2.447 - (0.09156 * ageYears) + (0.1074 * heightCm) + (0.3362 * weightKg);
  }
  return -2.097 + (0.1069 * heightCm) + (0.2466 * weightKg);
};

const assessKtV = (ktv: number): { label: string; color: string; icon: typeof CheckCircle2 } => {
  if (ktv >= 1.7) return { label: 'Adequate', color: 'bg-emerald-500/10 text-emerald-600', icon: CheckCircle2 };
  if (ktv >= 1.5) return { label: 'Borderline', color: 'bg-amber-500/10 text-amber-600', icon: AlertTriangle };
  return { label: 'Inadequate', color: 'bg-destructive/10 text-destructive', icon: AlertTriangle };
};

const KtVCalculator: React.FC<KtVCalculatorProps> = ({ patientId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<AdequacyResult[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    test_date: new Date().toISOString().split('T')[0],
    gender: '',
    height_cm: '',
    weight_kg: '',
    age_years: '',
    daily_urine_volume: '0',
    urine_creatinine: '',
    urine_urea: '',
    serum_creatinine: '',
    serum_urea: '',
    dialysate_creatinine: '',
    dialysate_urea: '',
    dialysate_volume_24h: '',
    notes: '',
  });

  const fetchHistory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('adequacy_calculations' as any)
      .select('id, test_date, weekly_kt_v, weekly_creatinine_clearance, residual_renal_kt_v, peritoneal_kt_v, total_body_water, assessment, created_at')
      .eq('patient_id', patientId)
      .order('test_date', { ascending: false })
      .limit(20);
    setHistory((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchHistory(); }, [patientId]);

  // Computed values
  const canCalculate = form.gender && form.height_cm && form.weight_kg && form.age_years &&
    form.serum_urea && form.dialysate_urea && form.dialysate_volume_24h;

  const computed = (() => {
    if (!canCalculate) return null;
    const heightCm = parseFloat(form.height_cm);
    const weightKg = parseFloat(form.weight_kg);
    const ageYears = parseInt(form.age_years);
    const tbw = watsonTBW(form.gender, heightCm, weightKg, ageYears);
    const V = tbw; // liters

    const serumUrea = parseFloat(form.serum_urea);
    const dialysateUrea = parseFloat(form.dialysate_urea);
    const dialysateVol24h = parseFloat(form.dialysate_volume_24h) / 1000; // convert ml to L
    const urineVol = parseFloat(form.daily_urine_volume || '0') / 1000; // ml to L
    const urineUrea = parseFloat(form.urine_urea || '0');

    // Peritoneal Kt/V (daily) = (Dialysate Urea / Serum Urea) × Dialysate Volume / V
    const peritonealKtVDaily = (dialysateUrea / serumUrea) * dialysateVol24h / V;

    // Renal Kt/V (daily) = (Urine Urea / Serum Urea) × Urine Volume / V
    const renalKtVDaily = urineVol > 0 && urineUrea > 0
      ? (urineUrea / serumUrea) * urineVol / V
      : 0;

    const weeklyKtV = (peritonealKtVDaily + renalKtVDaily) * 7;

    // Creatinine clearance (L/week/1.73m²)
    const serumCr = parseFloat(form.serum_creatinine || '0');
    const dialysateCr = parseFloat(form.dialysate_creatinine || '0');
    const urineCr = parseFloat(form.urine_creatinine || '0');
    const bsa = 0.007184 * Math.pow(heightCm, 0.725) * Math.pow(weightKg, 0.425); // DuBois formula

    let weeklyCrCl = 0;
    if (serumCr > 0) {
      const peritonealCrCl = (dialysateCr / serumCr) * dialysateVol24h * 7;
      const renalCrCl = urineCr > 0 && urineVol > 0 ? (urineCr / serumCr) * urineVol * 7 : 0;
      weeklyCrCl = ((peritonealCrCl + renalCrCl) / bsa) * 1.73;
    }

    const assessment = assessKtV(weeklyKtV);

    return {
      tbw: Math.round(tbw * 10) / 10,
      peritonealKtV: Math.round(peritonealKtVDaily * 7 * 1000) / 1000,
      renalKtV: Math.round(renalKtVDaily * 7 * 1000) / 1000,
      weeklyKtV: Math.round(weeklyKtV * 1000) / 1000,
      weeklyCrCl: Math.round(weeklyCrCl * 10) / 10,
      assessment,
    };
  })();

  const handleSave = async () => {
    if (!user || !computed) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('adequacy_calculations' as any).insert({
        patient_id: patientId,
        test_date: form.test_date,
        gender: form.gender,
        height_cm: parseFloat(form.height_cm),
        weight_kg: parseFloat(form.weight_kg),
        age_years: parseInt(form.age_years),
        total_body_water: computed.tbw,
        daily_urine_volume: parseFloat(form.daily_urine_volume || '0'),
        urine_creatinine: parseFloat(form.urine_creatinine) || null,
        urine_urea: parseFloat(form.urine_urea) || null,
        serum_creatinine: parseFloat(form.serum_creatinine) || null,
        serum_urea: parseFloat(form.serum_urea),
        dialysate_creatinine: parseFloat(form.dialysate_creatinine) || null,
        dialysate_urea: parseFloat(form.dialysate_urea),
        dialysate_volume_24h: parseFloat(form.dialysate_volume_24h),
        weekly_kt_v: computed.weeklyKtV,
        weekly_creatinine_clearance: computed.weeklyCrCl,
        residual_renal_kt_v: computed.renalKtV,
        peritoneal_kt_v: computed.peritonealKtV,
        assessment: computed.assessment.label.toLowerCase(),
        notes: form.notes || null,
        created_by: user.id,
      } as any);
      if (error) throw error;
      toast({ title: 'Kt/V saved', description: `Weekly Kt/V: ${computed.weeklyKtV} — ${computed.assessment.label}` });
      setShowForm(false);
      fetchHistory();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          <h3 className="text-base font-bold">Kt/V & Adequacy</h3>
        </div>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)} className="rounded-xl gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Calculate
          </Button>
        )}
      </div>

      {/* ISPD targets reference */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/50 border border-border/30">
        <Info className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
        <div className="text-xs text-muted-foreground">
          <p className="font-semibold mb-1">ISPD 2020 Targets</p>
          <p>Weekly Kt/V ≥ 1.7 · Weekly CrCl ≥ 50 L/wk/1.73m²</p>
        </div>
      </div>

      {showForm && (
        <Card className="rounded-2xl border-primary/20 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">Kt/V Calculation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Test Date</Label>
                <Input type="date" value={form.test_date} onChange={e => update('test_date', e.target.value)} className="rounded-xl" />
              </div>
              <div>
                <Label className="text-xs">Gender</Label>
                <Select value={form.gender} onValueChange={v => update('gender', v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/50 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient Anthropometrics</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Height (cm)</Label>
                  <Input type="number" step="1" placeholder="165" value={form.height_cm} onChange={e => update('height_cm', e.target.value)} className="rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs">Weight (kg)</Label>
                  <Input type="number" step="0.1" placeholder="65" value={form.weight_kg} onChange={e => update('weight_kg', e.target.value)} className="rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs">Age (years)</Label>
                  <Input type="number" step="1" placeholder="55" value={form.age_years} onChange={e => update('age_years', e.target.value)} className="rounded-xl" />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/50 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Serum Values</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Serum Creatinine (mg/dL)</Label>
                  <Input type="number" step="0.1" value={form.serum_creatinine} onChange={e => update('serum_creatinine', e.target.value)} className="rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs">Serum Urea/BUN (mg/dL)</Label>
                  <Input type="number" step="0.1" value={form.serum_urea} onChange={e => update('serum_urea', e.target.value)} className="rounded-xl" />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/50 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">24h Dialysate Collection</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Volume (ml)</Label>
                  <Input type="number" step="100" placeholder="8000" value={form.dialysate_volume_24h} onChange={e => update('dialysate_volume_24h', e.target.value)} className="rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs">Dialysate Cr (mg/dL)</Label>
                  <Input type="number" step="0.1" value={form.dialysate_creatinine} onChange={e => update('dialysate_creatinine', e.target.value)} className="rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs">Dialysate Urea (mg/dL)</Label>
                  <Input type="number" step="0.1" value={form.dialysate_urea} onChange={e => update('dialysate_urea', e.target.value)} className="rounded-xl" />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/50 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">24h Urine Collection (if any)</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Volume (ml)</Label>
                  <Input type="number" step="10" placeholder="0" value={form.daily_urine_volume} onChange={e => update('daily_urine_volume', e.target.value)} className="rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs">Urine Cr (mg/dL)</Label>
                  <Input type="number" step="0.1" value={form.urine_creatinine} onChange={e => update('urine_creatinine', e.target.value)} className="rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs">Urine Urea (mg/dL)</Label>
                  <Input type="number" step="0.1" value={form.urine_urea} onChange={e => update('urine_urea', e.target.value)} className="rounded-xl" />
                </div>
              </div>
            </div>

            {/* Live calculation result */}
            {computed && (
              <div className={`p-4 rounded-2xl ${computed.assessment.color} border border-border/30`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold">Calculated Results</p>
                  <Badge className={computed.assessment.color}>
                    <computed.assessment.icon className="w-3 h-3 mr-1" />
                    {computed.assessment.label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">TBW (Watson)</p>
                    <p className="text-lg font-bold">{computed.tbw}L</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Weekly Kt/V</p>
                    <p className="text-lg font-bold">{computed.weeklyKtV}</p>
                    <p className="text-[10px] text-muted-foreground">Target ≥1.7</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Peritoneal</p>
                    <p className="text-lg font-bold">{computed.peritonealKtV}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Residual Renal</p>
                    <p className="text-lg font-bold">{computed.renalKtV}</p>
                  </div>
                </div>
                {computed.weeklyCrCl > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/30 text-center">
                    <p className="text-xs text-muted-foreground">Weekly Creatinine Clearance</p>
                    <p className="text-lg font-bold">{computed.weeklyCrCl} L/wk/1.73m²</p>
                    <p className="text-[10px] text-muted-foreground">Target ≥50</p>
                  </div>
                )}
              </div>
            )}

            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea placeholder="Clinical notes..." value={form.notes} onChange={e => update('notes', e.target.value)} className="rounded-xl" rows={2} />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving || !computed} className="rounded-xl flex-1">
                {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                Save Calculation
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : history.length === 0 ? (
        <Card className="rounded-2xl border-border/50">
          <CardContent className="py-8 text-center">
            <Calculator className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No adequacy calculations yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map(r => {
            const assessment = r.weekly_kt_v ? assessKtV(r.weekly_kt_v) : null;
            return (
              <Card key={r.id} className="rounded-2xl border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">{new Date(r.test_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    {assessment && <Badge className={assessment.color}>{assessment.label}</Badge>}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Kt/V</p>
                      <p className="text-lg font-bold">{r.weekly_kt_v?.toFixed(2) || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">CrCl</p>
                      <p className="text-lg font-bold">{r.weekly_creatinine_clearance?.toFixed(1) || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">PD Kt/V</p>
                      <p className="text-lg font-bold">{r.peritoneal_kt_v?.toFixed(2) || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">RRF Kt/V</p>
                      <p className="text-lg font-bold">{r.residual_renal_kt_v?.toFixed(2) || '—'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KtVCalculator;
