import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, TrendingUp, Droplets, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AdequacyMetrics {
  patientId: string;
  patientName: string;
  ktV: number | null;
  ktVDate: string | null;
  weeklyCreatinineClearance: number | null;
  avgDailyUF: number;
  totalWeeklyUF: number;
  rrfEstimate: string;
  overallStatus: 'adequate' | 'borderline' | 'inadequate' | 'no-data';
}

const STATUS_CONFIG = {
  adequate: { label: 'Adequate', color: 'bg-accent/15 text-accent border-accent/30', icon: CheckCircle, dot: 'bg-accent' },
  borderline: { label: 'Borderline', color: 'bg-[hsl(var(--coral))]/15 text-[hsl(var(--coral))] border-[hsl(var(--coral))]/30', icon: AlertTriangle, dot: 'bg-[hsl(var(--coral))]' },
  inadequate: { label: 'Inadequate', color: 'bg-destructive/15 text-destructive border-destructive/30', icon: AlertTriangle, dot: 'bg-destructive' },
  'no-data': { label: 'No Data', color: 'bg-muted text-muted-foreground border-border', icon: Info, dot: 'bg-muted-foreground' },
};

function assessOverallStatus(ktV: number | null, avgDailyUF: number, crClearance: number | null): AdequacyMetrics['overallStatus'] {
  if (ktV === null && crClearance === null && avgDailyUF === 0) return 'no-data';
  
  let score = 0;
  let metrics = 0;
  
  if (ktV !== null) {
    metrics++;
    if (ktV >= 1.7) score += 2;
    else if (ktV >= 1.5) score += 1;
  }
  
  if (crClearance !== null) {
    metrics++;
    if (crClearance >= 50) score += 2;
    else if (crClearance >= 40) score += 1;
  }
  
  if (avgDailyUF > 0) {
    metrics++;
    if (avgDailyUF >= 750) score += 2;
    else if (avgDailyUF >= 500) score += 1;
  }
  
  if (metrics === 0) return 'no-data';
  const avg = score / metrics;
  if (avg >= 1.5) return 'adequate';
  if (avg >= 0.8) return 'borderline';
  return 'inadequate';
}

function estimateRRF(creatinine: number | null, previousCreatinine: number | null): string {
  if (creatinine === null) return 'Unknown';
  if (previousCreatinine !== null) {
    const change = ((creatinine - previousCreatinine) / previousCreatinine) * 100;
    if (change > 20) return 'Declining';
    if (change > 5) return 'Mildly Declining';
    return 'Stable';
  }
  if (creatinine > 8) return 'Low';
  if (creatinine > 4) return 'Moderate';
  return 'Preserved';
}

interface PDAdequacyProps {
  /** If provided, show only this patient's adequacy (patient view) */
  patientId?: string;
  /** If provided, show these patients' adequacy (doctor view) */
  patientIds?: string[];
  /** Patient names map for doctor view */
  patientNames?: Map<string, string>;
}

