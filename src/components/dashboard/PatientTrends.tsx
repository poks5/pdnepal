import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Droplets, Weight, Activity, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface TrendPoint {
  date: string;
  label: string;
  uf: number | null;
  weight: number | null;
  systolic: number | null;
  diastolic: number | null;
}

interface TrendAlert {
  message: string;
  severity: 'ok' | 'warning' | 'critical';
  tip: string;
}

const PatientTrends: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<TrendPoint[]>([]);
  const [alerts, setAlerts] = useState<TrendAlert[]>([]);
  const [activeChart, setActiveChart] = useState<'uf' | 'weight' | 'bp'>('uf');

  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: logs } = await supabase
        .from('exchange_logs')
        .select('created_at, ultrafiltration_ml, weight_after_kg, blood_pressure_systolic, blood_pressure_diastolic')
        .eq('patient_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (!logs?.length) return;

      // Aggregate by day
      const byDay = new Map<string, { ufs: number[]; weights: number[]; sys: number[]; dia: number[] }>();
      for (const l of logs) {
        const d = new Date(l.created_at).toLocaleDateString('en-CA');
        if (!byDay.has(d)) byDay.set(d, { ufs: [], weights: [], sys: [], dia: [] });
        const entry = byDay.get(d)!;
        if (l.ultrafiltration_ml != null) entry.ufs.push(l.ultrafiltration_ml);
        if (l.weight_after_kg != null) entry.weights.push(Number(l.weight_after_kg));
        if (l.blood_pressure_systolic != null) entry.sys.push(l.blood_pressure_systolic);
        if (l.blood_pressure_diastolic != null) entry.dia.push(l.blood_pressure_diastolic);
      }

      const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
      const points: TrendPoint[] = [];
      byDay.forEach((v, date) => {
        points.push({
          date,
          label: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
          uf: v.ufs.length ? v.ufs.reduce((a, b) => a + b, 0) : null, // daily total UF
          weight: avg(v.weights),
          systolic: avg(v.sys),
          diastolic: avg(v.dia),
        });
      });
      setData(points);

      // Generate trend alerts
      const tAlerts: TrendAlert[] = [];
      const recentUFs = points.slice(-7).filter(p => p.uf != null).map(p => p.uf!);
      const recentWeights = points.slice(-7).filter(p => p.weight != null).map(p => p.weight!);

      if (recentUFs.length >= 3) {
        const avgUF = avg(recentUFs)!;
        if (avgUF < 300) tAlerts.push({ message: `Avg daily UF: ${avgUF}ml (low)`, severity: 'critical', tip: 'Consider higher glucose concentration or shorter dwell' });
        else if (avgUF < 750) tAlerts.push({ message: `Avg daily UF: ${avgUF}ml (borderline)`, severity: 'warning', tip: 'Target ≥750ml/day per ISPD guidelines' });
        else tAlerts.push({ message: `Avg daily UF: ${avgUF}ml ✓`, severity: 'ok', tip: 'Daily UF target met' });
      }

      if (recentWeights.length >= 3) {
        const last3 = recentWeights.slice(-3);
        const gain = last3[last3.length - 1] - last3[0];
        if (gain > 2) tAlerts.push({ message: `Weight ↑${gain.toFixed(1)}kg in 3 days`, severity: 'critical', tip: 'Possible fluid overload — check UF & fluid intake' });
        else if (gain > 1) tAlerts.push({ message: `Weight ↑${gain.toFixed(1)}kg in 3 days`, severity: 'warning', tip: 'Monitor fluid balance closely' });
      }

      const recentBP = points.slice(-5).filter(p => p.systolic != null);
      if (recentBP.length >= 3) {
        const avgSys = avg(recentBP.map(p => p.systolic!))!;
        if (avgSys > 140) tAlerts.push({ message: `Avg BP: ${avgSys} mmHg (high)`, severity: 'warning', tip: 'Consult doctor about BP management' });
      }

      setAlerts(tAlerts);
    };

    fetch();
  }, [user]);

  if (data.length < 2) return null;

  const charts = [
    { key: 'uf' as const, label: 'UF', icon: Droplets, color: 'hsl(var(--primary))' },
    { key: 'weight' as const, label: 'Weight', icon: Weight, color: 'hsl(var(--mint))' },
    { key: 'bp' as const, label: 'BP', icon: Activity, color: 'hsl(var(--coral))' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-primary" /> 30-Day Trends
        </h3>
        <div className="flex gap-1">
          {charts.map(c => (
            <button
              key={c.key}
              onClick={() => setActiveChart(c.key)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                activeChart === c.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              <c.icon className="w-3 h-3" />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-3 pt-4">
          <ResponsiveContainer width="100%" height={160}>
            {activeChart === 'bp' ? (
              <LineChart data={data}>
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
                <ReferenceLine y={140} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label={{ value: '140', fontSize: 9 }} />
                <ReferenceLine y={90} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label={{ value: '90', fontSize: 9 }} />
                <Line type="monotone" dataKey="systolic" stroke="hsl(var(--coral))" strokeWidth={2} dot={false} name="Systolic" connectNulls />
                <Line type="monotone" dataKey="diastolic" stroke="hsl(var(--lavender))" strokeWidth={2} dot={false} name="Diastolic" connectNulls />
              </LineChart>
            ) : (
              <LineChart data={data}>
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
                {activeChart === 'uf' && <ReferenceLine y={750} stroke="hsl(var(--mint))" strokeDasharray="3 3" label={{ value: '750ml', fontSize: 9 }} />}
                <Line
                  type="monotone"
                  dataKey={activeChart}
                  stroke={charts.find(c => c.key === activeChart)?.color}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Trend Interpretations */}
      {alerts.length > 0 && (
        <div className="space-y-1.5">
          {alerts.map((a, i) => (
            <div key={i} className={`flex items-start gap-2 px-3 py-2 rounded-xl text-xs border ${
              a.severity === 'critical' ? 'bg-destructive/5 border-destructive/20' :
              a.severity === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800/30' :
              'bg-[hsl(var(--mint))]/5 border-[hsl(var(--mint))]/20'
            }`}>
              {a.severity === 'ok'
                ? <CheckCircle className="w-3.5 h-3.5 text-[hsl(var(--mint))] mt-0.5 shrink-0" />
                : <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${a.severity === 'critical' ? 'text-destructive' : 'text-yellow-600 dark:text-yellow-400'}`} />
              }
              <div>
                <p className="font-semibold text-foreground">{a.message}</p>
                <p className="text-muted-foreground">{a.tip}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientTrends;
