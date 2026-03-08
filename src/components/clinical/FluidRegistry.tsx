import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Droplets, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface FluidUsage {
  id: string;
  patient_id: string;
  start_date: string;
  end_date: string | null;
  fluid_type: string;
  glucose_strength: string | null;
  volume_ml: number | null;
  exchanges_per_day: number | null;
  is_current: boolean;
  notes: string | null;
  created_by: string;
  created_at: string;
}

const fluidTypes = [
  { value: 'Dianeal', label: 'Dianeal' },
  { value: 'Physioneal', label: 'Physioneal' },
  { value: 'Extraneal', label: 'Extraneal (Icodextrin)' },
  { value: 'Nutrineal', label: 'Nutrineal' },
  { value: 'Other', label: 'Other' },
];

const glucoseStrengths = ['1.5%', '2.5%', '4.25%'];

const FluidRegistry: React.FC<{ patientId?: string }> = ({ patientId }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [records, setRecords] = useState<FluidUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    start_date: '', fluid_type: '', glucose_strength: '',
    volume_ml: '', exchanges_per_day: '', notes: '',
  });

  const targetPatient = patientId || user?.id;

  useEffect(() => {
    if (!targetPatient) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('pd_fluid_usage')
        .select('*')
        .eq('patient_id', targetPatient)
        .order('start_date', { ascending: false });
      if (!error && data) setRecords(data as unknown as FluidUsage[]);
      setLoading(false);
    };
    load();
  }, [targetPatient]);

  const handleAdd = async () => {
    if (!form.start_date || !form.fluid_type || !user) return;
    const { data, error } = await supabase.from('pd_fluid_usage').insert({
      patient_id: targetPatient!,
      start_date: form.start_date,
      fluid_type: form.fluid_type,
      glucose_strength: form.glucose_strength || null,
      volume_ml: form.volume_ml ? parseInt(form.volume_ml) : null,
      exchanges_per_day: form.exchanges_per_day ? parseInt(form.exchanges_per_day) : null,
      notes: form.notes || null,
      created_by: user.id,
    }).select().single();
    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    } else if (data) {
      setRecords(prev => [data as unknown as FluidUsage, ...prev]);
      setForm({ start_date: '', fluid_type: '', glucose_strength: '', volume_ml: '', exchanges_per_day: '', notes: '' });
      setShowAdd(false);
      toast({ title: '✅', description: t('fluidRecordAdded') });
    }
  };

  const handleEndUsage = async (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('pd_fluid_usage').update({
      end_date: today, is_current: false,
    }).eq('id', id);
    if (!error) {
      setRecords(prev => prev.map(r => r.id === id ? { ...r, end_date: today, is_current: false } : r));
      toast({ title: '✅', description: t('fluidUsageEnded') });
    }
  };

  const fluidColor = (type: string) => {
    switch (type) {
      case 'Dianeal': return 'bg-[hsl(var(--sky))]/15 text-[hsl(var(--sky))]';
      case 'Physioneal': return 'bg-[hsl(var(--mint))]/15 text-[hsl(var(--mint))]';
      case 'Extraneal': return 'bg-[hsl(var(--lavender))]/15 text-[hsl(var(--lavender))]';
      case 'Nutrineal': return 'bg-[hsl(var(--peach))]/15 text-[hsl(var(--peach))]';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground">💧 {t('fluidRegistry')}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t('fluidRegistryDesc')}</p>
        </div>
        <Button size="sm" className="rounded-full gap-1.5" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-3.5 h-3.5" /> {t('add')}
        </Button>
      </div>

      {showAdd && (
        <Card className="rounded-2xl border-primary/30 shadow-md">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('startDate')}</label>
                <Input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className="rounded-xl mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('fluidType')}</label>
                <Select value={form.fluid_type} onValueChange={v => setForm(p => ({ ...p, fluid_type: v }))}>
                  <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder={t('selectFluid')} /></SelectTrigger>
                  <SelectContent>
                    {fluidTypes.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('glucoseStrength')}</label>
                <Select value={form.glucose_strength} onValueChange={v => setForm(p => ({ ...p, glucose_strength: v }))}>
                  <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="%" /></SelectTrigger>
                  <SelectContent>
                    {glucoseStrengths.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('volumeMl')}</label>
                <Input type="number" value={form.volume_ml} onChange={e => setForm(p => ({ ...p, volume_ml: e.target.value }))} className="rounded-xl mt-1" placeholder="ml" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('exchangesDay')}</label>
                <Input type="number" value={form.exchanges_per_day} onChange={e => setForm(p => ({ ...p, exchanges_per_day: e.target.value }))} className="rounded-xl mt-1" placeholder="#" />
              </div>
            </div>

            <Input placeholder={t('notes')} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="rounded-xl" />

            <div className="flex gap-2">
              <Button size="sm" className="rounded-full flex-1" onClick={handleAdd}>{t('save')}</Button>
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => setShowAdd(false)}>{t('cancel')}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <Card className="rounded-2xl border-border/30">
          <CardContent className="p-8 text-center">
            <p className="text-3xl mb-2">💧</p>
            <p className="text-sm text-muted-foreground">{t('noFluidRecords')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {records.map(r => (
            <Card key={r.id} className={`rounded-2xl border-border/30 shadow-sm ${r.is_current ? 'border-primary/20' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Droplets className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[9px] font-bold border-0 ${fluidColor(r.fluid_type)}`}>{r.fluid_type}</Badge>
                        {r.glucose_strength && <Badge variant="outline" className="text-[9px]">{r.glucose_strength}</Badge>}
                        {r.is_current && <Badge className="text-[9px] bg-primary/15 text-primary border-0">{t('current')}</Badge>}
                      </div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(r.start_date), 'MMM d, yyyy')}
                        {r.end_date && ` → ${format(new Date(r.end_date), 'MMM d, yyyy')}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {r.volume_ml && <p className="text-sm font-bold">{r.volume_ml}ml</p>}
                    {r.exchanges_per_day && <p className="text-[10px] text-muted-foreground">{r.exchanges_per_day}x/{t('day')}</p>}
                  </div>
                </div>
                {r.notes && <p className="text-xs text-muted-foreground mt-2">{r.notes}</p>}
                {r.is_current && (
                  <Button size="sm" variant="outline" className="rounded-full text-xs mt-2" onClick={() => handleEndUsage(r.id)}>
                    {t('endUsage')}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FluidRegistry;