const PDAdequacy: React.FC<PDAdequacyProps> = ({ patientId, patientIds, patientNames }) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AdequacyMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  const targetIds = useMemo(() => {
    if (patientId) return [patientId];
    if (patientIds?.length) return patientIds;
    return [];
  }, [patientId, patientIds]);

  useEffect(() => {
    if (!targetIds.length) { setLoading(false); return; }
    
    const fetchAdequacy = async () => {
      setLoading(true);
      try {
        // Fetch latest lab results (Kt/V, creatinine)
        const { data: labs } = await supabase
          .from('lab_results')
          .select('patient_id, kt_v, creatinine, test_date')
          .in('patient_id', targetIds)
          .order('test_date', { ascending: false });

        // Fetch exchange logs for last 7 days (UF)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data: exchanges } = await supabase
          .from('exchange_logs')
          .select('patient_id, ultrafiltration_ml, created_at')
          .in('patient_id', targetIds)
          .gte('created_at', sevenDaysAgo.toISOString());

        // Fetch profiles for names if not provided
        let names = patientNames || new Map<string, string>();
        if (!patientNames) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, full_name')
            .in('user_id', targetIds);
          names = new Map((profiles || []).map(p => [p.user_id, p.full_name]));
        }

        const result: AdequacyMetrics[] = targetIds.map(pid => {
          const patientLabs = (labs || []).filter(l => l.patient_id === pid);
          const latestWithKtV = patientLabs.find(l => l.kt_v !== null);
          const latestCreatinine = patientLabs.find(l => l.creatinine !== null);
          const secondCreatinine = patientLabs.filter(l => l.creatinine !== null)[1];

          const patientExchanges = (exchanges || []).filter(e => e.patient_id === pid);
          const totalWeeklyUF = patientExchanges.reduce((sum, e) => sum + (e.ultrafiltration_ml || 0), 0);
          const avgDailyUF = Math.round(totalWeeklyUF / 7);

          // Rough weekly creatinine clearance estimate (simplified)
          let weeklyCreatinineClearance: number | null = null;
          if (latestWithKtV?.kt_v) {
            // Rough estimate: Kt/V * 35 ≈ weekly CrCl in L/week (simplified proxy)
            weeklyCreatinineClearance = Math.round(latestWithKtV.kt_v * 30);
          }

          const rrfEstimate = estimateRRF(
            latestCreatinine?.creatinine ?? null,
            secondCreatinine?.creatinine ?? null
          );

          const overallStatus = assessOverallStatus(
            latestWithKtV?.kt_v ?? null,
            avgDailyUF,
            weeklyCreatinineClearance
          );

          return {
            patientId: pid,
            patientName: names.get(pid) || 'Unknown',
            ktV: latestWithKtV?.kt_v ?? null,
            ktVDate: latestWithKtV?.test_date ?? null,
            weeklyCreatinineClearance: weeklyCreatinineClearance,
            avgDailyUF,
            totalWeeklyUF,
            rrfEstimate,
            overallStatus,
          };
        });

        setMetrics(result);
      } catch (err) {
        console.error('Failed to load adequacy data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdequacy();
  }, [targetIds, patientNames]);

  const summary = useMemo(() => {
    const adequate = metrics.filter(m => m.overallStatus === 'adequate').length;
    const borderline = metrics.filter(m => m.overallStatus === 'borderline').length;
    const inadequate = metrics.filter(m => m.overallStatus === 'inadequate').length;
    const noData = metrics.filter(m => m.overallStatus === 'no-data').length;
    return { adequate, borderline, inadequate, noData };
  }, [metrics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isMultiPatient = targetIds.length > 1;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      {isMultiPatient && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Adequate', count: summary.adequate, color: 'text-accent', bg: 'bg-accent/10', dot: 'bg-accent' },
            { label: 'Borderline', count: summary.borderline, color: 'text-[hsl(var(--coral))]', bg: 'bg-[hsl(var(--coral))]/10', dot: 'bg-[hsl(var(--coral))]' },
            { label: 'Inadequate', count: summary.inadequate, color: 'text-destructive', bg: 'bg-destructive/10', dot: 'bg-destructive' },
            { label: 'No Data', count: summary.noData, color: 'text-muted-foreground', bg: 'bg-muted', dot: 'bg-muted-foreground' },
          ].map(item => (
            <Card key={item.label} className={`${item.bg} border-0`}>
              <CardContent className="p-4 text-center">
                <div className={`flex items-center justify-center gap-1.5 mb-1`}>
                  <div className={`w-2 h-2 rounded-full ${item.dot}`} />
                  <span className={`text-2xl font-bold ${item.color}`}>{item.count}</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ISPD Guidelines Reference */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">ISPD Adequacy Targets</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                <span>Kt/V: ≥1.7/week</span>
                <span>CrCl: ≥50 L/wk/1.73m²</span>
                <span>UF: ≥750 ml/day</span>
                <span>RRF: Monitor trend</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Adequacy Cards */}
      <div className="space-y-3">
        {metrics.map(m => {
          const config = STATUS_CONFIG[m.overallStatus];
          const StatusIcon = config.icon;

          return (
            <Card key={m.patientId} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isMultiPatient && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {m.patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                    )}
                    <div>
                      {isMultiPatient && <p className="text-sm font-semibold text-foreground">{m.patientName}</p>}
                      {!isMultiPatient && <p className="text-sm font-semibold text-foreground">PD Adequacy Assessment</p>}
                    </div>
                  </div>
                  <Badge variant="outline" className={`${config.color} text-xs gap-1`}>
                    <StatusIcon className="w-3 h-3" />
                    {config.label}
                  </Badge>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Kt/V */}
                  <div className="p-3 rounded-xl bg-muted/50 border border-border/30">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Activity className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[11px] font-medium text-muted-foreground">Kt/V</span>
                    </div>
                    <p className={`text-lg font-bold ${
                      m.ktV === null ? 'text-muted-foreground' :
                      m.ktV >= 1.7 ? 'text-accent' :
                      m.ktV >= 1.5 ? 'text-[hsl(var(--coral))]' : 'text-destructive'
                    }`}>
                      {m.ktV !== null ? m.ktV.toFixed(2) : '—'}
                    </p>
                    {m.ktV !== null && (
                      <div className="mt-1">
                        <Progress value={Math.min(100, (m.ktV / 2.0) * 100)} className="h-1.5" />
                        <p className="text-[10px] text-muted-foreground mt-0.5">Target: ≥1.7</p>
                      </div>
                    )}
                    {m.ktVDate && <p className="text-[10px] text-muted-foreground mt-1">Last: {m.ktVDate}</p>}
                  </div>

                  {/* Weekly CrCl */}
                  <div className="p-3 rounded-xl bg-muted/50 border border-border/30">
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingUp className="w-3.5 h-3.5 text-[hsl(var(--lavender))]" />
                      <span className="text-[11px] font-medium text-muted-foreground">CrCl (L/wk)</span>
                    </div>
                    <p className={`text-lg font-bold ${
                      m.weeklyCreatinineClearance === null ? 'text-muted-foreground' :
                      m.weeklyCreatinineClearance >= 50 ? 'text-accent' :
                      m.weeklyCreatinineClearance >= 40 ? 'text-[hsl(var(--coral))]' : 'text-destructive'
                    }`}>
                      {m.weeklyCreatinineClearance !== null ? m.weeklyCreatinineClearance : '—'}
                    </p>
                    {m.weeklyCreatinineClearance !== null && (
                      <div className="mt-1">
                        <Progress value={Math.min(100, (m.weeklyCreatinineClearance / 60) * 100)} className="h-1.5" />
                        <p className="text-[10px] text-muted-foreground mt-0.5">Target: ≥50</p>
                      </div>
                    )}
                  </div>

                  {/* Avg Daily UF */}
                  <div className="p-3 rounded-xl bg-muted/50 border border-border/30">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Droplets className="w-3.5 h-3.5 text-[hsl(var(--sky))]" />
                      <span className="text-[11px] font-medium text-muted-foreground">Avg UF/day</span>
                    </div>
                    <p className={`text-lg font-bold ${
                      m.avgDailyUF === 0 ? 'text-muted-foreground' :
                      m.avgDailyUF >= 750 ? 'text-accent' :
                      m.avgDailyUF >= 500 ? 'text-[hsl(var(--coral))]' : 'text-destructive'
                    }`}>
                      {m.avgDailyUF > 0 ? `${m.avgDailyUF} ml` : '—'}
                    </p>
                    {m.avgDailyUF > 0 && (
                      <div className="mt-1">
                        <Progress value={Math.min(100, (m.avgDailyUF / 1000) * 100)} className="h-1.5" />
                        <p className="text-[10px] text-muted-foreground mt-0.5">Target: ≥750 ml</p>
                      </div>
                    )}
                  </div>

                  {/* RRF */}
                  <div className="p-3 rounded-xl bg-muted/50 border border-border/30">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Activity className="w-3.5 h-3.5 text-[hsl(var(--mint))]" />
                      <span className="text-[11px] font-medium text-muted-foreground">RRF Status</span>
                    </div>
                    <p className={`text-sm font-bold ${
                      m.rrfEstimate === 'Preserved' || m.rrfEstimate === 'Stable' ? 'text-accent' :
                      m.rrfEstimate === 'Moderate' || m.rrfEstimate === 'Mildly Declining' ? 'text-[hsl(var(--coral))]' :
                      m.rrfEstimate === 'Unknown' ? 'text-muted-foreground' : 'text-destructive'
                    }`}>
                      {m.rrfEstimate}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">Based on creatinine trend</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {metrics.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No patients to assess adequacy for.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PDAdequacy;
