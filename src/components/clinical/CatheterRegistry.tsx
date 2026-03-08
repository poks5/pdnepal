import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, ChevronDown, ChevronUp, Calendar, Wrench } from 'lucide-react';
import { format } from 'date-fns';

interface Catheter {
  id: string;
  patient_id: string;
  insertion_date: string;
  surgeon: string | null;
  insertion_technique: string | null;
  catheter_type: string | null;
  catheter_brand: string | null;
  exit_site_orientation: string | null;
  omentopexy: boolean;
  first_use_date: string | null;
  removal_date: string | null;
  reason_for_removal: string | null;
  is_current: boolean;
  notes: string | null;
  created_by: string;
  created_at: string;
}

const techniqueOptions = [
  { value: 'laparoscopic', label: 'Laparoscopic' },
  { value: 'open', label: 'Open Surgical' },
  { value: 'percutaneous', label: 'Percutaneous' },
];

const typeOptions = [
  { value: 'coiled_tenckhoff', label: 'Coiled Tenckhoff' },
  { value: 'straight_tenckhoff', label: 'Straight Tenckhoff' },
  { value: 'swan_neck', label: 'Swan Neck' },
  { value: 'other', label: 'Other' },
];

const orientationOptions = [
  { value: 'downward', label: 'Downward' },
  { value: 'lateral', label: 'Lateral' },
  { value: 'upward', label: 'Upward' },
];

