import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useNav } from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
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
import PendingPatientRequests from '@/components/PendingPatientRequests';
import DoctorLearningAssignments from '@/components/learning/DoctorLearningAssignments';
import DailySummary from '@/components/DailySummary';
import LearningCenter from '@/components/learning/LearningCenter';
import { Users, AlertTriangle, MessageSquare, Download, ClipboardList, FileText, UserPlus, Loader2, ChevronRight, Settings, BookOpen } from 'lucide-react';

export interface RealPatient {
  id: string;
  name: string;
  age: number;
  adherence: number;
  lastExchange: string;
  alerts: number;
  status: string;
  missedExchanges: number;
  weeklyUF: number;
  hospital?: string;
}

const moreSubItems = [
  { id: 'requests', icon: UserPlus, label: 'Patient Requests', description: 'Pending assignment requests', emoji: '📋' },
  { id: 'learning', icon: BookOpen, label: 'Learning Assignments', description: 'Assign education modules to patients', emoji: '📚' },
  { id: 'preview-education', icon: Eye, label: 'Preview Education Content', description: 'Review all patient learning materials', emoji: '👁️' },
  { id: 'communication', icon: MessageSquare, label: 'Messages', description: 'Patient communications', emoji: '💬' },
  { id: 'export', icon: Download, label: 'Export Data', description: 'Download reports & data', emoji: '📥' },
];

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { activeTab, setActiveTab, setBadgeCounts } = useNav();
  const [showPlanEditor, setShowPlanEditor] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState<RealPatient | null>(null);
  const [patients, setPatients] = useState<RealPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [moreView, setMoreView] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingLabCount, setPendingLabCount] = useState(0);

  // Fetch pending request count
  useEffect(() => {
    if (!user) return;
    const fetchPending = async () => {
      const { count } = await supabase
        .from('doctor_patient_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', user.id)
        .eq('status', 'pending');
      const c = count || 0;
      setPendingCount(c);
      setBadgeCounts(prev => ({ ...prev, more: c }));
    };
    fetchPending();
  }, [user]);

  // Fetch pending labs (unverified)
  useEffect(() => {
    if (!user) return;
    const fetchPendingLabs = async () => {
      const { data: assignments } = await supabase
        .from('doctor_patient_assignments')
        .select('patient_id')
        .eq('doctor_id', user.id)
        .eq('status', 'active');
      if (!assignments?.length) return;
      const patientIds = assignments.map(a => a.patient_id);
      const { count } = await supabase
        .from('lab_results')
        .select('*', { count: 'exact', head: true })
        .in('patient_id', patientIds)
        .is('verified_by', null);
      setPendingLabCount(count || 0);
    };
    fetchPendingLabs();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const { data: assignments, error: assignErr } = await supabase
          .from('doctor_patient_assignments')
          .select('patient_id')
          .eq('doctor_id', user.id)
          .eq('status', 'active');

        if (assignErr) throw assignErr;
        if (!assignments?.length) { setPatients([]); setLoading(false); return; }

        const patientIds = assignments.map(a => a.patient_id);

        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, date_of_birth, hospital')
          .in('user_id', patientIds);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: recentLogs } = await supabase
          .from('exchange_logs')
          .select('patient_id, created_at, ultrafiltration_ml, drain_color')
          .in('patient_id', patientIds)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false });

        const mapped: RealPatient[] = (profiles || []).map(profile => {
          const patientLogs = (recentLogs || []).filter(l => l.patient_id === profile.user_id);
          const weeklyUF = patientLogs.reduce((sum, l) => sum + (l.ultrafiltration_ml || 0), 0);
          const lastLog = patientLogs[0];
          const alerts = patientLogs.filter(l => l.drain_color === 'cloudy').length;
          
          let age = 0;
          if (profile.date_of_birth) {
            const dob = new Date(profile.date_of_birth);
            const today = new Date();
            age = today.getFullYear() - dob.getFullYear();
            if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age--;
          }

          const adherence = Math.min(100, Math.round((patientLogs.length / 28) * 100));
          
          let status = 'good';
          if (alerts > 0) status = 'attention';
          else if (adherence < 75) status = 'attention';
          else if (adherence < 90) status = 'stable';

          let lastExchange = 'No records';
          if (lastLog) {
            const diff = Date.now() - new Date(lastLog.created_at).getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            if (hours < 1) lastExchange = 'Just now';
            else if (hours < 24) lastExchange = `${hours}h ago`;
            else lastExchange = `${Math.floor(hours / 24)}d ago`;
          }

          return {
            id: profile.user_id,
            name: profile.full_name,
            age,
            adherence,
            lastExchange,
            alerts,
            status,
            missedExchanges: Math.max(0, 28 - patientLogs.length),
            weeklyUF,
            hospital: profile.hospital || undefined,
          };
        });

        setPatients(mapped);
      } catch (err) {
        console.error('Failed to load patients:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [user]);

  const totalAlerts = patients.reduce((sum, p) => sum + p.alerts, 0);
  const totalMissedExchanges = patients.reduce((sum, p) => sum + p.missedExchanges, 0);
  const avgAdherence = patients.length > 0 ? Math.round(patients.reduce((sum, p) => sum + p.adherence, 0) / patients.length) : 0;
  const criticalCount = patients.filter(p => p.status === 'attention').length;

  const handleManagePlan = (patient: any) => { setEditingPatient(patient); setShowPlanEditor(true); };
  const handleViewPatient = (patient: any) => setSelectedPatient(patient);
  const handleViewPatientLabs = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) setSelectedPatient(patient);
  };

  if (selectedPatient) {
    return <PatientDetailView patient={selectedPatient} onBack={() => setSelectedPatient(null)} />;
  }

  const tabItems = [
    { value: 'patients', icon: Users, label: 'Patients', badge: 0 },
    { value: 'alerts', icon: AlertTriangle, label: 'Alerts', badge: totalAlerts },
    { value: 'labs', icon: FileText, label: 'Labs', badge: pendingLabCount },
    { value: 'plans', icon: ClipboardList, label: 'Plans', badge: 0 },
    { value: 'more', icon: Settings, label: 'More', badge: pendingCount },
  ];

  const renderMoreContent = () => {
    if (!moreView) {
      return (
        <div className="space-y-2">
          {moreSubItems.map(({ id, icon: Icon, label, description, emoji }) => (
            <button
              key={id}
              onClick={() => setMoreView(id)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all group text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <span className="text-xl">{emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  {id === 'requests' && pendingCount > 0 && (
                    <span className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5">
                      {pendingCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <button
          onClick={() => setMoreView(null)}
          className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back
        </button>
        {moreView === 'requests' && <PendingPatientRequests />}
        {moreView === 'learning' && <DoctorLearningAssignments />}
        {moreView === 'preview-education' && <LearningCenter />}
        {moreView === 'communication' && <CommentSystem patients={patients} />}
        {moreView === 'export' && <ExportTools />}
        {moreView === 'export' && <ExportTools />}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <DailySummary />
      <DashboardHeader patientCount={patients.length} totalAlerts={totalAlerts} avgAdherence={avgAdherence} criticalCount={criticalCount} />
      <DashboardCards patientCount={patients.length} totalAlerts={totalAlerts} totalMissedExchanges={totalMissedExchanges} avgAdherence={avgAdherence} criticalCount={criticalCount} pendingLabCount={pendingLabCount} />

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); if (v !== 'more') setMoreView(null); }} className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 no-scrollbar">
          <TabsList className="inline-flex w-max gap-1 bg-muted/50 p-1 rounded-2xl">
            {tabItems.map(({ value, icon: Icon, label, badge }) => (
              <TabsTrigger key={value} value={value} className="relative flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap">
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{label}</span>
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
                    {badge}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="patients">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <PatientList patients={patients} onViewPatient={handleViewPatient} onManagePlan={handleManagePlan} />
          )}
        </TabsContent>
        <TabsContent value="alerts"><AlertCenter /></TabsContent>
        <TabsContent value="labs"><LabOverview patients={patients} onViewPatientLabs={handleViewPatientLabs} /></TabsContent>
        <TabsContent value="plans"><PlansTab patients={patients} onManagePlan={handleManagePlan} /></TabsContent>
        <TabsContent value="more">{renderMoreContent()}</TabsContent>
      </Tabs>

      <Dialog open={showPlanEditor} onOpenChange={setShowPlanEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <ExchangePlanEditor patientId={editingPatient?.id} patientName={editingPatient?.name} onSave={() => setShowPlanEditor(false)} onCancel={() => setShowPlanEditor(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorDashboard;
