import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, LineChart, Line, ReferenceLine } from 'recharts';
import {
  ArrowLeft, AlertTriangle, FileText, TrendingUp, Droplets,
  Plus, Loader2, CheckCircle2, Bell, Scale, Activity, Heart,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import LabDataManagement from '@/components/LabDataManagement';
import PDProgressIndicator from '@/components/dashboard/PDProgressIndicator';
import { usePrescription } from '@/hooks/usePrescription';
import PETTestEntry from '@/components/clinical/PETTestEntry';
import KtVCalculator from '@/components/clinical/KtVCalculator';

interface PatientDetailViewProps {
  patient: any;
  onBack: () => void;
}

interface ExchangeRow {
  id: string;
  created_at: string;
  drain_volume_ml: number | null;
  fill_volume_ml: number;
  ultrafiltration_ml: number | null;
  drain_color: string | null;
  exchange_type: string;
  weight_after_kg: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  pain_level: number | null;
  solution_type: string;
  notes: string | null;
  symptoms: string[] | null;
}

interface ClinicalAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  details: string | null;
  acknowledged: boolean;
  acknowledged_at: string | null;
  created_at: string;
}

const severityConfig: Record<string, { bg: string; text: string; icon: string }> = {
  critical: { bg: 'bg-destructive/10', text: 'text-destructive', icon: '🔴' },
  high: { bg: 'bg-amber-500/10', text: 'text-amber-600', icon: '🟠' },
  medium: { bg: 'bg-primary/10', text: 'text-primary', icon: '🟡' },
  low: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: '🟢' },
};

const chartConfig = {
  uf: { label: 'UF (ml)', color: 'hsl(var(--primary))' },
  weight: { label: 'Weight (kg)', color: 'hsl(var(--peach))' },
  systolic: { label: 'Systolic', color: 'hsl(var(--coral))' },
  diastolic: { label: 'Diastolic', color: 'hsl(var(--primary))' },
};

