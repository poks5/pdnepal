import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Calendar, AlertTriangle, User, BookOpen, Loader2, RefreshCw } from 'lucide-react';
import LearningCenter from './learning/LearningCenter';
import { usePrescription } from '@/hooks/usePrescription';
import PDProgressIndicator from './dashboard/PDProgressIndicator';

interface AssignedPatient {
  id: string;
  name: string;
  relationship: string;
}

interface ExchangeLog {
  id: string;
  exchange_type: string;
  drain_color: string | null;
  created_at: string;
  fill_volume_ml: number;
  drain_volume_ml: number | null;
  ultrafiltration_ml: number | null;
}

interface ClinicalAlert {
  id: string;
  title: string;
  message: string;
  severity: string;
  created_at: string;
  acknowledged: boolean;
}

const CaregiverDashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [caregiverTab, setCaregiverTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<AssignedPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<AssignedPatient | null>(null);
  const [todayExchanges, setTodayExchanges] = useState<ExchangeLog[]>([]);
  const [weekExchanges, setWeekExchanges] = useState<ExchangeLog[]>([]);
  const [alerts, setAlerts] = useState<ClinicalAlert[]>([]);

  // Fetch assigned patients
  useEffect(() => {
    if (!user) return;
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const { data: assignments } = await supabase
          .from('caregiver_patient_assignments')
          .select('patient_id, relationship')
          .eq('caregiver_id', user.id)
          .eq('status', 'active');

        if (!assignments?.length) {
          setPatients([]);
          setLoading(false);
          return;
        }

        const patientIds = assignments.map(a => a.patient_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', patientIds);

        const mapped: AssignedPatient[] = (profiles || []).map(p => {
          const assignment = assignments.find(a => a.patient_id === p.user_id);
          return {
            id: p.user_id,
            name: p.full_name,
            relationship: assignment?.relationship || '',
          };
        });

        setPatients(mapped);
        if (mapped.length > 0) setSelectedPatient(mapped[0]);
      } catch (err) {
        console.error('Failed to load caregiver assignments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [user]);

  // Fetch patient data when selected patient changes
  useEffect(() => {
    if (!selectedPatient) return;
    const fetchPatientData = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [exchangeRes, alertRes] = await Promise.all([
        supabase
          .from('exchange_logs')
          .select('id, exchange_type, drain_color, created_at, fill_volume_ml, drain_volume_ml, ultrafiltration_ml')
          .eq('patient_id', selectedPatient.id)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false }),
        supabase
          .from('clinical_alerts')
          .select('id, title, message, severity, created_at, acknowledged')
          .eq('patient_id', selectedPatient.id)
          .eq('acknowledged', false)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      const allExchanges = (exchangeRes.data || []) as ExchangeLog[];
      setWeekExchanges(allExchanges);
      setTodayExchanges(allExchanges.filter(e => new Date(e.created_at) >= today));
      setAlerts((alertRes.data || []) as ClinicalAlert[]);
    };
    fetchPatientData();
  }, [selectedPatient]);

  const dailyTarget = 4;
  const completedToday = todayExchanges.length;
  const adherencePercent = Math.round((completedToday / dailyTarget) * 100);
  const weeklyAdherence = Math.min(100, Math.round((weekExchanges.length / (dailyTarget * 7)) * 100));

  // Schedule display
  const exchangeTimes = ['06:00', '12:00', '18:00', '22:00'];
  const schedule = exchangeTimes.map((time, idx) => {
    const log = todayExchanges[idx];
    return {
      time,
      type: ['morning', 'afternoon', 'evening', 'night'][idx],
      completed: idx < completedToday,
      clarity: log?.drain_color || null,
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Heart className="w-16 h-16 text-muted-foreground/40" />
        <h2 className="text-xl font-bold text-foreground">
          {language === 'en' ? 'No Patient Assigned' : 'कुनै बिरामी तोकिएको छैन'}
        </h2>
        <p className="text-muted-foreground text-center max-w-sm">
          {language === 'en'
            ? 'Ask your patient to add you as a caregiver from their Settings → Caregivers section.'
            : 'तपाईंको बिरामीलाई सेटिङ्स → हेरचाहकर्ता खण्डबाट तपाईंलाई हेरचाहकर्ताको रूपमा थप्न भन्नुहोस्।'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={caregiverTab} onValueChange={setCaregiverTab}>
        <div className="overflow-x-auto -mx-4 px-4 no-scrollbar">
          <TabsList className="inline-flex w-max gap-1 bg-muted/50 p-1 rounded-2xl">
            <TabsTrigger value="overview" className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap">
              <Heart className="w-3.5 h-3.5" /> {t('overview')}
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap">
              <BookOpen className="w-3.5 h-3.5" /> {language === 'en' ? 'Learning' : 'सिकाइ'}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="learning">
          <LearningCenter />
        </TabsContent>

        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-[hsl(var(--lavender))] to-primary rounded-xl p-6 text-primary-foreground">
              <h1 className="text-2xl font-bold mb-2">
                {t('welcome')}, {user?.fullName?.split(' ')[0] || ''}!
              </h1>
              <p className="opacity-85">
                {language === 'en' ? 'Caring for' : 'हेरचाह गर्दै'} {selectedPatient?.name}
                {selectedPatient?.relationship ? ` (${selectedPatient.relationship})` : ''}
              </p>
              <div className="mt-4 flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">{language === 'en' ? 'Caregiver Dashboard' : 'हेरचाहकर्ता ड्यासबोर्ड'}</span>
                </div>
                <Badge className="bg-primary-foreground/20 text-primary-foreground border-0">
                  {language === 'en' ? 'Read-only Access' : 'हेर्ने मात्र'}
                </Badge>
              </div>

              {/* Patient selector if multiple */}
              {patients.length > 1 && (
                <div className="mt-4 flex gap-2 flex-wrap">
                  {patients.map(p => (
                    <Button
                      key={p.id}
                      size="sm"
                      variant={selectedPatient?.id === p.id ? 'secondary' : 'ghost'}
                      className="text-xs rounded-full"
                      onClick={() => setSelectedPatient(p)}
                    >
                      {p.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Patient Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>{language === 'en' ? 'Patient Status' : 'बिरामीको स्थिति'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{language === 'en' ? "Today's Progress" : 'आजको प्रगति'}</span>
                        <span>{completedToday}/{dailyTarget}</span>
                      </div>
                      <Progress value={adherencePercent} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{weeklyAdherence}%</div>
                        <div className="text-xs text-muted-foreground">{language === 'en' ? 'Weekly Adherence' : 'साप्ताहिक पालना'}</div>
                      </div>
                      <div className="p-3 bg-destructive/10 rounded-lg">
                        <div className="text-2xl font-bold text-destructive">{alerts.length}</div>
                        <div className="text-xs text-muted-foreground">{language === 'en' ? 'Active Alerts' : 'सक्रिय अलर्ट'}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <RefreshCw className="w-5 h-5" />
                    <span>{language === 'en' ? 'This Week Summary' : 'यो हप्ताको सारांश'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{language === 'en' ? 'Total Exchanges' : 'कुल एक्सचेन्ज'}</span>
                      <span className="font-bold">{weekExchanges.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{language === 'en' ? 'Avg UF' : 'औसत UF'}</span>
                      <span className="font-bold">
                        {weekExchanges.length > 0
                          ? `${Math.round(weekExchanges.reduce((s, e) => s + (e.ultrafiltration_ml || 0), 0) / weekExchanges.length)} ml`
                          : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{language === 'en' ? 'Cloudy Drains' : 'धमिलो ड्रेन'}</span>
                      <span className={`font-bold ${weekExchanges.filter(e => e.drain_color === 'cloudy').length > 0 ? 'text-destructive' : 'text-accent'}`}>
                        {weekExchanges.filter(e => e.drain_color === 'cloudy').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's Exchange Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>{language === 'en' ? "Today's Exchange Schedule" : 'आजको एक्सचेन्ज तालिका'}</span>
                </CardTitle>
                <CardDescription>
                  {language === 'en' ? "Monitor your loved one's dialysis exchanges" : 'तपाईंको प्रियजनको डायलिसिस एक्सचेन्ज निगरानी गर्नुहोस्'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schedule.map((exchange, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        exchange.completed
                          ? 'border-accent/30 bg-accent/5'
                          : 'border-border bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            exchange.completed ? 'bg-accent' : 'bg-muted-foreground/30'
                          }`} />
                          <div>
                            <p className="font-medium text-foreground">
                              {exchange.time} - {t(exchange.type)}
                            </p>
                            {exchange.completed && exchange.clarity && (
                              <p className="text-sm text-muted-foreground">
                                {language === 'en' ? 'Clarity' : 'स्पष्टता'}: {exchange.clarity}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={exchange.completed ? "default" : "secondary"}
                          className={exchange.completed ? "bg-accent/15 text-accent border-0" : ""}
                        >
                          {exchange.completed ? t('completed') : t('pending')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Alerts */}
            {alerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <span>{language === 'en' ? 'Active Alerts' : 'सक्रिय अलर्टहरू'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alerts.map(alert => (
                      <div key={alert.id} className={`flex items-start space-x-3 p-3 rounded-lg ${
                        alert.severity === 'critical' ? 'bg-destructive/10' :
                        alert.severity === 'high' ? 'bg-[hsl(var(--coral))]/10' : 'bg-primary/5'
                      }`}>
                        <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                          alert.severity === 'critical' ? 'text-destructive' : 'text-[hsl(var(--coral))]'
                        }`} />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{alert.title}</p>
                          <p className="text-xs text-muted-foreground">{alert.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No alerts state */}
            {alerts.length === 0 && (
              <Card className="border-accent/20 bg-accent/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                  <p className="text-sm text-foreground font-medium">
                    {language === 'en' ? 'No active alerts — everything looks good!' : 'कुनै सक्रिय अलर्ट छैन — सबै ठीक देखिन्छ!'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CaregiverDashboard;
