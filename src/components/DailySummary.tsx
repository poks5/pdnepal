import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sun, AlertTriangle, Activity, Users, TrendingDown, TrendingUp,
  Beaker, UserPlus, X, ChevronRight, Loader2
} from 'lucide-react';

interface SummaryData {
  totalPatients: number;
  exchangesLast24h: number;
  avgAdherence: number;
  missedExchanges: number;
  unacknowledgedAlerts: number;
  criticalAlerts: number;
  newInfections: number;
  abnormalLabs: number;
  pendingRequests: number;
  inactivePatients: string[];
  lowAdherencePatients: string[];
  cloudyDrainPatients: string[];
}

const DISMISS_KEY = 'daily_summary_dismissed';

const DailySummary: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SummaryData | null>(null);

  useEffect(() => {
    if (!user) return;
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedDate = new Date(dismissed).toDateString();
      if (dismissedDate === new Date().toDateString()) return;
    }
    fetchSummary();
  }, [user]);

  const fetchSummary = async () => {
    if (!user) return;
    setLoading(true);
    setOpen(true);

    try {
      const { data: assignments } = await supabase
        .from('doctor_patient_assignments')
        .select('patient_id')
        .eq('doctor_id', user.id)
        .eq('status', 'active');

      const patientIds = assignments?.map(a => a.patient_id) || [];
      const totalPatients = patientIds.length;

      if (!totalPatients) {
        setData({
          totalPatients: 0, exchangesLast24h: 0, avgAdherence: 0, missedExchanges: 0,
          unacknowledgedAlerts: 0, criticalAlerts: 0, newInfections: 0, abnormalLabs: 0,
          pendingRequests: 0, inactivePatients: [], lowAdherencePatients: [], cloudyDrainPatients: [],
        });
        setLoading(false);
        return;
      }

      const now = new Date();
      const h24 = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const h7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Parallel fetches
      const [logsRes, alertsRes, infectionsRes, labsRes, pendingRes, profilesRes] = await Promise.all([
        supabase.from('exchange_logs').select('patient_id, created_at, ultrafiltration_ml, drain_color')
          .in('patient_id', patientIds).gte('created_at', h7d),
        supabase.from('clinical_alerts').select('severity, patient_id')
          .in('patient_id', patientIds).eq('acknowledged', false),
        supabase.from('peritonitis_episodes').select('id')
          .in('patient_id', patientIds).gte('created_at', h24),
        supabase.from('lab_results').select('id')
          .in('patient_id', patientIds).is('verified_by', null),
        supabase.from('doctor_patient_assignments').select('id', { count: 'exact', head: true })
          .eq('doctor_id', user.id).eq('status', 'pending'),
        supabase.from('profiles').select('user_id, full_name')
          .in('user_id', patientIds),
      ]);

      const logs = logsRes.data || [];
      const alerts = alertsRes.data || [];
      const nameMap = new Map((profilesRes.data || []).map(p => [p.user_id, p.full_name]));

      const last24hLogs = logs.filter(l => new Date(l.created_at) >= new Date(h24));
      const exchangesLast24h = last24hLogs.length;

      // Per-patient adherence (7 days, expected 4/day = 28)
      const patientLogCounts = new Map<string, number>();
      const cloudyPatientIds = new Set<string>();
      logs.forEach(l => {
        patientLogCounts.set(l.patient_id, (patientLogCounts.get(l.patient_id) || 0) + 1);
        if (l.drain_color === 'cloudy') cloudyPatientIds.add(l.patient_id);
      });

      let totalAdherence = 0;
      let missedTotal = 0;
      const lowAdh: string[] = [];
      const inactive: string[] = [];

      patientIds.forEach(pid => {
        const count = patientLogCounts.get(pid) || 0;
        const adh = Math.min(100, Math.round((count / 28) * 100));
        totalAdherence += adh;
        missedTotal += Math.max(0, 28 - count);
        if (adh < 60) lowAdh.push(nameMap.get(pid) || pid.slice(0, 8));
        if (count === 0) inactive.push(nameMap.get(pid) || pid.slice(0, 8));
      });

      setData({
        totalPatients,
        exchangesLast24h,
        avgAdherence: totalPatients ? Math.round(totalAdherence / totalPatients) : 0,
        missedExchanges: missedTotal,
        unacknowledgedAlerts: alerts.length,
        criticalAlerts: alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length,
        newInfections: infectionsRes.data?.length || 0,
        abnormalLabs: labsRes.data?.length || 0,
        pendingRequests: pendingRes.count || 0,
        inactivePatients: inactive,
        lowAdherencePatients: lowAdh,
        cloudyDrainPatients: [...cloudyPatientIds].map(id => nameMap.get(id) || id.slice(0, 8)),
      });
    } catch (err) {
      console.error('Daily summary fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, new Date().toISOString());
    setOpen(false);
  };

  if (!open) return null;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground relative">
          <button onClick={handleDismiss} className="absolute top-4 right-4 p-1 rounded-full hover:bg-primary-foreground/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Sun className="w-7 h-7 text-yellow-300" />
            <h2 className="text-xl font-bold">{greeting}, Doctor</h2>
          </div>
          <p className="text-sm text-primary-foreground/80">
            Here's your daily patient summary — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : data ? (
          <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon={<Users className="w-4 h-4" />} label="Patients" value={data.totalPatients} />
              <StatCard icon={<Activity className="w-4 h-4" />} label="24h Exchanges" value={data.exchangesLast24h} />
              <StatCard
                icon={data.avgAdherence >= 80 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                label="Avg Adherence"
                value={`${data.avgAdherence}%`}
                variant={data.avgAdherence >= 80 ? 'success' : data.avgAdherence >= 60 ? 'warning' : 'danger'}
              />
            </div>

            {/* Alerts Section */}
            {(data.unacknowledgedAlerts > 0 || data.criticalAlerts > 0 || data.newInfections > 0) && (
              <Card className="p-4 border-destructive/30 bg-destructive/5">
                <h3 className="text-sm font-semibold text-destructive flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4" /> Clinical Alerts
                </h3>
                <div className="space-y-2">
                  {data.criticalAlerts > 0 && (
                    <AlertRow label="Critical/High alerts" count={data.criticalAlerts} variant="destructive" />
                  )}
                  {data.unacknowledgedAlerts > 0 && (
                    <AlertRow label="Unacknowledged alerts" count={data.unacknowledgedAlerts} variant="secondary" />
                  )}
                  {data.newInfections > 0 && (
                    <AlertRow label="New peritonitis episodes (24h)" count={data.newInfections} variant="destructive" />
                  )}
                  {data.cloudyDrainPatients.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      ⚠️ Cloudy drains: {data.cloudyDrainPatients.join(', ')}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Labs & Requests */}
            {(data.abnormalLabs > 0 || data.pendingRequests > 0) && (
              <Card className="p-4 border-border/50">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Beaker className="w-4 h-4 text-primary" /> Pending Actions
                </h3>
                <div className="space-y-2">
                  {data.abnormalLabs > 0 && (
                    <AlertRow label="Unverified lab results" count={data.abnormalLabs} variant="outline" />
                  )}
                  {data.pendingRequests > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <UserPlus className="w-3.5 h-3.5 text-primary" />
                      <span className="text-muted-foreground">{data.pendingRequests} pending patient request(s)</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Patient Attention */}
            {(data.lowAdherencePatients.length > 0 || data.inactivePatients.length > 0) && (
              <Card className="p-4 border-amber-300/30 bg-amber-50/50 dark:bg-amber-900/10">
                <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-3">
                  <TrendingDown className="w-4 h-4" /> Patients Needing Attention
                </h3>
                {data.lowAdherencePatients.length > 0 && (
                  <div className="text-xs text-muted-foreground mb-1.5">
                    📉 Low adherence: {data.lowAdherencePatients.join(', ')}
                  </div>
                )}
                {data.inactivePatients.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    🔕 No exchanges this week: {data.inactivePatients.join(', ')}
                  </div>
                )}
              </Card>
            )}

            {/* All clear */}
            {data.unacknowledgedAlerts === 0 && data.abnormalLabs === 0 && data.pendingRequests === 0 &&
             data.lowAdherencePatients.length === 0 && data.inactivePatients.length === 0 && (
              <Card className="p-6 text-center border-green-300/30 bg-green-50/50 dark:bg-green-900/10">
                <p className="text-2xl mb-2">✅</p>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">All patients are on track!</p>
                <p className="text-xs text-muted-foreground mt-1">No critical issues detected.</p>
              </Card>
            )}
          </div>
        ) : null}

        <div className="p-4 border-t border-border/50 flex justify-end">
          <Button onClick={handleDismiss} variant="default" size="sm" className="rounded-xl">
            Got it <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode; label: string; value: string | number;
  variant?: 'success' | 'warning' | 'danger';
}> = ({ icon, label, value, variant }) => {
  const colorClass = variant === 'success' ? 'text-green-600 dark:text-green-400'
    : variant === 'warning' ? 'text-amber-600 dark:text-amber-400'
    : variant === 'danger' ? 'text-destructive' : 'text-foreground';

  return (
    <Card className="p-3 text-center">
      <div className="flex justify-center mb-1 text-muted-foreground">{icon}</div>
      <p className={`text-lg font-bold ${colorClass}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </Card>
  );
};

const AlertRow: React.FC<{ label: string; count: number; variant: "destructive" | "secondary" | "outline" }> = ({ label, count, variant }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-muted-foreground">{label}</span>
    <Badge variant={variant} className="text-[10px] h-5">{count}</Badge>
  </div>
);

export default DailySummary;
