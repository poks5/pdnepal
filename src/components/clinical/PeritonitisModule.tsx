import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { PeritonitisEpisode, PeritonitisAntibiotic, PeritonitisClulture } from '@/types/clinical';
import { Plus, ChevronDown, ChevronUp, Pill, FlaskConical } from 'lucide-react';
import { format } from 'date-fns';

const symptomOptions = ['cloudy_effluent', 'abdominal_pain', 'fever', 'nausea', 'vomiting', 'diarrhea'];
const classificationOptions = ['standard', 'culture_negative', 'fungal', 'polymicrobial', 'refractory', 'relapsing', 'recurrent', 'repeat'];

const PeritonitisModule: React.FC<{ patientId?: string }> = ({ patientId }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [episodes, setEpisodes] = useState<PeritonitisEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState('episodes');

  // Add episode form
  const [form, setForm] = useState({
    date_onset: '', presenting_symptoms: [] as string[],
    effluent_wbc: '', neutrophil_percent: '', organism: '',
    classification: '', empiric_regimen: '', clinical_response: '', notes: '',
  });

  // Add antibiotic form
  const [abxForm, setAbxForm] = useState({ drug_name: '', route: 'IP', start_date: '', stop_date: '', dose: '', frequency: '', reason_for_change: '' });
  const [showAbxAdd, setShowAbxAdd] = useState<string | null>(null);

  // Add culture form
  const [cultureForm, setCultureForm] = useState({ culture_date: '', sample_type: 'PD effluent', organism: '', colony_count: '', gram_type: '', notes: '', sensitivities: [{ antibiotic: '', result: 'sensitive' as 'sensitive' | 'resistant' | 'intermediate' }] });
  const [showCultureAdd, setShowCultureAdd] = useState<string | null>(null);

  const targetPatient = patientId || user?.id;

  const loadEpisodes = async () => {
    if (!targetPatient) return;
    setLoading(true);
    const { data } = await supabase
      .from('peritonitis_episodes')
      .select('*')
      .eq('patient_id', targetPatient)
      .order('date_onset', { ascending: false });
    if (data) {
      // Load antibiotics and cultures for each episode
      const enriched = await Promise.all((data as unknown as PeritonitisEpisode[]).map(async ep => {
        const [abxRes, cultureRes] = await Promise.all([
          supabase.from('peritonitis_antibiotics').select('*').eq('episode_id', ep.id).order('start_date'),
          supabase.from('peritonitis_cultures').select('*').eq('episode_id', ep.id).order('culture_date'),
        ]);
        return { ...ep, antibiotics: (abxRes.data || []) as unknown as PeritonitisAntibiotic[], cultures: (cultureRes.data || []) as unknown as PeritonitisClulture[] };
      }));
      setEpisodes(enriched);
    }
    setLoading(false);
  };

  useEffect(() => { loadEpisodes(); }, [targetPatient]);

  const handleAddEpisode = async () => {
    if (!form.date_onset || !user) return;
    const epNum = episodes.length + 1;
    const { error } = await supabase.from('peritonitis_episodes').insert({
      patient_id: targetPatient!,
      episode_number: epNum,
      date_onset: form.date_onset,
      presenting_symptoms: form.presenting_symptoms,
      effluent_wbc: form.effluent_wbc ? parseInt(form.effluent_wbc) : null,
      neutrophil_percent: form.neutrophil_percent ? parseFloat(form.neutrophil_percent) : null,
      organism: form.organism || null,
      classification: form.classification || null,
      empiric_regimen: form.empiric_regimen || null,
      clinical_response: form.clinical_response || null,
      notes: form.notes || null,
      created_by: user.id,
    });
    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅', description: t('episodeAdded') });
      setShowAdd(false);
      setForm({ date_onset: '', presenting_symptoms: [], effluent_wbc: '', neutrophil_percent: '', organism: '', classification: '', empiric_regimen: '', clinical_response: '', notes: '' });
      // Also add timeline event
      await supabase.from('pd_events').insert({
        patient_id: targetPatient!, event_type: 'peritonitis', event_date: form.date_onset,
        notes: `Episode #${epNum}`, created_by: user.id,
      });
      loadEpisodes();
    }
  };

  const handleAddAntibiotic = async (episodeId: string) => {
    if (!abxForm.drug_name || !abxForm.start_date) return;
    const { error } = await supabase.from('peritonitis_antibiotics').insert({
      episode_id: episodeId,
      drug_name: abxForm.drug_name,
      route: abxForm.route,
      start_date: abxForm.start_date,
      stop_date: abxForm.stop_date || null,
      dose: abxForm.dose || null,
      frequency: abxForm.frequency || null,
      reason_for_change: abxForm.reason_for_change || null,
    });
    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅', description: t('antibioticAdded') });
      setAbxForm({ drug_name: '', route: 'IP', start_date: '', stop_date: '', dose: '', frequency: '', reason_for_change: '' });
      setShowAbxAdd(null);
      loadEpisodes();
    }
  };

  const handleAddCulture = async (episodeId: string) => {
    if (!cultureForm.culture_date) return;
    const { error } = await supabase.from('peritonitis_cultures').insert({
      episode_id: episodeId,
      culture_date: cultureForm.culture_date,
      sample_type: cultureForm.sample_type || null,
      organism: cultureForm.organism || null,
      colony_count: cultureForm.colony_count || null,
      gram_type: cultureForm.gram_type || null,
      notes: cultureForm.notes || null,
      sensitivity: cultureForm.sensitivities.filter(s => s.antibiotic.trim()) as any,
    });
    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅', description: t('cultureAdded') });
      setCultureForm({ culture_date: '', sample_type: 'PD effluent', organism: '', colony_count: '', gram_type: '', notes: '', sensitivities: [{ antibiotic: '', result: 'sensitive' }] });
      setShowCultureAdd(null);
      loadEpisodes();
    }
  };

  const addSensitivityRow = () => {
    setCultureForm(p => ({ ...p, sensitivities: [...p.sensitivities, { antibiotic: '', result: 'sensitive' }] }));
  };

  const updateSensitivity = (idx: number, field: string, value: string) => {
    setCultureForm(p => ({
      ...p,
      sensitivities: p.sensitivities.map((s, i) => i === idx ? { ...s, [field]: value } : s),
    }));
  };

  const removeSensitivity = (idx: number) => {
    setCultureForm(p => ({ ...p, sensitivities: p.sensitivities.filter((_, i) => i !== idx) }));
  };

  const toggleSymptom = (s: string) => {
    setForm(p => ({
      ...p,
      presenting_symptoms: p.presenting_symptoms.includes(s)
        ? p.presenting_symptoms.filter(x => x !== s)
        : [...p.presenting_symptoms, s],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground">🦠 {t('peritonitisTracker')}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t('peritonitisDesc')}</p>
        </div>
        <Button size="sm" className="rounded-full gap-1.5" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-3.5 h-3.5" /> {t('newEpisode')}
        </Button>
      </div>

      {showAdd && (
        <Card className="rounded-2xl border-destructive/30 shadow-md">
          <CardContent className="p-4 space-y-3">
            <p className="font-bold text-sm">{t('recordNewEpisode')}</p>
            <Input type="date" value={form.date_onset} onChange={e => setForm(p => ({ ...p, date_onset: e.target.value }))} className="rounded-xl" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">{t('presentingSymptoms')}</p>
              <div className="flex flex-wrap gap-2">
                {symptomOptions.map(s => (
                  <label key={s} className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <Checkbox checked={form.presenting_symptoms.includes(s)} onCheckedChange={() => toggleSymptom(s)} />
                    {t(`symptom_${s}`)}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder={t('effluentWBC')} value={form.effluent_wbc} onChange={e => setForm(p => ({ ...p, effluent_wbc: e.target.value }))} className="rounded-xl" />
              <Input type="number" placeholder={t('neutrophilPct')} value={form.neutrophil_percent} onChange={e => setForm(p => ({ ...p, neutrophil_percent: e.target.value }))} className="rounded-xl" />
            </div>
            <Input placeholder={t('organism')} value={form.organism} onChange={e => setForm(p => ({ ...p, organism: e.target.value }))} className="rounded-xl" />
            <Select value={form.classification} onValueChange={v => setForm(p => ({ ...p, classification: v }))}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder={t('classification')} /></SelectTrigger>
              <SelectContent>
                {classificationOptions.map(c => <SelectItem key={c} value={c}>{t(`class_${c}`)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder={t('empiricRegimen')} value={form.empiric_regimen} onChange={e => setForm(p => ({ ...p, empiric_regimen: e.target.value }))} className="rounded-xl" />
            <Select value={form.clinical_response} onValueChange={v => setForm(p => ({ ...p, clinical_response: v }))}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder={t('clinicalResponse')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="good">{t('responseGood')}</SelectItem>
                <SelectItem value="partial">{t('responsePartial')}</SelectItem>
                <SelectItem value="none">{t('responseNone')}</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder={t('notes')} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="rounded-xl" />
            <div className="flex gap-2">
              <Button size="sm" className="rounded-full flex-1" onClick={handleAddEpisode}>{t('save')}</Button>
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => setShowAdd(false)}>{t('cancel')}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : episodes.length === 0 ? (
        <Card className="rounded-2xl border-border/30">
          <CardContent className="p-8 text-center">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-sm font-semibold text-foreground">{t('noEpisodes')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('noEpisodesDesc')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {episodes.map(ep => {
            const expanded = expandedId === ep.id;
            const responseColor = ep.clinical_response === 'good' ? 'bg-[hsl(var(--mint))]/15 text-[hsl(var(--mint))]' : ep.clinical_response === 'partial' ? 'bg-[hsl(var(--peach))]/15 text-[hsl(var(--coral))]' : 'bg-destructive/10 text-destructive';
            return (
              <Card key={ep.id} className="rounded-2xl border-border/30 shadow-sm overflow-hidden">
                <button className="w-full text-left p-4" onClick={() => setExpandedId(expanded ? null : ep.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-lg">🦠</div>
                      <div>
                        <p className="font-bold text-sm">{t('episode')} #{ep.episode_number}</p>
                        <p className="text-[11px] text-muted-foreground">{format(new Date(ep.date_onset), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {ep.organism && <Badge variant="outline" className="text-[10px] rounded-full">{ep.organism}</Badge>}
                      {ep.clinical_response && <Badge className={`text-[10px] border-0 rounded-full ${responseColor}`}>{t(`response${ep.clinical_response.charAt(0).toUpperCase() + ep.clinical_response.slice(1)}`)}</Badge>}
                      {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                </button>

                {expanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border/20 pt-3">
                    {/* Symptoms */}
                    {ep.presenting_symptoms.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t('presentingSymptoms')}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {ep.presenting_symptoms.map(s => <Badge key={s} variant="outline" className="text-[10px] rounded-full">{t(`symptom_${s}`)}</Badge>)}
                        </div>
                      </div>
                    )}

                    {/* Diagnostics */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {ep.effluent_wbc != null && <div className="p-2 rounded-lg bg-muted/30"><span className="text-muted-foreground">{t('effluentWBC')}:</span> <span className="font-bold">{ep.effluent_wbc}</span></div>}
                      {ep.neutrophil_percent != null && <div className="p-2 rounded-lg bg-muted/30"><span className="text-muted-foreground">{t('neutrophilPct')}:</span> <span className="font-bold">{ep.neutrophil_percent}%</span></div>}
                      {ep.classification && <div className="p-2 rounded-lg bg-muted/30"><span className="text-muted-foreground">{t('classification')}:</span> <span className="font-bold">{t(`class_${ep.classification}`)}</span></div>}
                    </div>

                    {/* Antibiotics */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Pill className="w-3 h-3" /> {t('antibiotics')}</p>
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] rounded-full gap-1" onClick={() => setShowAbxAdd(showAbxAdd === ep.id ? null : ep.id)}>
                          <Plus className="w-3 h-3" /> {t('add')}
                        </Button>
                      </div>
                      {showAbxAdd === ep.id && (
                        <Card className="rounded-xl border-primary/20 mb-2">
                          <CardContent className="p-3 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <Input placeholder={t('drugName')} value={abxForm.drug_name} onChange={e => setAbxForm(p => ({ ...p, drug_name: e.target.value }))} className="rounded-lg text-xs h-8" />
                              <Select value={abxForm.route} onValueChange={v => setAbxForm(p => ({ ...p, route: v }))}>
                                <SelectTrigger className="rounded-lg h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="IP">IP</SelectItem>
                                  <SelectItem value="IV">IV</SelectItem>
                                  <SelectItem value="oral">{t('oral')}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Input type="date" value={abxForm.start_date} onChange={e => setAbxForm(p => ({ ...p, start_date: e.target.value }))} className="rounded-lg text-xs h-8" />
                              <Input type="date" value={abxForm.stop_date} onChange={e => setAbxForm(p => ({ ...p, stop_date: e.target.value }))} className="rounded-lg text-xs h-8" />
                            </div>
                            <Input placeholder={t('dose')} value={abxForm.dose} onChange={e => setAbxForm(p => ({ ...p, dose: e.target.value }))} className="rounded-lg text-xs h-8" />
                            <Button size="sm" className="rounded-full w-full h-7 text-xs" onClick={() => handleAddAntibiotic(ep.id)}>{t('addAntibiotic')}</Button>
                          </CardContent>
                        </Card>
                      )}
                      {(ep.antibiotics || []).length > 0 && (
                        <div className="rounded-xl overflow-hidden border border-border/30">
                          <Table>
                            <TableHeader>
                              <TableRow className="text-[10px]">
                                <TableHead className="h-7 px-2">{t('drug')}</TableHead>
                                <TableHead className="h-7 px-2">{t('route')}</TableHead>
                                <TableHead className="h-7 px-2">{t('start')}</TableHead>
                                <TableHead className="h-7 px-2">{t('stop')}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {ep.antibiotics!.map(abx => (
                                <TableRow key={abx.id} className="text-xs">
                                  <TableCell className="py-1.5 px-2 font-medium">{abx.drug_name}</TableCell>
                                  <TableCell className="py-1.5 px-2"><Badge variant="outline" className="text-[9px] px-1.5">{abx.route}</Badge></TableCell>
                                  <TableCell className="py-1.5 px-2">{format(new Date(abx.start_date), 'MMM d')}</TableCell>
                                  <TableCell className="py-1.5 px-2">{abx.stop_date ? format(new Date(abx.stop_date), 'MMM d') : '—'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>

                    {/* Cultures & Sensitivity */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><FlaskConical className="w-3 h-3" /> {t('cultures')}</p>
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] rounded-full gap-1" onClick={() => setShowCultureAdd(showCultureAdd === ep.id ? null : ep.id)}>
                          <Plus className="w-3 h-3" /> {t('add')}
                        </Button>
                      </div>
                      {showCultureAdd === ep.id && (
                        <Card className="rounded-xl border-primary/20 mb-2">
                          <CardContent className="p-3 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <Input type="date" placeholder={t('cultureDate')} value={cultureForm.culture_date} onChange={e => setCultureForm(p => ({ ...p, culture_date: e.target.value }))} className="rounded-lg text-xs h-8" />
                              <Input placeholder={t('sampleType')} value={cultureForm.sample_type} onChange={e => setCultureForm(p => ({ ...p, sample_type: e.target.value }))} className="rounded-lg text-xs h-8" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Input placeholder={t('organism')} value={cultureForm.organism} onChange={e => setCultureForm(p => ({ ...p, organism: e.target.value }))} className="rounded-lg text-xs h-8" />
                              <Input placeholder={t('colonyCount')} value={cultureForm.colony_count} onChange={e => setCultureForm(p => ({ ...p, colony_count: e.target.value }))} className="rounded-lg text-xs h-8" />
                            </div>
                            <Select value={cultureForm.gram_type} onValueChange={v => setCultureForm(p => ({ ...p, gram_type: v }))}>
                              <SelectTrigger className="rounded-lg h-8 text-xs"><SelectValue placeholder={t('gramType')} /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="positive">{t('gramPositive')}</SelectItem>
                                <SelectItem value="negative">{t('gramNegative')}</SelectItem>
                                <SelectItem value="fungal">{t('fungal')}</SelectItem>
                                <SelectItem value="mycobacterial">{t('mycobacterial')}</SelectItem>
                              </SelectContent>
                            </Select>

                            {/* Antibiogram / Sensitivity */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('antibiogram')}</p>
                                <Button size="sm" variant="ghost" className="h-5 text-[9px] rounded-full gap-0.5" onClick={addSensitivityRow}>
                                  <Plus className="w-2.5 h-2.5" /> {t('addRow')}
                                </Button>
                              </div>
                              {cultureForm.sensitivities.map((s, idx) => (
                                <div key={idx} className="flex gap-1.5 mb-1">
                                  <Input placeholder={t('antibioticName')} value={s.antibiotic} onChange={e => updateSensitivity(idx, 'antibiotic', e.target.value)} className="rounded-lg text-xs h-7 flex-1" />
                                  <Select value={s.result} onValueChange={v => updateSensitivity(idx, 'result', v)}>
                                    <SelectTrigger className="rounded-lg h-7 text-xs w-28"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="sensitive">{t('sensitive')}</SelectItem>
                                      <SelectItem value="resistant">{t('resistant')}</SelectItem>
                                      <SelectItem value="intermediate">{t('intermediate')}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {cultureForm.sensitivities.length > 1 && (
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => removeSensitivity(idx)}>×</Button>
                                  )}
                                </div>
                              ))}
                            </div>

                            <Input placeholder={t('notes')} value={cultureForm.notes} onChange={e => setCultureForm(p => ({ ...p, notes: e.target.value }))} className="rounded-lg text-xs h-8" />
                            <Button size="sm" className="rounded-full w-full h-7 text-xs" onClick={() => handleAddCulture(ep.id)}>{t('addCulture')}</Button>
                          </CardContent>
                        </Card>
                      )}
                      {(ep.cultures || []).length > 0 && (
                        <div className="space-y-2">
                          {ep.cultures!.map(c => (
                            <Card key={c.id} className="rounded-xl border-border/20">
                              <CardContent className="p-2.5 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold">{c.organism || t('noOrganism')}</span>
                                  <div className="flex gap-1">
                                    {c.gram_type && <Badge variant="outline" className="text-[9px] rounded-full">{t(`gram_${c.gram_type}`)}</Badge>}
                                    <Badge variant="outline" className="text-[9px] rounded-full">{format(new Date(c.culture_date), 'MMM d')}</Badge>
                                  </div>
                                </div>
                                {c.sensitivity && (c.sensitivity as any[]).length > 0 && (
                                  <div className="rounded-lg overflow-hidden border border-border/20">
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="text-[9px]">
                                          <TableHead className="h-6 px-2">{t('antibioticName')}</TableHead>
                                          <TableHead className="h-6 px-2">{t('result')}</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {(c.sensitivity as any[]).map((s: any, i: number) => (
                                          <TableRow key={i} className="text-[10px]">
                                            <TableCell className="py-1 px-2">{s.antibiotic}</TableCell>
                                            <TableCell className="py-1 px-2">
                                              <Badge className={`text-[8px] border-0 rounded-full ${s.result === 'sensitive' ? 'bg-[hsl(var(--mint))]/15 text-[hsl(var(--mint))]' : s.result === 'resistant' ? 'bg-destructive/10 text-destructive' : 'bg-[hsl(var(--peach))]/15 text-[hsl(var(--coral))]'}`}>
                                                {t(s.result)}
                                              </Badge>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                )}
                                {c.notes && <p className="text-[10px] text-muted-foreground italic">{c.notes}</p>}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>

                    {ep.notes && <p className="text-xs text-muted-foreground italic">{ep.notes}</p>}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PeritonitisModule;