const CatheterRegistry: React.FC<{ patientId?: string }> = ({ patientId }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [catheters, setCatheters] = useState<Catheter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    insertion_date: '', surgeon: '', insertion_technique: '', catheter_type: '',
    catheter_brand: '', exit_site_orientation: '', omentopexy: false,
    first_use_date: '', notes: '',
  });

  const targetPatient = patientId || user?.id;

  useEffect(() => {
    if (!targetPatient) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('pd_catheters')
        .select('*')
        .eq('patient_id', targetPatient)
        .order('insertion_date', { ascending: false });
      if (!error && data) setCatheters(data as unknown as Catheter[]);
      setLoading(false);
    };
    load();
  }, [targetPatient]);

  const handleAdd = async () => {
    if (!form.insertion_date || !user) return;
    const { data, error } = await supabase.from('pd_catheters').insert({
      patient_id: targetPatient!,
      insertion_date: form.insertion_date,
      surgeon: form.surgeon || null,
      insertion_technique: form.insertion_technique || null,
      catheter_type: form.catheter_type || null,
      catheter_brand: form.catheter_brand || null,
      exit_site_orientation: form.exit_site_orientation || null,
      omentopexy: form.omentopexy,
      first_use_date: form.first_use_date || null,
      notes: form.notes || null,
      created_by: user.id,
    }).select().single();
    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    } else if (data) {
      setCatheters(prev => [data as unknown as Catheter, ...prev]);
      setForm({ insertion_date: '', surgeon: '', insertion_technique: '', catheter_type: '', catheter_brand: '', exit_site_orientation: '', omentopexy: false, first_use_date: '', notes: '' });
      setShowAdd(false);
      toast({ title: '✅', description: t('catheterAdded') });
    }
  };

  const handleRemoval = async (id: string, removal_date: string, reason: string) => {
    const { error } = await supabase.from('pd_catheters').update({
      removal_date, reason_for_removal: reason, is_current: false,
    }).eq('id', id);
    if (!error) {
      setCatheters(prev => prev.map(c => c.id === id ? { ...c, removal_date, reason_for_removal: reason, is_current: false } : c));
      toast({ title: '✅', description: t('catheterRemovalRecorded') });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground">🔧 {t('catheterRegistry')}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t('catheterRegistryDesc')}</p>
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
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('insertionDate')}</label>
                <Input type="date" value={form.insertion_date} onChange={e => setForm(p => ({ ...p, insertion_date: e.target.value }))} className="rounded-xl mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('surgeon')}</label>
                <Input value={form.surgeon} onChange={e => setForm(p => ({ ...p, surgeon: e.target.value }))} className="rounded-xl mt-1" placeholder={t('surgeon')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('insertionTechnique')}</label>
                <Select value={form.insertion_technique} onValueChange={v => setForm(p => ({ ...p, insertion_technique: v }))}>
                  <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder={t('selectTechnique')} /></SelectTrigger>
                  <SelectContent>
                    {techniqueOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('catheterType')}</label>
                <Select value={form.catheter_type} onValueChange={v => setForm(p => ({ ...p, catheter_type: v }))}>
                  <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder={t('selectType')} /></SelectTrigger>
                  <SelectContent>
                    {typeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('exitSiteOrientation')}</label>
                <Select value={form.exit_site_orientation} onValueChange={v => setForm(p => ({ ...p, exit_site_orientation: v }))}>
                  <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder={t('selectOrientation')} /></SelectTrigger>
                  <SelectContent>
                    {orientationOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('catheterBrand')}</label>
                <Input value={form.catheter_brand} onChange={e => setForm(p => ({ ...p, catheter_brand: e.target.value }))} className="rounded-xl mt-1" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.omentopexy} onCheckedChange={v => setForm(p => ({ ...p, omentopexy: v }))} />
              <label className="text-xs font-medium">{t('omentopexy')}</label>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('firstUseDate')}</label>
              <Input type="date" value={form.first_use_date} onChange={e => setForm(p => ({ ...p, first_use_date: e.target.value }))} className="rounded-xl mt-1" />
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
      ) : catheters.length === 0 ? (
        <Card className="rounded-2xl border-border/30">
          <CardContent className="p-8 text-center">
            <p className="text-3xl mb-2">🔧</p>
            <p className="text-sm text-muted-foreground">{t('noCathetersYet')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {catheters.map(c => (
            <Card key={c.id} className={`rounded-2xl border-border/30 shadow-sm ${c.is_current ? 'border-primary/30' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold">{c.catheter_type?.replace(/_/g, ' ') || t('catheter')}</p>
                        {c.is_current && <Badge className="text-[9px] bg-primary/15 text-primary border-0">{t('current')}</Badge>}
                        {!c.is_current && <Badge variant="outline" className="text-[9px]">{t('removed')}</Badge>}
                      </div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {t('inserted')}: {format(new Date(c.insertion_date), 'MMM d, yyyy')}
                        {c.removal_date && ` → ${t('removed')}: ${format(new Date(c.removal_date), 'MMM d, yyyy')}`}
                      </p>
                    </div>
                  </div>
                  {expandedId === c.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>

                {expandedId === c.id && (
                  <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {c.surgeon && <div><span className="text-muted-foreground">{t('surgeon')}:</span> <span className="font-medium">{c.surgeon}</span></div>}
                      {c.insertion_technique && <div><span className="text-muted-foreground">{t('insertionTechnique')}:</span> <span className="font-medium capitalize">{c.insertion_technique}</span></div>}
                      {c.catheter_brand && <div><span className="text-muted-foreground">{t('catheterBrand')}:</span> <span className="font-medium">{c.catheter_brand}</span></div>}
                      {c.exit_site_orientation && <div><span className="text-muted-foreground">{t('exitSiteOrientation')}:</span> <span className="font-medium capitalize">{c.exit_site_orientation}</span></div>}
                      <div><span className="text-muted-foreground">{t('omentopexy')}:</span> <span className="font-medium">{c.omentopexy ? t('yes') : t('no')}</span></div>
                      {c.first_use_date && <div><span className="text-muted-foreground">{t('firstUseDate')}:</span> <span className="font-medium">{format(new Date(c.first_use_date), 'MMM d, yyyy')}</span></div>}
                      {c.reason_for_removal && <div className="col-span-2"><span className="text-muted-foreground">{t('reasonForRemoval')}:</span> <span className="font-medium">{c.reason_for_removal}</span></div>}
                    </div>
                    {c.notes && <p className="text-xs text-muted-foreground">{c.notes}</p>}
                    {c.is_current && (
                      <RemovalForm onSubmit={(date, reason) => handleRemoval(c.id, date, reason)} />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const RemovalForm: React.FC<{ onSubmit: (date: string, reason: string) => void }> = ({ onSubmit }) => {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');

  if (!show) return (
    <Button size="sm" variant="outline" className="rounded-full text-destructive border-destructive/30 mt-2" onClick={() => setShow(true)}>
      {t('recordRemoval')}
    </Button>
  );

  return (
    <div className="space-y-2 mt-2 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
      <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="rounded-xl" />
      <Input placeholder={t('reasonForRemoval')} value={reason} onChange={e => setReason(e.target.value)} className="rounded-xl" />
      <div className="flex gap-2">
        <Button size="sm" variant="destructive" className="rounded-full flex-1" onClick={() => { if (date) onSubmit(date, reason); }}>{t('confirm')}</Button>
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => setShow(false)}>{t('cancel')}</Button>
      </div>
    </div>
  );
};

export default CatheterRegistry;
