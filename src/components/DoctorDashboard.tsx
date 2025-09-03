
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
  const [showPlanEditor, setShowPlanEditor] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  const [patients] = useState([
    {
      id: 1,
      name: 'Ram Bahadur Gurung',
      age: 45,
      adherence: 85,
      lastExchange: '2 hours ago',
      alerts: 1,
      status: 'stable',
      missedExchanges: 0,
      weeklyUF: 2100
    },
    {
      id: 2,
      name: 'Sita Devi Sharma',
      age: 52,
      adherence: 92,
      lastExchange: '1 hour ago',
      alerts: 0,
      status: 'good',
      missedExchanges: 0,
      weeklyUF: 2350
    },
    {
      id: 3,
      name: 'Krishna Prasad Oli',
      age: 38,
      adherence: 68,
      lastExchange: '6 hours ago',
      alerts: 3,
      status: 'attention',
      missedExchanges: 2,
      weeklyUF: 1650
    }
  ]);

  const totalAlerts = patients.reduce((sum, patient) => sum + patient.alerts, 0);
  const totalMissedExchanges = patients.reduce((sum, patient) => sum + patient.missedExchanges, 0);

  const handleManagePlan = (patient) => {
    setEditingPatient(patient);
    setShowPlanEditor(true);
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
  };

  const handleViewPatientLabs = (patientId: string) => {
    const patient = patients.find(p => p.id.toString() === patientId);
    if (patient) {
      setSelectedPatient(patient);
    }
  };

  if (selectedPatient) {
    return (
      <PatientDetailView
        patient={selectedPatient}
        onBack={() => setSelectedPatient(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader 
        patientCount={patients.length} 
        totalAlerts={totalAlerts} 
      />

      <DashboardCards
        patientCount={patients.length}
        totalAlerts={totalAlerts}
        totalMissedExchanges={totalMissedExchanges}
      />

      <Tabs defaultValue="patients" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="patients" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Patients</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Alert Center</span>
          </TabsTrigger>
          <TabsTrigger value="labs" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Lab Data</span>
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Communication</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center space-x-2">
            <ClipboardList className="w-4 h-4" />
            <span>Plans</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patients">
          <PatientList
            patients={patients}
            onViewPatient={handleViewPatient}
            onManagePlan={handleManagePlan}
          />
        </TabsContent>

        <TabsContent value="alerts">
          <AlertCenter />
        </TabsContent>

        <TabsContent value="labs">
          <LabOverview 
            patients={patients}
            onViewPatientLabs={handleViewPatientLabs}
          />
        </TabsContent>

        <TabsContent value="communication">
          <CommentSystem />
        </TabsContent>

        <TabsContent value="export">
          <ExportTools />
        </TabsContent>

        <TabsContent value="plans">
          <PlansTab
            patients={patients}
            onManagePlan={handleManagePlan}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={showPlanEditor} onOpenChange={setShowPlanEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <ExchangePlanEditor
            onSave={() => setShowPlanEditor(false)}
            onCancel={() => setShowPlanEditor(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorDashboard;
