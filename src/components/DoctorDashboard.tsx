import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ExchangePlanEditor from '@/components/ExchangePlanEditor';
import PatientDetailView from '@/components/PatientDetailView';
import AlertCenter from '@/components/AlertCenter';
import ExportTools from '@/components/ExportTools';
import CommentSystem from '@/components/CommentSystem';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardCards from '@/components/DashboardCards';
import PatientList from '@/components/PatientList';
import PlansTab from '@/components/PlansTab';
import LabOverview from '@/components/LabOverview';
import { Users, AlertTriangle, MessageSquare, Download, ClipboardList, FileText } from 'lucide-react';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [showPlanEditor, setShowPlanEditor] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // For now, keep mock patients — will be migrated to real DB queries in next phase
  const [patients] = useState([
    { id: 1, name: 'Ram Bahadur Gurung', age: 45, adherence: 85, lastExchange: '2 hours ago', alerts: 1, status: 'stable', missedExchanges: 0, weeklyUF: 2100 },
    { id: 2, name: 'Sita Devi Sharma', age: 52, adherence: 92, lastExchange: '1 hour ago', alerts: 0, status: 'good', missedExchanges: 0, weeklyUF: 2350 },
    { id: 3, name: 'Krishna Prasad Oli', age: 38, adherence: 68, lastExchange: '6 hours ago', alerts: 3, status: 'attention', missedExchanges: 2, weeklyUF: 1650 },
  ]);

  const totalAlerts = patients.reduce((sum, p) => sum + p.alerts, 0);
  const totalMissedExchanges = patients.reduce((sum, p) => sum + p.missedExchanges, 0);

  const handleManagePlan = (patient: any) => {
    setEditingPatient(patient);
    setShowPlanEditor(true);
  };

  const handleViewPatient = (patient: any) => setSelectedPatient(patient);

  const handleViewPatientLabs = (patientId: string) => {
    const patient = patients.find(p => p.id.toString() === patientId);
    if (patient) setSelectedPatient(patient);
  };

  if (selectedPatient) {
    return <PatientDetailView patient={selectedPatient} onBack={() => setSelectedPatient(null)} />;
  }

  const tabItems = [
    { value: 'patients', icon: Users, label: 'Patients' },
    { value: 'alerts', icon: AlertTriangle, label: 'Alerts' },
    { value: 'labs', icon: FileText, label: 'Labs' },
    { value: 'communication', icon: MessageSquare, label: 'Messages' },
    { value: 'export', icon: Download, label: 'Export' },
    { value: 'plans', icon: ClipboardList, label: 'Plans' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <DashboardHeader patientCount={patients.length} totalAlerts={totalAlerts} />
      <DashboardCards patientCount={patients.length} totalAlerts={totalAlerts} totalMissedExchanges={totalMissedExchanges} />

      <Tabs defaultValue="patients" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 no-scrollbar">
          <TabsList className="inline-flex w-max gap-1 bg-muted/50 p-1 rounded-2xl">
            {tabItems.map(({ value, icon: Icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap"
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="patients">
          <PatientList patients={patients} onViewPatient={handleViewPatient} onManagePlan={handleManagePlan} />
        </TabsContent>
        <TabsContent value="alerts"><AlertCenter /></TabsContent>
        <TabsContent value="labs"><LabOverview patients={patients} onViewPatientLabs={handleViewPatientLabs} /></TabsContent>
        <TabsContent value="communication"><CommentSystem /></TabsContent>
        <TabsContent value="export"><ExportTools /></TabsContent>
        <TabsContent value="plans"><PlansTab patients={patients} onManagePlan={handleManagePlan} /></TabsContent>
      </Tabs>

      <Dialog open={showPlanEditor} onOpenChange={setShowPlanEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <ExchangePlanEditor onSave={() => setShowPlanEditor(false)} onCancel={() => setShowPlanEditor(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorDashboard;
