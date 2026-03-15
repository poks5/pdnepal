import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Droplets, FlaskConical, BarChart, Settings, Stethoscope, Users, Package, FileText, ChevronRight, BookOpen, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNav } from '@/components/Layout';
import { usePatient } from '@/contexts/PatientContext';
import { usePrescription } from '@/hooks/usePrescription';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import AddExchange from './AddExchange';
import ExchangeHistory from './ExchangeHistory';
import PatientProfile from './PatientProfile';
import CatheterDetails from './CatheterDetails';
import PDSettings from './PDSettings';
import CaregiverDetails from './CaregiverDetails';
import SupplierDetails from './SupplierDetails';
import LabDataManagement from './LabDataManagement';
import DashboardOverview from './dashboard/DashboardOverview';
import AnalyticsDashboard from './analytics/AnalyticsDashboard';
import MyDoctor from './MyDoctor';
import MyDietician from './MyDietician';
import LearningCenter from './learning/LearningCenter';
import { formatExchangeForHistory } from '@/utils/exchangeFormatters';
import SecureMessaging from './SecureMessaging';
import { ExchangeData } from '@/hooks/useExchangeForm';
import { DailyExchangeLog } from '@/types/patient';
import { useToast } from '@/hooks/use-toast';
import { learningModules } from './learning/learningContent';

const settingsSubItems = [
  { id: 'profile', icon: FileText, label: 'Profile', description: 'Personal information', emoji: '👤', gradient: 'from-primary/10 to-[hsl(var(--lavender))]/8' },
  { id: 'catheter', icon: Settings, label: 'Catheter', description: 'Catheter details', emoji: '🏥', gradient: 'from-[hsl(var(--mint))]/10 to-accent/8' },
  { id: 'pd-settings', icon: Settings, label: 'PD Settings', description: 'Dialysis configuration', emoji: '⚙️', gradient: 'from-[hsl(var(--sky))]/10 to-primary/8' },
  { id: 'caregiver', icon: Users, label: 'Caregivers', description: 'Manage caregivers', emoji: '🤝', gradient: 'from-[hsl(var(--peach))]/10 to-[hsl(var(--coral))]/8' },
  { id: 'supplier', icon: Package, label: 'Suppliers', description: 'Supply management', emoji: '📦', gradient: 'from-[hsl(var(--lavender))]/10 to-primary/8' },
  { id: 'my-doctor', icon: Stethoscope, label: 'My Doctor', description: 'Doctor connection', emoji: '👨‍⚕️', gradient: 'from-[hsl(var(--mint))]/10 to-[hsl(var(--sky))]/8' },
  { id: 'my-dietician', icon: Stethoscope, label: 'My Dietician', description: 'Nutrition guidance', emoji: '🥗', gradient: 'from-[hsl(var(--peach))]/10 to-[hsl(var(--mint))]/8' },
];

const PatientDashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { activeTab, setActiveTab, setBadgeCounts } = useNav();
  const { exchangeLogs, addExchangeLog } = usePatient();
  const [showAddExchange, setShowAddExchange] = useState(false);
  const [savingExchange, setSavingExchange] = useState(false);
  const [settingsView, setSettingsView] = useState<string | null>(null);
  const [learningKey, setLearningKey] = useState(0);
  const { toast } = useToast();

  // Fetch unread learning assignments count
  const fetchLearningBadge = useCallback(async () => {
    if (!user) return;
    const [{ data: assignments }, { data: progress }] = await Promise.all([
      supabase.from('learning_assignments').select('module_id').eq('patient_id', user.id),
      supabase.from('learning_progress').select('module_id').eq('user_id', user.id).eq('completed', true),
    ]);
    const completedIds = new Set((progress || []).map(p => p.module_id));
    const unread = (assignments || []).filter(a => !completedIds.has(a.module_id)).length;
    setBadgeCounts(prev => ({ ...prev, learning: unread }));
  }, [user, setBadgeCounts]);

  useEffect(() => { fetchLearningBadge(); }, [fetchLearningBadge, learningKey]);

  // Clear badge when viewing learning tab
  useEffect(() => {
    if (activeTab === 'learning') {
      setBadgeCounts(prev => ({ ...prev, learning: 0 }));
    }
  }, [activeTab, setBadgeCounts]);

  // Realtime listener for new learning assignments
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('learning-assignments-notify')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'learning_assignments',
          filter: `patient_id=eq.${user.id}`,
        },
        (payload) => {
          const moduleId = payload.new?.module_id as string;
          const mod = learningModules.find(m => m.id === moduleId);
          const title = mod?.title[language] || moduleId;
          toast({
            title: language === 'en' ? '📚 New Learning Module Assigned' : '📚 नयाँ सिकाइ मोड्युल तोकियो',
            description: title,
          });
          // Force LearningCenter to refetch
          setLearningKey(k => k + 1);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, language, toast]);

  // Use centralized prescription
  const { dailyExchanges: dailyTarget } = usePrescription(user?.id);

  // Compute real today's progress from exchange logs
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayLogs = exchangeLogs.filter(log => new Date(log.timestamp) >= today);
  const exchangeTimes = Array.from({ length: dailyTarget }, (_, i) => {
    const h = Math.round(6 + (i * (16 / Math.max(dailyTarget - 1, 1))));
    return `${h.toString().padStart(2, '0')}:00`;
  });
  const nextPendingIdx = todayLogs.length < exchangeTimes.length ? todayLogs.length : exchangeTimes.length - 1;
  const todayExchanges = {
    completed: todayLogs.length,
    total: dailyTarget,
    nextTime: todayLogs.length >= dailyTarget ? 'Done ✅' : exchangeTimes[nextPendingIdx] || '—',
  };

  // Compute real weekly stats
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weekLogs = exchangeLogs.filter(log => new Date(log.timestamp) >= sevenDaysAgo);
  const weeklyTarget = dailyTarget * 7;
  const weeklyAdherence = weeklyTarget > 0 ? Math.min(100, Math.round((weekLogs.length / weeklyTarget) * 100)) : 0;
  const weeklyAvgUF = weekLogs.length > 0 ? Math.round(weekLogs.reduce((sum, l) => sum + (l.ultrafiltration || 0), 0) / weekLogs.length) : 0;
  const weeklyStats = {
    adherence: weeklyAdherence,
    avgUF: weeklyAvgUF,
    missedExchanges: Math.max(0, weeklyTarget - weekLogs.length),
  };

  const recentExchanges = exchangeLogs.slice(0, 3);
  const formattedExchanges = exchangeLogs.map(formatExchangeForHistory);

  const handleSaveExchange = async (exchangeData: ExchangeData) => {
    if (!user) return;
    setSavingExchange(true);
    try {
      const { error } = await supabase.from('exchange_logs').insert({
        patient_id: user.id,
        recorded_by: user.id,
        dwell_start: new Date().toISOString(),
        exchange_type: exchangeData.type,
        solution_type: exchangeData.solutionType || 'Dianeal 1.5%',
        fill_volume_ml: exchangeData.fillVolume,
        drain_volume_ml: exchangeData.drainVolume,
        drain_color: exchangeData.clarity,
        pain_level: exchangeData.pain,
        notes: exchangeData.notes || null,
        weight_after_kg: exchangeData.weightAfter,
        symptoms: exchangeData.symptoms,
        blood_pressure_systolic: exchangeData.bloodPressureSystolic,
        blood_pressure_diastolic: exchangeData.bloodPressureDiastolic,
        temperature: exchangeData.temperature,
      });
      if (error) throw error;

      const newExchangeLog: DailyExchangeLog = {
        id: `exchange_${Date.now()}`,
        patientId: user.id,
        timestamp: new Date().toISOString(),
        drainVolume: exchangeData.drainVolume,
        fillVolume: exchangeData.fillVolume,
        ultrafiltration: exchangeData.ultrafiltration || (exchangeData.drainVolume - exchangeData.fillVolume),
        clarity: exchangeData.clarity === 'clear' ? 'clear' : 'cloudy',
        painLevel: exchangeData.pain,
        dwellTime: 4,
        dialysateStrength: exchangeData.solutionType || 'Dianeal 1.5%',
        notes: exchangeData.notes,
        exchangeType: exchangeData.type,
        photos: [],
        symptomTags: exchangeData.symptoms as any,
        weightAfterKg: exchangeData.weightAfter,
        bloodPressureSystolic: exchangeData.bloodPressureSystolic,
        bloodPressureDiastolic: exchangeData.bloodPressureDiastolic,
        temperature: exchangeData.temperature,
      };
      addExchangeLog(newExchangeLog);
      setShowAddExchange(false);
      toast({ title: 'Exchange saved', description: 'Your exchange has been recorded securely.' });
    } catch (err: any) {
      toast({ title: 'Error saving exchange', description: err.message, variant: 'destructive' });
    } finally {
      setSavingExchange(false);
    }
  };

  const mainTabs = [
    { value: 'overview', icon: Calendar, label: t('overview') },
    { value: 'exchanges', icon: Droplets, label: t('exchanges') },
    { value: 'messages', icon: MessageSquare, label: 'Messages' },
    { value: 'analytics', icon: BarChart, label: 'Analytics' },
    { value: 'lab-data', icon: FlaskConical, label: 'Labs' },
    { value: 'learning', icon: BookOpen, label: t('learningCenter') },
    { value: 'settings', icon: Settings, label: 'Settings' },
  ];

  const renderSettingsContent = () => {
    if (!settingsView) {
      return (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground px-1">⚙️ Settings & Preferences</h3>
          {settingsSubItems.map(({ id, icon: Icon, label, description, emoji, gradient }) => (
            <button
              key={id}
              onClick={() => setSettingsView(id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r ${gradient} border border-border/30 hover:shadow-md transition-all group text-left card-hover`}
            >
              <div className="w-12 h-12 rounded-2xl bg-card shadow-sm flex items-center justify-center shrink-0">
                <span className="text-2xl">{emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <button
          onClick={() => setSettingsView(null)}
          className="flex items-center gap-1.5 text-sm text-primary font-bold hover:underline"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Settings
        </button>
        {settingsView === 'profile' && <PatientProfile />}
        {settingsView === 'catheter' && <CatheterDetails />}
        {settingsView === 'pd-settings' && <PDSettings />}
        {settingsView === 'caregiver' && <CaregiverDetails />}
        {settingsView === 'supplier' && <SupplierDetails />}
        {settingsView === 'my-doctor' && <MyDoctor />}
        {settingsView === 'my-dietician' && <MyDietician />}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="px-1">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t('patient_dashboard')}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t('track_dialysis_journey')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); if (v !== 'settings') setSettingsView(null); }} className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 no-scrollbar">
          <TabsList className="inline-flex w-max gap-1 bg-muted/50 p-1 rounded-2xl">
            {mainTabs.map(({ value, icon: Icon, label }) => (
              <TabsTrigger key={value} value={value} className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap">
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview">
          <DashboardOverview todayExchanges={todayExchanges} weeklyStats={weeklyStats} recentExchanges={recentExchanges} allExchangeLogs={exchangeLogs} onAddExchange={() => setShowAddExchange(true)} />
        </TabsContent>
        <TabsContent value="exchanges"><ExchangeHistory exchanges={formattedExchanges} /></TabsContent>
        <TabsContent value="analytics"><AnalyticsDashboard /></TabsContent>
        <TabsContent value="messages"><SecureMessaging /></TabsContent>
        <TabsContent value="lab-data"><LabDataManagement /></TabsContent>
        <TabsContent value="learning"><LearningCenter key={learningKey} /></TabsContent>
        <TabsContent value="settings">{renderSettingsContent()}</TabsContent>
      </Tabs>

      <Dialog open={showAddExchange} onOpenChange={setShowAddExchange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto rounded-2xl">
          <AddExchange onSave={handleSaveExchange} onCancel={() => setShowAddExchange(false)} saving={savingExchange} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientDashboard;
