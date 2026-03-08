import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Droplets, FileText, Settings, Users, Package, FlaskConical, BarChart, Stethoscope } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNav } from '@/components/Layout';
import { usePatient } from '@/contexts/PatientContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
import { formatExchangeForHistory } from '@/utils/exchangeFormatters';
import { ExchangeData } from '@/hooks/useExchangeForm';
import { DailyExchangeLog } from '@/types/patient';
import { useToast } from '@/hooks/use-toast';

const PatientDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { activeTab, setActiveTab } = useNav();
  const { exchangeLogs, addExchangeLog, patientProfile } = usePatient();
  const [showAddExchange, setShowAddExchange] = useState(false);
  const [savingExchange, setSavingExchange] = useState(false);
  const { toast } = useToast();

  const todayExchanges = { completed: 2, total: 4, nextTime: '18:00' };
  const weeklyStats = { adherence: 85, avgUF: 350, missedExchanges: 1 };
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
        solution_type: '1.5%',
        fill_volume_ml: exchangeData.fillVolume,
        drain_volume_ml: exchangeData.drainVolume,
        drain_color: exchangeData.clarity,
        pain_level: exchangeData.pain,
        notes: exchangeData.notes || null,
        weight_after_kg: exchangeData.weightAfter,
        symptoms: exchangeData.symptoms,
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
        dialysateStrength: '1.5%',
        notes: exchangeData.notes,
        exchangeType: exchangeData.type,
        photos: [],
        symptomTags: exchangeData.symptoms
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

  const tabItems = [
    { value: 'overview', icon: Calendar, label: t('overview') },
    { value: 'exchanges', icon: Droplets, label: t('exchanges') },
    { value: 'analytics', icon: BarChart, label: 'Analytics' },
    { value: 'lab-data', icon: FlaskConical, label: 'Labs' },
    { value: 'profile', icon: FileText, label: t('profile') },
    { value: 'catheter', icon: Settings, label: t('catheter') },
    { value: 'settings', icon: Settings, label: t('settings') },
    { value: 'caregiver', icon: Users, label: t('caregiver') },
    { value: 'supplier', icon: Package, label: t('supplier') },
    { value: 'my-doctor', icon: Stethoscope, label: 'My Doctor' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="px-1">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t('patient_dashboard')}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t('track_dialysis_journey')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 no-scrollbar">
          <TabsList className="inline-flex w-max gap-1 bg-muted/50 p-1 rounded-2xl">
            {tabItems.map(({ value, icon: Icon, label }) => (
              <TabsTrigger key={value} value={value} className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap">
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview">
          <DashboardOverview todayExchanges={todayExchanges} weeklyStats={weeklyStats} recentExchanges={recentExchanges} onAddExchange={() => setShowAddExchange(true)} />
        </TabsContent>
        <TabsContent value="exchanges"><ExchangeHistory exchanges={formattedExchanges} /></TabsContent>
        <TabsContent value="analytics"><AnalyticsDashboard /></TabsContent>
        <TabsContent value="lab-data"><LabDataManagement /></TabsContent>
        <TabsContent value="profile"><PatientProfile /></TabsContent>
        <TabsContent value="catheter"><CatheterDetails /></TabsContent>
        <TabsContent value="settings"><PDSettings /></TabsContent>
        <TabsContent value="caregiver"><CaregiverDetails /></TabsContent>
        <TabsContent value="supplier"><SupplierDetails /></TabsContent>
        <TabsContent value="my-doctor"><MyDoctor /></TabsContent>
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
