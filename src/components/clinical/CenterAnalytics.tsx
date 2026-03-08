import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, BarChart3, TrendingUp, Wrench } from 'lucide-react';

interface CenterStats {
  totalPatients: number;
  totalEpisodes: number;
  peritonitisRate: number;
  organisms: { name: string; count: number; pct: number }[];
  exitSiteCount: number;
  avgClearanceDays: number | null;
  medianTimeToFirstPeritonitis: number | null;
  catheterVsInfection: { type: string; rate: number; episodes: number; patients: number }[];
}

const CenterAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [stats, setStats] = useState<CenterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [episodes, setEpisodes] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);

      // Load all peritonitis episodes accessible to this user
      const { data: epData } = await supabase
        .from('peritonitis_episodes')
        .select('*')
        .order('date_onset', { ascending: false });

      const { data: exitData } = await supabase
        .from('exit_site_infections')
        .select('id')

      const allEp = (epData || []) as any[];
      setEpisodes(allEp);

      // Unique patients
      const uniquePatients = new Set(allEp.map(e => e.patient_id));

      // Organism distribution
      const orgMap = new Map<string, number>();
      allEp.forEach(e => {
        const org = e.organism || t('cultureNegative');
        orgMap.set(org, (orgMap.get(org) || 0) + 1);
      });
      const organisms = Array.from(orgMap.entries())
        .map(([name, count]) => ({ name, count, pct: allEp.length ? Math.round(count / allEp.length * 100) : 0 }))
        .sort((a, b) => b.count - a.count);

      // Clearance
      const clearances = allEp
        .filter(e => e.effluent_clearance_date && e.empiric_antibiotic_start_date)
        .map(e => {
          const start = new Date(e.empiric_antibiotic_start_date);
          const clear = new Date(e.effluent_clearance_date);
          return Math.round((clear.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        })
        .filter(d => d >= 0);
      const avgClearance = clearances.length > 0 ? Math.round(clearances.reduce((a, b) => a + b, 0) / clearances.length) : null;

      setStats({
        totalPatients: uniquePatients.size,
        totalEpisodes: allEp.length,
        peritonitisRate: uniquePatients.size > 0 ? parseFloat((allEp.length / uniquePatients.size).toFixed(2)) : 0,
        organisms,
        exitSiteCount: exitData?.length || 0,
        avgClearanceDays: avgClearance,
      });
      setLoading(false);
    };
    load();
  }, [user]);

  const exportResearchCSV = () => {
    if (!episodes.length) return;
    const headers = ['patient_id', 'episode_number', 'date_onset', 'organism', 'classification', 'empiric_regimen', 'clinical_response', 'clearance_days', 'catheter_removed', 'switch_to_hd'];
    const rows = episodes.map(e => {
      const clearDays = e.effluent_clearance_date && e.empiric_antibiotic_start_date
        ? Math.round((new Date(e.effluent_clearance_date).getTime() - new Date(e.empiric_antibiotic_start_date).getTime()) / 86400000)
        : '';
      return [e.patient_id, e.episode_number, e.date_onset, e.organism || '', e.classification || '', e.empiric_regimen || '', e.clinical_response || '', clearDays, e.catheter_removed ? 'yes' : 'no', e.switch_to_hd ? 'yes' : 'no'].map(v => `"${v}"`).join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pd_research_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: '📊', description: t('researchExported') });
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground">📊 {t('centerAnalytics')}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t('centerAnalyticsDesc')}</p>
        </div>
        <Button size="sm" className="rounded-full gap-1.5" onClick={exportResearchCSV} disabled={!episodes.length}>
          <Download className="w-3.5 h-3.5" /> {t('exportCSV')}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('totalEpisodes'), value: stats.totalEpisodes, emoji: '🦠', bg: 'bg-destructive/10' },
          { label: t('peritonitisRate'), value: `${stats.peritonitisRate}/py`, emoji: '📈', bg: 'bg-primary/10' },
          { label: t('exitSiteInfections'), value: stats.exitSiteCount, emoji: '⚠️', bg: 'bg-[hsl(var(--coral))]/10' },
          { label: t('avgClearance'), value: stats.avgClearanceDays != null ? `${stats.avgClearanceDays}d` : '—', emoji: '⏱️', bg: 'bg-[hsl(var(--mint))]/10' },
        ].map(m => (
          <Card key={m.label} className="border-border/30 shadow-sm rounded-2xl">
            <CardContent className="p-3.5 text-center">
              <span className="text-xl">{m.emoji}</span>
              <p className="text-lg font-black text-foreground mt-1">{m.value}</p>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Organism Distribution */}
      {stats.organisms.length > 0 && (
        <Card className="rounded-2xl border-border/30 shadow-sm">
          <CardContent className="p-4">
            <p className="font-bold text-sm mb-3 flex items-center gap-1.5"><BarChart3 className="w-4 h-4" /> {t('organismDistribution')}</p>
            <div className="space-y-2">
              {stats.organisms.slice(0, 8).map(org => (
                <div key={org.name} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-medium truncate">{org.name}</p>
                      <p className="text-[10px] text-muted-foreground">{org.count} ({org.pct}%)</p>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted/50">
                      <div className="h-full rounded-full bg-primary/70 transition-all" style={{ width: `${org.pct}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Research Export Info */}
      <Card className="rounded-2xl border-border/30 bg-muted/20">
        <CardContent className="p-4 flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold">{t('researchExport')}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t('researchExportDesc')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CenterAnalytics;
