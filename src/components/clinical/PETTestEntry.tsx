import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2, FlaskConical, TrendingUp, Info } from 'lucide-react';

interface PETTestEntryProps {
  patientId: string;
}

interface PETResult {
  id: string;
  test_date: string;
  dp_creatinine_ratio: number | null;
  dp_glucose_ratio: number | null;
  transport_type: string | null;
  drain_volume_4h: number | null;
  infused_volume: number | null;
  created_at: string;
}

const transportClassification = (dpCr: number): { type: string; color: string; description: string } => {
  if (dpCr >= 0.81) return { type: 'High', color: 'bg-destructive/10 text-destructive', description: 'Rapid solute transport — consider APD with short dwells' };
  if (dpCr >= 0.65) return { type: 'High-Average', color: 'bg-amber-500/10 text-amber-600', description: 'Above average transport — standard CAPD or APD' };
  if (dpCr >= 0.50) return { type: 'Low-Average', color: 'bg-primary/10 text-primary', description: 'Below average transport — CAPD with longer dwells preferred' };
  return { type: 'Low', color: 'bg-emerald-500/10 text-emerald-600', description: 'Slow solute transport — long dwell CAPD recommended' };
};

const PETTestEntry: React.FC<PETTestEntryProps> = ({ patientId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<PETResult[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    test_date: new Date().toISOString().split('T')[0],
    dialysate_creatinine_0h: '',
    dialysate_creatinine_2h: '',
    dialysate_creatinine_4h: '',
    plasma_creatinine: '',
    dialysate_glucose_0h: '',
    dialysate_glucose_2h: '',
    dialysate_glucose_4h: '',
    drain_volume_4h: '',
    infused_volume: '2000',
    notes: '',
  });

  const fetchHistory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('pet_results' as any)
      .select('id, test_date, dp_creatinine_ratio, dp_glucose_ratio, transport_type, drain_volume_4h, infused_volume, created_at')
      .eq('patient_id', patientId)
      .order('test_date', { ascending: false })
      .limit(20);
    setHistory((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchHistory(); }, [patientId]);

  const dpCr = form.dialysate_creatinine_4h && form.plasma_creatinine
    ? parseFloat(form.dialysate_creatinine_4h) / parseFloat(form.plasma_creatinine)
    : null;

  const dpGlucose = form.dialysate_glucose_0h && form.dialysate_glucose_4h
    ? parseFloat(form.dialysate_glucose_4h) / parseFloat(form.dialysate_glucose_0h)
    : null;

  const classification = dpCr ? transportClassification(dpCr) : null;

  const handleSave = async () => {
    if (!user || !dpCr) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('pet_results' as any).insert({
        patient_id: patientId,
        test_date: form.test_date,
        dialysate_creatinine_0h: parseFloat(form.dialysate_creatinine_0h) || null,
        dialysate_creatinine_2h: parseFloat(form.dialysate_creatinine_2h) || null,
        dialysate_creatinine_4h: parseFloat(form.dialysate_creatinine_4h) || null,
        plasma_creatinine: parseFloat(form.plasma_creatinine) || null,
        dialysate_glucose_0h: parseFloat(form.dialysate_glucose_0h) || null,
        dialysate_glucose_2h: parseFloat(form.dialysate_glucose_2h) || null,
        dialysate_glucose_4h: parseFloat(form.dialysate_glucose_4h) || null,
        dp_creatinine_ratio: Math.round(dpCr * 1000) / 1000,
        dp_glucose_ratio: dpGlucose ? Math.round(dpGlucose * 1000) / 1000 : null,
        transport_type: classification?.type || null,
        drain_volume_4h: parseFloat(form.drain_volume_4h) || null,
        infused_volume: parseFloat(form.infused_volume) || 2000,
        notes: form.notes || null,
        created_by: user.id,
      } as any);
      if (error) throw error;
      toast({ title: 'PET result saved', description: `Transport type: ${classification?.type}` });
      setShowForm(false);
      setForm({
        test_date: new Date().toISOString().split('T')[0],
        dialysate_creatinine_0h: '', dialysate_creatinine_2h: '', dialysate_creatinine_4h: '',
        plasma_creatinine: '', dialysate_glucose_0h: '', dialysate_glucose_2h: '',
        dialysate_glucose_4h: '', drain_volume_4h: '', infused_volume: '2000', notes: '',
      });
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
          <FlaskConical className="w-5 h-5 text-primary" />
          <h3 className="text-base font-bold">PET Test Results</h3>
        </div>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)} className="rounded-xl gap-1.5">
            <Plus className="w-3.5 h-3.5" /> New PET
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="rounded-2xl border-primary/20 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">New PET Test Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Test Date</Label>
              <Input type="date" value={form.test_date} onChange={e => update('test_date', e.target.value)} className="rounded-xl" />
            </div>

            <div className="p-3 rounded-xl bg-muted/50 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Creatinine Values (mg/dL)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Dialysate 0h</Label>
                  <Input type="number" step="0.1" placeholder="0h" value={form.dialysate_creatinine_0h} onChange={e => update('dialysate_creatinine_0h', e.target.value)} className="rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs">Dialysate 2h</Label>
                  <Input type="number" step="0.1" placeholder="2h" value={form.dialysate_creatinine_2h} onChange={e => update('dialysate_creatinine_2h', e.target.value)} className="rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs">Dialysate 4h</Label>
                  <Input type="number" step="0.1" placeholder="4h" value={form.dialysate_creatinine_4h} onChange={e => update('dialysate_creatinine_4h', e.target.value)} className="rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs">Plasma Creatinine</Label>
                  <Input type="number" step="0.1" placeholder="Plasma" value={form.plasma_creatinine} onChange={e => update('plasma_creatinine', e.target.value)} className="rounded-xl" />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/50 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Glucose Values (mg/dL)</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Dialysate 0h</Label>
                  <Input type="number" step="1" placeholder="0h" value={form.dialysate_glucose_0h} onChange={e => update('dialysate_glucose_0h', e.target.value)} className="rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs">Dialysate 2h</Label>
                  <Input type="number" step="1" placeholder="2h" value={form.dialysate_glucose_2h} onChange={e => update('dialysate_glucose_2h', e.target.value)} className="rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs">Dialysate 4h</Label>
                  <Input type="number" step="1" placeholder="4h" value={form.dialysate_glucose_4h} onChange={e => update('dialysate_glucose_4h', e.target.value)} className="rounded-xl" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Drain Volume 4h (ml)</Label>
                <Input type="number" step="10" placeholder="e.g. 2200" value={form.drain_volume_4h} onChange={e => update('drain_volume_4h', e.target.value)} className="rounded-xl" />
              </div>
              <div>
                <Label className="text-xs">Infused Volume (ml)</Label>
                <Input type="number" step="10" value={form.infused_volume} onChange={e => update('infused_volume', e.target.value)} className="rounded-xl" />
              </div>
            </div>

            {/* Live calculation */}
            {dpCr !== null && classification && (
              <div className={`p-4 rounded-2xl ${classification.color} border border-border/30`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold">D/P Creatinine Ratio</p>
                  <Badge className={classification.color}>{classification.type} Transporter</Badge>
                </div>
                <p className="text-2xl font-bold">{dpCr.toFixed(3)}</p>
                {dpGlucose !== null && (
                  <p className="text-xs mt-1">D/D₀ Glucose: {dpGlucose.toFixed(3)}</p>
                )}
                <div className="flex items-start gap-1.5 mt-2">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <p className="text-xs">{classification.description}</p>
                </div>
              </div>
            )}

            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea placeholder="Additional observations..." value={form.notes} onChange={e => update('notes', e.target.value)} className="rounded-xl" rows={2} />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving || !dpCr} className="rounded-xl flex-1">
                {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                Save PET Result
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
            <FlaskConical className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No PET test results yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map(r => {
            const cls = r.dp_creatinine_ratio ? transportClassification(r.dp_creatinine_ratio) : null;
            return (
              <Card key={r.id} className="rounded-2xl border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">{new Date(r.test_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    {cls && <Badge className={cls.color}>{cls.type}</Badge>}
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">D/P Cr</p>
                      <p className="text-lg font-bold">{r.dp_creatinine_ratio?.toFixed(3) || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">D/D₀ Glu</p>
                      <p className="text-lg font-bold">{r.dp_glucose_ratio?.toFixed(3) || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Drain 4h</p>
                      <p className="text-lg font-bold">{r.drain_volume_4h ? `${r.drain_volume_4h}ml` : '—'}</p>
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

export default PETTestEntry;
