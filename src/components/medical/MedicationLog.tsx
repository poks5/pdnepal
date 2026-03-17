import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, X, Pill, Loader2 } from 'lucide-react';

interface MedicationEntry {
  id: string;
  drug_name: string;
  dose: string | null;
  route: string;
  reason: string | null;
  taken_at: string;
  created_at: string;
}

const ROUTES = ['IP', 'IV', 'oral', 'topical'];

const COMMON_DRUGS = [
  'Cefazolin', 'Ceftazidime', 'Vancomycin', 'Gentamicin', 'Amikacin',
  'Fluconazole', 'Ciprofloxacin', 'Heparin', 'Calcium Carbonate',
  'Sevelamer', 'EPO', 'Iron Sucrose',
];

const MedicationLog: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [entries, setEntries] = useState<MedicationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ drug_name: '', dose: '', route: 'oral', reason: '' });

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('medication_logs')
      .select('*')
      .eq('patient_id', user.id)
      .order('taken_at', { ascending: false })
      .limit(50);
    setEntries((data as MedicationEntry[] | null) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleSave = async () => {
    if (!user || !form.drug_name.trim()) {
      toast({ title: 'Error', description: 'Drug name is required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('medication_logs').insert({
      patient_id: user.id,
      drug_name: form.drug_name,
      dose: form.dose || null,
      route: form.route,
      reason: form.reason || null,
      taken_at: new Date().toISOString(),
    } as any);
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '💊 Medication Logged' });
      setForm({ drug_name: '', dose: '', route: 'oral', reason: '' });
      setShowForm(false);
      fetchEntries();
    }
  };

  const getRouteColor = (route: string) => {
    switch (route) {
      case 'IP': return 'bg-primary/10 text-primary';
      case 'IV': return 'bg-destructive/10 text-destructive';
      case 'oral': return 'bg-[hsl(var(--mint))]/10 text-[hsl(var(--mint))]';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground">💊 Medication Log</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Track medications & additives</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)} className="rounded-full gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Log Medication
        </Button>
      </div>

      {showForm && (
        <Card className="rounded-2xl border-border/30 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Log Medication / Additive</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Drug Name *</Label>
                <Select value={form.drug_name} onValueChange={(v) => setForm(p => ({ ...p, drug_name: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select drug" /></SelectTrigger>
                  <SelectContent>
                    {COMMON_DRUGS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Dose</Label>
                <Input value={form.dose} onChange={e => setForm(p => ({ ...p, dose: e.target.value }))} placeholder="e.g. 1g" className="mt-1 h-10 rounded-xl text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Route</Label>
                <Select value={form.route} onValueChange={(v) => setForm(p => ({ ...p, route: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROUTES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Reason</Label>
                <Input value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="e.g. peritonitis" className="mt-1 h-10 rounded-xl text-sm" />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl h-10 text-sm font-semibold">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Pill className="w-4 h-4 mr-2" />}
              {saving ? 'Saving...' : 'Log Medication'}
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : entries.length === 0 ? (
        <Card className="rounded-2xl border-border/30"><CardContent className="py-8 text-center text-muted-foreground text-sm">No medications logged yet.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {entries.map(entry => (
            <Card key={entry.id} className="rounded-2xl border-border/30 shadow-sm">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Pill className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-foreground">{entry.drug_name}</p>
                    <Badge className={`text-[10px] px-1.5 py-0 border-0 font-semibold ${getRouteColor(entry.route)}`}>
                      {entry.route}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {entry.dose && `${entry.dose} · `}
                    {new Date(entry.taken_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {entry.reason && ` · ${entry.reason}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicationLog;
