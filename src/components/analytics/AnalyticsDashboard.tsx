import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, AlertTriangle, Download, Pill, Activity, Camera,
  ArrowLeft, Droplets, Heart, BarChart3, Shield
} from 'lucide-react';
import TrendAnalysis from './TrendAnalysis';
import DataExport from './DataExport';
import LabAlerts from './LabAlerts';
import MedicationTracker from '../medical/MedicationTracker';
import SymptomTracker from '../medical/SymptomTracker';
import PhotoDocumentation from '../medical/PhotoDocumentation';
import PDTimeline from '../clinical/PDTimeline';
import PeritonitisModule from '../clinical/PeritonitisModule';
import ExitSiteInfectionModule from '../clinical/ExitSiteInfectionModule';
import CenterAnalytics from '../clinical/CenterAnalytics';
import { usePatient } from '@/contexts/PatientContext';
import { useLanguage } from '@/contexts/LanguageContext';
import pdsathiLogo from '@/assets/pdsathi-logo.png';

type Section = 'hub' | 'trends' | 'alerts' | 'export' | 'medications' | 'symptoms' | 'photos' | 'timeline' | 'peritonitis' | 'exit_site' | 'center_analytics';

const sectionDefs = [
  { id: 'timeline' as const, labelKey: 'pdTimeline', emoji: '🗓️', icon: TrendingUp, color: 'from-primary/20 to-primary/5', descKey: 'pdTimelineDesc' },
  { id: 'peritonitis' as const, labelKey: 'peritonitisTracker', emoji: '🦠', icon: AlertTriangle, color: 'from-destructive/15 to-destructive/5', descKey: 'peritonitisDesc' },
  { id: 'exit_site' as const, labelKey: 'exitSiteInfections', emoji: '⚠️', icon: AlertTriangle, color: 'from-[hsl(var(--coral))]/15 to-[hsl(var(--peach))]/5', descKey: 'exitSiteDesc' },
  { id: 'center_analytics' as const, labelKey: 'centerAnalytics', emoji: '📊', icon: Download, color: 'from-[hsl(var(--sky))]/20 to-[hsl(var(--sky))]/5', descKey: 'centerAnalyticsDesc' },
  { id: 'trends' as const, labelKey: 'ufTrends', emoji: '📈', icon: TrendingUp, color: 'from-[hsl(var(--mint))]/20 to-[hsl(var(--mint))]/5', descKey: 'trackUFPatterns' },
  { id: 'alerts' as const, labelKey: 'labAlerts', emoji: '🔬', icon: AlertTriangle, color: 'from-[hsl(var(--lavender))]/15 to-[hsl(var(--lavender))]/5', descKey: 'smartLabAlerts' },
  { id: 'medications' as const, labelKey: 'medications', emoji: '💊', icon: Pill, color: 'from-[hsl(var(--mint))]/20 to-[hsl(var(--mint))]/5', descKey: 'trackMedsAdherence' },
  { id: 'symptoms' as const, labelKey: 'symptoms', emoji: '🩺', icon: Activity, color: 'from-[hsl(var(--coral))]/15 to-[hsl(var(--peach))]/5', descKey: 'logScoreSymptoms' },
  { id: 'photos' as const, labelKey: 'photos', emoji: '📸', icon: Camera, color: 'from-[hsl(var(--lavender))]/20 to-[hsl(var(--lavender))]/5', descKey: 'documentCatheterFluid' },
  { id: 'export' as const, labelKey: 'export', emoji: '📤', icon: Download, color: 'from-[hsl(var(--sky))]/20 to-[hsl(var(--sky))]/5', descKey: 'downloadShareReports' },
];

const AnalyticsDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('hub');
  const { exchangeLogs } = usePatient();
  const { t } = useLanguage();

  const totalExchanges = exchangeLogs.length;
  const avgUF = totalExchanges > 0
    ? Math.round(exchangeLogs.reduce((s, l) => s + (l.ultrafiltration || 0), 0) / totalExchanges)
    : 0;

  if (activeSection !== 'hub') {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveSection('hub')}
          className="gap-1.5 text-muted-foreground hover:text-foreground rounded-full"
        >
          <ArrowLeft className="w-4 h-4" /> {t('backToAnalytics')}
        </Button>
        {activeSection === 'trends' && <TrendAnalysis />}
        {activeSection === 'alerts' && <LabAlerts />}
        {activeSection === 'export' && <DataExport />}
        {activeSection === 'medications' && <MedicationTracker />}
        {activeSection === 'symptoms' && <SymptomTracker />}
        {activeSection === 'photos' && <PhotoDocumentation />}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl gradient-hero p-5 sm:p-6 text-primary-foreground shadow-xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0">
            <img src={pdsathiLogo} alt="" className="w-10 h-10" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">{t('analyticsMedical')}</h1>
            <p className="text-sm opacity-80 mt-0.5">{t('analyticsDesc')}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t('exchanges'), value: totalExchanges, icon: Droplets, emoji: '💧', bg: 'bg-primary/10' },
          { label: t('avgUF'), value: `${avgUF}ml`, icon: BarChart3, emoji: '📊', bg: 'bg-[hsl(var(--mint))]/15' },
          { label: t('healthScore'), value: '—', icon: Heart, emoji: '❤️', bg: 'bg-[hsl(var(--coral))]/10' },
        ].map(({ label, value, emoji, bg }) => (
          <Card key={label} className="border-border/30 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-3.5 text-center">
              <span className="text-xl">{emoji}</span>
              <p className="text-lg sm:text-xl font-black text-foreground mt-1 leading-none">{value}</p>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Section Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {sectionDefs.map(({ id, labelKey, emoji, icon: Icon, color, descKey }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className="group text-left focus:outline-none"
          >
            <Card className="h-full border-border/30 shadow-sm rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 active:scale-[0.97] group-focus-visible:ring-2 ring-primary">
              <CardContent className="p-4 space-y-2.5">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                  <span className="text-xl">{emoji}</span>
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">{t(labelKey)}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{t(descKey)}</p>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {/* Info footer */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/20">
        <Shield className="w-5 h-5 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('dataEncrypted')}
        </p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
