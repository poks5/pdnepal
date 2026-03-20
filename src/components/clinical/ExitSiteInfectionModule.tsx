import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ExitSiteInfection } from '@/types/clinical';
import { Plus, CheckCircle, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import ClinicalPhotoUpload from './ClinicalPhotoUpload';

interface AIAnalysis {
  assessment: string;
  observed_signs: string[];
  recommendation: string;
  confidence: string;
  details: string;
}

const exitSymptoms = ['redness', 'swelling', 'discharge', 'crusting', 'tenderness', 'warmth'];

const ExitSiteInfectionModule: React.FC<{ patientId?: string }> = ({ patientId }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [infections, setInfections] = useState<ExitSiteInfection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [analyzingPhoto, setAnalyzingPhoto] = useState<string | null>(null);
  const [aiResults, setAiResults] = useState<Record<string, AIAnalysis>>({});
  const [form, setForm] = useState({
    date_onset: '', symptoms: [] as string[], organism: '', antibiotic: '',
    route: '', duration_days: '', notes: '', photo_urls: [] as string[],
  });

  const targetPatient = patientId || user?.id;

  const loadData = async () => {
    if (!targetPatient) return;
    setLoading(true);
    const { data } = await supabase
      .from('exit_site_infections')
      .select('*')
      .eq('patient_id', targetPatient)
      .order('date_onset', { ascending: false });
    if (data) setInfections(data as unknown as ExitSiteInfection[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [targetPatient]);

  const toggleSymptom = (s: string) => {
    setForm(p => ({
      ...p,
      symptoms: p.symptoms.includes(s) ? p.symptoms.filter(x => x !== s) : [...p.symptoms, s],
    }));
  };

  const handleAdd = async () => {
    if (!form.date_onset || !user) return;
    const { error } = await supabase.from('exit_site_infections').insert({
      patient_id: targetPatient!,
      date_onset: form.date_onset,
      symptoms: form.symptoms,
      organism: form.organism || null,
      antibiotic: form.antibiotic || null,
      route: form.route || null,
      duration_days: form.duration_days ? parseInt(form.duration_days) : null,
      notes: form.notes || null,
      photo_urls: form.photo_urls,
      created_by: user.id,
    });
    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅', description: t('infectionRecorded') });
      // Also add timeline event
      await supabase.from('pd_events').insert({
        patient_id: targetPatient!, event_type: 'exit_site_infection',
        event_date: form.date_onset, created_by: user.id,
      });
      setShowAdd(false);
      setForm({ date_onset: '', symptoms: [], organism: '', antibiotic: '', route: '', duration_days: '', notes: '', photo_urls: [] });
      loadData();
    }
  };

  const markResolved = async (id: string) => {
    await supabase.from('exit_site_infections').update({
      resolved: true, resolution_date: new Date().toISOString().split('T')[0],
    }).eq('id', id);
    toast({ title: '✅', description: t('markedResolved') });
    loadData();
  };

  const analyzePhoto = async (infectionId: string, photoUrl: string) => {
    setAnalyzingPhoto(infectionId);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-exit-site-photo', {
        body: { photoUrl },
      });
      if (error) throw error;
      if (data?.analysis) {
        setAiResults(prev => ({ ...prev, [infectionId]: data.analysis }));
        const level = data.analysis.assessment;
        toast({
          title: level === 'normal' ? '✅ Exit site looks normal' : '⚠️ AI detected concerns',
          description: data.analysis.recommendation,
          variant: level === 'severe_concern' ? 'destructive' : 'default',
        });
      }
    } catch (err: any) {
      toast({ title: 'AI Analysis Failed', description: err.message, variant: 'destructive' });
    } finally {
      setAnalyzingPhoto(null);
    }
  };

  const getAssessmentColor = (assessment: string) => {
    switch (assessment) {
      case 'normal': return 'bg-[hsl(var(--mint))]/15 text-[hsl(var(--mint))]';
      case 'mild_concern': return 'bg-[hsl(var(--peach))]/15 text-[hsl(var(--coral))]';
      case 'moderate_concern': return 'bg-destructive/15 text-destructive';
      case 'severe_concern': return 'bg-destructive/20 text-destructive font-bold';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground">⚠️ {t('exitSiteInfections')}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t('exitSiteDesc')}</p>
        </div>
        <Button size="sm" className="rounded-full gap-1.5" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-3.5 h-3.5" /> {t('record')}
        </Button>
      </div>

      {showAdd && (
        <Card className="rounded-2xl border-[hsl(var(--coral))]/30 shadow-md">
          <CardContent className="p-4 space-y-3">
            <Input type="date" value={form.date_onset} onChange={e => setForm(p => ({ ...p, date_onset: e.target.value }))} className="rounded-xl" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">{t('symptoms')}</p>
              <div className="flex flex-wrap gap-2">
                {exitSymptoms.map(s => (
                  <label key={s} className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <Checkbox checked={form.symptoms.includes(s)} onCheckedChange={() => toggleSymptom(s)} />
                    {t(`exit_${s}`)}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder={t('organism')} value={form.organism} onChange={e => setForm(p => ({ ...p, organism: e.target.value }))} className="rounded-xl" />
              <Input placeholder={t('antibiotic')} value={form.antibiotic} onChange={e => setForm(p => ({ ...p, antibiotic: e.target.value }))} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={form.route} onValueChange={v => setForm(p => ({ ...p, route: v }))}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder={t('route')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="topical">{t('topical')}</SelectItem>
                  <SelectItem value="oral">{t('oral')}</SelectItem>
                  <SelectItem value="IV">IV</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" placeholder={t('durationDays')} value={form.duration_days} onChange={e => setForm(p => ({ ...p, duration_days: e.target.value }))} className="rounded-xl" />
            </div>
            <Input placeholder={t('notes')} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="rounded-xl" />
            <ClinicalPhotoUpload
              photoUrls={form.photo_urls}
              folder={`exit-site/${targetPatient}`}
              onPhotosChange={(urls) => setForm(p => ({ ...p, photo_urls: urls }))}
            />
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
      ) : infections.length === 0 ? (
        <Card className="rounded-2xl border-border/30">
          <CardContent className="p-8 text-center">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-sm font-semibold">{t('noExitSiteInfections')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {infections.map(inf => (
            <Card key={inf.id} className={`rounded-2xl border-border/30 shadow-sm ${inf.resolved ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    {inf.resolved ? <CheckCircle className="w-5 h-5 text-[hsl(var(--mint))]" /> : <AlertTriangle className="w-5 h-5 text-[hsl(var(--coral))]" />}
                    <div>
                      <p className="font-bold text-sm">{format(new Date(inf.date_onset), 'MMM d, yyyy')}</p>
                      <p className="text-[11px] text-muted-foreground">{inf.organism || t('culturePending')}</p>
                    </div>
                  </div>
                  <Badge className={`text-[10px] border-0 rounded-full ${inf.resolved ? 'bg-[hsl(var(--mint))]/15 text-[hsl(var(--mint))]' : 'bg-destructive/10 text-destructive'}`}>
                    {inf.resolved ? t('resolved') : t('active')}
                  </Badge>
                </div>
                {inf.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {inf.symptoms.map(s => <Badge key={s} variant="outline" className="text-[9px] rounded-full">{t(`exit_${s}`)}</Badge>)}
                  </div>
                )}
                {inf.antibiotic && <p className="text-xs text-muted-foreground">💊 {inf.antibiotic} ({inf.route}) · {inf.duration_days}d</p>}
                {inf.photo_urls && inf.photo_urls.length > 0 && (
                  <ClinicalPhotoUpload
                    photoUrls={inf.photo_urls}
                    folder={`exit-site/${inf.id}`}
                    onPhotosChange={async (urls) => {
                      await supabase.from('exit_site_infections').update({ photo_urls: urls }).eq('id', inf.id);
                      loadData();
                    }}
                    readOnly={inf.resolved}
                  />
                )}
                {!inf.resolved && (!inf.photo_urls || inf.photo_urls.length === 0) && (
                  <ClinicalPhotoUpload
                    photoUrls={[]}
                    folder={`exit-site/${inf.id}`}
                    onPhotosChange={async (urls) => {
                      await supabase.from('exit_site_infections').update({ photo_urls: urls }).eq('id', inf.id);
                      loadData();
                    }}
                  />
                )}
                {/* AI Analysis Button */}
                {inf.photo_urls && inf.photo_urls.length > 0 && !inf.resolved && (
                  <div className="mt-2 space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs h-7 gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() => analyzePhoto(inf.id, inf.photo_urls[0])}
                      disabled={analyzingPhoto === inf.id}
                    >
                      {analyzingPhoto === inf.id ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Analyzing...</>
                      ) : (
                        <><Sparkles className="w-3 h-3" /> AI Analyze Photo</>
                      )}
                    </Button>
                    {aiResults[inf.id] && (
                      <Card className="rounded-xl border-border/40 bg-muted/30">
                        <CardContent className="p-3 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Badge className={`text-[10px] border-0 rounded-full ${getAssessmentColor(aiResults[inf.id].assessment)}`}>
                              🤖 {aiResults[inf.id].assessment.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className="text-[9px] rounded-full">
                              {aiResults[inf.id].confidence} confidence
                            </Badge>
                          </div>
                          {aiResults[inf.id].observed_signs.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {aiResults[inf.id].observed_signs.map(s => (
                                <Badge key={s} variant="outline" className="text-[9px] rounded-full bg-destructive/5">{s}</Badge>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">{aiResults[inf.id].details}</p>
                          <p className="text-xs font-medium text-foreground">📋 {aiResults[inf.id].recommendation}</p>
                          <p className="text-[9px] text-muted-foreground italic">⚕️ AI screening aid only — not a clinical diagnosis</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
                {!inf.resolved && (
                  <Button size="sm" variant="outline" className="mt-2 rounded-full text-xs h-7" onClick={() => markResolved(inf.id)}>
                    <CheckCircle className="w-3 h-3 mr-1" /> {t('markResolved')}
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

export default ExitSiteInfectionModule;
