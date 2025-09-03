
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Droplets, FileText, Settings, Users, Package, FlaskConical, BarChart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatient } from '@/contexts/PatientContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
import { formatExchangeForHistory } from '@/utils/exchangeFormatters';
import { ExchangeData } from '@/hooks/useExchangeForm';
import { DailyExchangeLog } from '@/types/patient';

const PatientDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { exchangeLogs, addExchangeLog, patientProfile } = usePatient();
  const [showAddExchange, setShowAddExchange] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration
  const todayExchanges = {
    completed: 2,
    total: 4,
    nextTime: '18:00'
  };

  const weeklyStats = {
    adherence: 85,
    avgUF: 350,
    missedExchanges: 1
  };

  const recentExchanges = exchangeLogs.slice(0, 3);

  // Convert exchangeLogs to the format expected by ExchangeHistory
  const formattedExchanges = exchangeLogs.map(formatExchangeForHistory);

  const handleSaveExchange = (exchangeData: ExchangeData) => {
    // Create a DailyExchangeLog object from the ExchangeData
    const newExchangeLog: DailyExchangeLog = {
      id: `exchange_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientId: patientProfile?.id || 'default_patient',
      timestamp: new Date().toISOString(),
      drainVolume: exchangeData.drainVolume,
      fillVolume: exchangeData.fillVolume,
      ultrafiltration: exchangeData.ultrafiltration,
      clarity: exchangeData.clarity === 'clear' ? 'clear' : 'cloudy',
      painLevel: exchangeData.pain,
      dwellTime: 4,
      dialysateStrength: '1.5%',
      notes: exchangeData.notes,
      exchangeType: exchangeData.type,
      photos: [],
      symptomTags: []
    };

    addExchangeLog(newExchangeLog);
    setShowAddExchange(false);
    console.log('Exchange logged successfully:', newExchangeLog);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('patient_dashboard')}</h1>
          <p className="text-gray-600">{t('track_dialysis_journey')}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="overview" className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">{t('overview')}</span>
          </TabsTrigger>
          <TabsTrigger value="exchanges" className="flex items-center space-x-1">
            <Droplets className="w-4 h-4" />
            <span className="hidden sm:inline">{t('exchanges')}</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-1">
            <BarChart className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="lab-data" className="flex items-center space-x-1">
            <FlaskConical className="w-4 h-4" />
            <span className="hidden sm:inline">Lab Data</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center space-x-1">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">{t('profile')}</span>
          </TabsTrigger>
          <TabsTrigger value="catheter" className="flex items-center space-x-1">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">{t('catheter')}</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-1">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">{t('settings')}</span>
          </TabsTrigger>
          <TabsTrigger value="caregiver" className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">{t('caregiver')}</span>
          </TabsTrigger>
          <TabsTrigger value="supplier" className="flex items-center space-x-1">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">{t('supplier')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <DashboardOverview
            todayExchanges={todayExchanges}
            weeklyStats={weeklyStats}
            recentExchanges={recentExchanges}
            onAddExchange={() => setShowAddExchange(true)}
          />
        </TabsContent>

        <TabsContent value="exchanges">
          <ExchangeHistory exchanges={formattedExchanges} />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="lab-data">
          <LabDataManagement />
        </TabsContent>

        <TabsContent value="profile">
          <PatientProfile />
        </TabsContent>

        <TabsContent value="catheter">
          <CatheterDetails />
        </TabsContent>

        <TabsContent value="settings">
          <PDSettings />
        </TabsContent>

        <TabsContent value="caregiver">
          <CaregiverDetails />
        </TabsContent>

        <TabsContent value="supplier">
          <SupplierDetails />
        </TabsContent>
      </Tabs>

      <Dialog open={showAddExchange} onOpenChange={setShowAddExchange}>
        <DialogContent className="max-w-2xl">
          <AddExchange 
            onSave={handleSaveExchange} 
            onCancel={() => setShowAddExchange(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientDashboard;