const PatientDetailView: React.FC<PatientDetailViewProps> = ({ patient, onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { dailyExchanges } = usePrescription(patient.id);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showLabDialog, setShowLabDialog] = useState(false);
  const [exchanges, setExchanges] = useState<ExchangeRow[]>([]);
  const [alerts, setAlerts] = useState<ClinicalAlert[]>([]);
  const [loadingExchanges, setLoadingExchanges] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);

  // Fetch exchanges (last 90 days for trends)
  useEffect(() => {
    const fetchExchanges = async () => {
      setLoadingExchanges(true);
      try {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 90);
        const { data, error } = await supabase
          .from('exchange_logs')
          .select('id, created_at, drain_volume_ml, fill_volume_ml, ultrafiltration_ml, drain_color, exchange_type, weight_after_kg, blood_pressure_systolic, blood_pressure_diastolic, pain_level, solution_type, notes, symptoms')
          .eq('patient_id', patient.id)
          .gte('created_at', cutoff.toISOString())
          .order('created_at', { ascending: false });
        if (error) throw error;
        setExchanges(data || []);
      } catch (err) {
        console.error('Failed to load exchanges:', err);
      } finally {
        setLoadingExchanges(false);
      }
    };
    fetchExchanges();
  }, [patient.id]);

  // Fetch clinical alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      setLoadingAlerts(true);
      try {
        const { data, error } = await supabase
          .from('clinical_alerts')
          .select('*')
          .eq('patient_id', patient.id)
          .order('created_at', { ascending: false })
          .limit(50);
        if (error) throw error;
        setAlerts(data || []);
      } catch (err) {
        console.error('Failed to load alerts:', err);
      } finally {
        setLoadingAlerts(false);
      }
    };
    fetchAlerts();
  }, [patient.id]);

  // Acknowledge alert
  const acknowledgeAlert = async (alertId: string) => {
    if (!user) return;
    setAcknowledgingId(alertId);
    try {
      const { error } = await supabase
        .from('clinical_alerts')
        .update({ acknowledged: true, acknowledged_by: user.id, acknowledged_at: new Date().toISOString() })
        .eq('id', alertId);
      if (error) throw error;
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true, acknowledged_at: new Date().toISOString() } : a));
      toast({ title: 'Alert acknowledged', description: 'Marked as reviewed' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to acknowledge alert', variant: 'destructive' });
    } finally {
      setAcknowledgingId(null);
    }
  };

  // Trend data computation
  const { ufData, weightData, bpData, trendAlerts } = useMemo(() => {
    const sorted = [...exchanges].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // Daily UF
    const dailyUF = new Map<string, number>();
    sorted.forEach(ex => {
      const date = new Date(ex.created_at).toISOString().split('T')[0];
      dailyUF.set(date, (dailyUF.get(date) || 0) + (ex.ultrafiltration_ml || 0));
    });
    const ufData = Array.from(dailyUF.entries()).map(([date, uf]) => ({ date, uf, target: 500 }));

    // Weight trend
    const dailyWeight = new Map<string, number[]>();
    sorted.forEach(ex => {
      if (ex.weight_after_kg) {
        const date = new Date(ex.created_at).toISOString().split('T')[0];
        const prev = dailyWeight.get(date) || [];
        prev.push(Number(ex.weight_after_kg));
        dailyWeight.set(date, prev);
      }
    });
    const weightData = Array.from(dailyWeight.entries())
      .map(([date, ws]) => ({ date, weight: Math.round((ws.reduce((s, w) => s + w, 0) / ws.length) * 10) / 10 }));

    // BP trend
    const dailyBP = new Map<string, { sys: number[]; dia: number[] }>();
    sorted.forEach(ex => {
      if (ex.blood_pressure_systolic && ex.blood_pressure_diastolic) {
        const date = new Date(ex.created_at).toISOString().split('T')[0];
        const prev = dailyBP.get(date) || { sys: [], dia: [] };
        prev.sys.push(ex.blood_pressure_systolic);
        prev.dia.push(ex.blood_pressure_diastolic);
        dailyBP.set(date, prev);
      }
    });
    const bpData = Array.from(dailyBP.entries())
      .map(([date, { sys, dia }]) => ({
        date,
        systolic: Math.round(sys.reduce((s, v) => s + v, 0) / sys.length),
        diastolic: Math.round(dia.reduce((s, v) => s + v, 0) / dia.length),
      }));

    // Trend-based alerts
    const trendAlerts: { message: string; tip: string; severity: string }[] = [];
    const recent7UF = ufData.slice(-7);
    if (recent7UF.length >= 3) {
      const avgUF = Math.round(recent7UF.reduce((s, d) => s + d.uf, 0) / recent7UF.length);
      if (avgUF < 300) trendAlerts.push({ message: `Avg daily UF only ${avgUF}ml (last 7 days)`, tip: 'Consider reviewing dialysate strength or dwell time', severity: 'high' });
    }
    if (weightData.length >= 3) {
      const last3 = weightData.slice(-3);
      const gain = last3[last3.length - 1].weight - last3[0].weight;
      if (gain > 2) trendAlerts.push({ message: `Weight gain ${gain.toFixed(1)}kg over 3 days`, tip: 'Possible fluid overload — monitor UF and intake', severity: 'critical' });
    }
    if (bpData.length > 0) {
      const latest = bpData[bpData.length - 1];
      if (latest.systolic > 160 || latest.diastolic > 100) {
        trendAlerts.push({ message: `BP ${latest.systolic}/${latest.diastolic} — hypertensive`, tip: 'Review antihypertensives and fluid status', severity: 'critical' });
      } else if (latest.systolic > 140 || latest.diastolic > 90) {
        trendAlerts.push({ message: `BP elevated: ${latest.systolic}/${latest.diastolic}`, tip: 'Monitor closely and consider adjustment', severity: 'high' });
      }
    }

    return { ufData, weightData, bpData, trendAlerts };
  }, [exchanges]);

  const complications = exchanges.filter(e => e.drain_color === 'cloudy');
  const activeAlerts = alerts.filter(a => !a.acknowledged);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayExchangeCount = exchanges.filter(e => new Date(e.created_at) >= todayStart).length;

  const statusConfig: Record<string, { bg: string; text: string }> = {
    good: { bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
    stable: { bg: 'bg-primary/10', text: 'text-primary' },
    attention: { bg: 'bg-destructive/10', text: 'text-destructive' },
  };
  const status = statusConfig[patient.status] || statusConfig.stable;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="outline" size="icon" onClick={onBack} className="rounded-xl shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{patient.name}</h1>
            <p className="text-xs text-muted-foreground">
              {patient.age > 0 ? `Age ${patient.age}` : ''}
              {patient.hospital ? ` · ${patient.hospital}` : ''}
              {` · ID: ${patient.id.slice(0, 8)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {activeAlerts.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              <Bell className="w-3 h-3 mr-1" />{activeAlerts.length}
            </Badge>
          )}
          <Badge className={`${status.bg} ${status.text} border-0 capitalize`}>{patient.status}</Badge>
        </div>
      </div>

      {/* Trend alerts banner */}
      {trendAlerts.length > 0 && (
        <div className="space-y-2">
          {trendAlerts.map((ta, i) => {
            const sev = severityConfig[ta.severity] || severityConfig.medium;
            return (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-2xl ${sev.bg} border border-border/30`}>
                <span className="text-sm mt-0.5">{sev.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${sev.text}`}>{ta.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{ta.tip}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-5">
        <div className="overflow-x-auto -mx-4 px-4 no-scrollbar">
          <TabsList className="inline-flex w-max gap-1 bg-muted/50 p-1 rounded-2xl">
            <TabsTrigger value="overview" className="rounded-xl text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" />Overview
            </TabsTrigger>
            <TabsTrigger value="trends" className="rounded-xl text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Activity className="w-3.5 h-3.5 mr-1.5" />Trends
            </TabsTrigger>
            <TabsTrigger value="alerts" className="relative rounded-xl text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Bell className="w-3.5 h-3.5 mr-1.5" />Alerts
              {activeAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
                  {activeAlerts.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="exchanges" className="rounded-xl text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Droplets className="w-3.5 h-3.5 mr-1.5" />Exchanges
            </TabsTrigger>
            <TabsTrigger value="labs" className="rounded-xl text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <FileText className="w-3.5 h-3.5 mr-1.5" />Labs
            </TabsTrigger>
            <TabsTrigger value="adequacy" className="rounded-xl text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Calculator className="w-3.5 h-3.5 mr-1.5" />PET/Kt/V
            </TabsTrigger>
          </TabsList>
        </div>

        {/* OVERVIEW */}
        <TabsContent value="overview">
          <PDProgressIndicator completed={todayExchangeCount} prescribed={dailyExchanges} className="mb-5" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Droplets className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Weekly UF</p>
                </div>
                <p className="text-2xl font-bold text-emerald-600">{patient.weeklyUF ? `+${(patient.weeklyUF / 1000).toFixed(1)}L` : 'N/A'}</p>
                <p className="text-xs text-muted-foreground mt-1">Target: 2.0L/week</p>
                <Progress value={patient.weeklyUF ? Math.min(100, (patient.weeklyUF / 2000) * 100) : 0} className="mt-2 h-1.5" />
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Adherence</p>
                </div>
                <p className="text-2xl font-bold text-primary">{patient.adherence}%</p>
                <p className="text-xs text-muted-foreground mt-1">Last 7 days · {dailyExchanges}/day prescribed</p>
                <Progress value={patient.adherence} className="mt-2 h-1.5" />
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Issues</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{complications.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Cloudy effluent events (90 days)</p>
                {complications.length > 0 && (
                  <p className="text-xs text-destructive font-medium mt-2">
                    Latest: {new Date(complications[0].created_at).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TRENDS */}
        <TabsContent value="trends">
          {loadingExchanges ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : exchanges.length === 0 ? (
            <Card className="rounded-2xl border-border/50"><CardContent className="py-12 text-center"><p className="text-muted-foreground">No exchange data available for trend analysis</p></CardContent></Card>
          ) : (
            <div className="space-y-4">
              {/* UF Trend */}
              <Card className="rounded-2xl border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-primary" /> Daily Ultrafiltration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ufData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[240px] sm:h-[280px]">
                      <AreaChart data={ufData}>
                        <defs>
                          <linearGradient id="ufGradDoc" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                        <XAxis dataKey="date" tickFormatter={v => new Date(v).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="uf" stroke="hsl(var(--primary))" fill="url(#ufGradDoc)" strokeWidth={2.5} />
                        <Line type="monotone" dataKey="target" stroke="hsl(var(--mint))" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
                      </AreaChart>
                    </ChartContainer>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">No UF data</p>
                  )}
                </CardContent>
              </Card>

              {/* Weight Trend */}
              <Card className="rounded-2xl border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-600" /> Weight Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weightData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[220px] sm:h-[260px]">
                      <AreaChart data={weightData}>
                        <defs>
                          <linearGradient id="weightGradDoc" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--peach))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--peach))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                        <XAxis dataKey="date" tickFormatter={v => new Date(v).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} domain={['dataMin - 1', 'dataMax + 1']} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="weight" stroke="hsl(var(--peach))" fill="url(#weightGradDoc)" strokeWidth={2.5} />
                      </AreaChart>
                    </ChartContainer>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">No weight data recorded</p>
                  )}
                </CardContent>
              </Card>

              {/* BP Trend */}
              <Card className="rounded-2xl border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Heart className="w-4 h-4 text-destructive" /> Blood Pressure Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bpData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[220px] sm:h-[260px]">
                      <LineChart data={bpData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                        <XAxis dataKey="date" tickFormatter={v => new Date(v).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} domain={[50, 200]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ReferenceLine y={140} stroke="hsl(var(--destructive))" strokeDasharray="4 4" strokeOpacity={0.5} />
                        <ReferenceLine y={90} stroke="hsl(var(--mint))" strokeDasharray="4 4" strokeOpacity={0.5} />
                        <Line type="monotone" dataKey="systolic" stroke="hsl(var(--coral))" strokeWidth={2.5} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="diastolic" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
                      </LineChart>
                    </ChartContainer>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">No blood pressure data recorded</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ALERTS */}
        <TabsContent value="alerts">
          {loadingAlerts ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : alerts.length === 0 ? (
            <Card className="rounded-2xl border-border/50">
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="font-semibold text-foreground">No clinical alerts</p>
                <p className="text-sm text-muted-foreground mt-1">This patient has no active or historical alerts</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeAlerts.length > 0 && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                  Active ({activeAlerts.length})
                </p>
              )}
              {alerts.map(alert => {
                const sev = severityConfig[alert.severity] || severityConfig.medium;
                return (
                  <Card key={alert.id} className={`rounded-2xl border-border/50 shadow-sm ${alert.acknowledged ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-lg mt-0.5">{sev.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-foreground">{alert.title}</p>
                            <Badge className={`${sev.bg} ${sev.text} border-0 text-[10px]`}>{alert.severity}</Badge>
                            {alert.acknowledged && (
                              <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px]">
                                <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />Reviewed
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                          {alert.details && <p className="text-xs text-muted-foreground mt-0.5 italic">{alert.details}</p>}
                          <p className="text-[10px] text-muted-foreground mt-2">
                            {new Date(alert.created_at).toLocaleDateString()} · {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {alert.acknowledged_at && ` · Reviewed ${new Date(alert.acknowledged_at).toLocaleDateString()}`}
                          </p>
                        </div>
                        {!alert.acknowledged && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl text-xs shrink-0"
                            disabled={acknowledgingId === alert.id}
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            {acknowledgingId === alert.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Mark Reviewed
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* EXCHANGES */}
        <TabsContent value="exchanges">
          {loadingExchanges ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : exchanges.length === 0 ? (
            <Card className="rounded-2xl border-border/50"><CardContent className="py-12 text-center"><p className="text-muted-foreground">No exchange records found</p></CardContent></Card>
          ) : (
            <div className="space-y-2">
              {exchanges.slice(0, 30).map((ex) => (
                <Card key={ex.id} className="rounded-2xl border-border/50 shadow-sm">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {new Date(ex.created_at).toLocaleDateString()} · {new Date(ex.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Drain: {ex.drain_volume_ml ?? '—'}ml · Fill: {ex.fill_volume_ml}ml · UF: {ex.ultrafiltration_ml != null ? (ex.ultrafiltration_ml > 0 ? '+' : '') + ex.ultrafiltration_ml : '—'}ml
                          {ex.weight_after_kg ? ` · Wt: ${ex.weight_after_kg}kg` : ''}
                        </p>
                        {ex.notes && <p className="text-xs text-muted-foreground mt-1 italic truncate">{ex.notes}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant="outline" className="text-[10px] capitalize rounded-lg">{ex.exchange_type}</Badge>
                        <Badge className={ex.drain_color === 'cloudy' ? 'bg-destructive/10 text-destructive border-0 text-[10px]' : 'bg-emerald-500/10 text-emerald-600 border-0 text-[10px]'}>
                          {ex.drain_color || 'clear'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {exchanges.length > 30 && (
                <p className="text-xs text-center text-muted-foreground py-2">Showing 30 of {exchanges.length} exchanges</p>
              )}
            </div>
          )}
        </TabsContent>

        {/* LABS */}
        <TabsContent value="labs">
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">Laboratory Data</CardTitle>
                <Button onClick={() => setShowLabDialog(true)} size="sm" className="rounded-xl">
                  <Plus className="w-3.5 h-3.5 mr-1" />Manage Labs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">View and manage lab results for {patient.name}</p>
                <Button onClick={() => setShowLabDialog(true)} variant="outline" className="rounded-xl">Open Lab Data</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showLabDialog} onOpenChange={setShowLabDialog}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lab Data — {patient.name}</DialogTitle>
          </DialogHeader>
          <LabDataManagement patientId={patient.id} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientDetailView;
