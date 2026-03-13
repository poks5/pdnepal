import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Line, BarChart, Bar, LineChart, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Droplets, Activity, Scale } from 'lucide-react';
import { usePatient } from '@/contexts/PatientContext';

const TrendAnalysis: React.FC = () => {
  const { exchangeLogs } = usePatient();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | '3months'>('month');

  const daysBack = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;

  const { ufData, drainColorData, exchangeCountData, weightData, painData, bpData, stats, alerts } = useMemo(() => {
    const cutoff = new Date(Date.now() - daysBack * 86400000);
    const filtered = exchangeLogs.filter(l => new Date(l.timestamp) >= cutoff);

    // Daily UF
    const dailyUF = new Map<string, { uf: number; count: number }>();
    filtered.forEach(log => {
      const date = new Date(log.timestamp).toISOString().split('T')[0];
      const prev = dailyUF.get(date) || { uf: 0, count: 0 };
      dailyUF.set(date, { uf: prev.uf + (log.ultrafiltration || 0), count: prev.count + 1 });
    });

    const ufData = Array.from(dailyUF.entries())
      .map(([date, { uf }]) => ({ date, uf, target: 500 }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Exchange count per day
    const exchangeCountData = Array.from(dailyUF.entries())
      .map(([date, { count }]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Weight trend
    const dailyWeight = new Map<string, number[]>();
    filtered.forEach(log => {
      if (log.weightAfterKg) {
        const date = new Date(log.timestamp).toISOString().split('T')[0];
        const prev = dailyWeight.get(date) || [];
        prev.push(log.weightAfterKg);
        dailyWeight.set(date, prev);
      }
    });
    const weightData = Array.from(dailyWeight.entries())
      .map(([date, weights]) => ({ date, weight: Math.round((weights.reduce((s, w) => s + w, 0) / weights.length) * 10) / 10 }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Pain trend
    const dailyPain = new Map<string, number[]>();
    filtered.forEach(log => {
      if (log.painLevel !== undefined && log.painLevel !== null) {
        const date = new Date(log.timestamp).toISOString().split('T')[0];
        const prev = dailyPain.get(date) || [];
        prev.push(log.painLevel);
        dailyPain.set(date, prev);
      }
    });
    const painData = Array.from(dailyPain.entries())
      .map(([date, pains]) => ({ date, pain: Math.round((pains.reduce((s, p) => s + p, 0) / pains.length) * 10) / 10 }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Blood pressure trend
    const dailyBP = new Map<string, { sys: number[]; dia: number[] }>();
    filtered.forEach(log => {
      if (log.bloodPressureSystolic && log.bloodPressureDiastolic) {
        const date = new Date(log.timestamp).toISOString().split('T')[0];
        const prev = dailyBP.get(date) || { sys: [], dia: [] };
        prev.sys.push(log.bloodPressureSystolic);
        prev.dia.push(log.bloodPressureDiastolic);
        dailyBP.set(date, prev);
      }
    });
    const bpData = Array.from(dailyBP.entries())
      .map(([date, { sys, dia }]) => ({
        date,
        systolic: Math.round(sys.reduce((s, v) => s + v, 0) / sys.length),
        diastolic: Math.round(dia.reduce((s, v) => s + v, 0) / dia.length),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Drain color distribution
    const colorCounts: Record<string, number> = {};
    filtered.forEach(log => {
      const c = log.clarity || 'clear';
      colorCounts[c] = (colorCounts[c] || 0) + 1;
    });
    const drainColorData = Object.entries(colorCounts).map(([name, value]) => ({ name, value }));

    // Stats
    const recent7 = ufData.slice(-7);
    const prev7 = ufData.slice(-14, -7);
    const recentAvg = recent7.length ? Math.round(recent7.reduce((s, d) => s + d.uf, 0) / recent7.length) : 0;
    const prevAvg = prev7.length ? prev7.reduce((s, d) => s + d.uf, 0) / prev7.length : recentAvg;
    const change = prevAvg ? Math.round(((recentAvg - prevAvg) / prevAvg) * 100) : 0;

    const latestWeight = weightData.length ? weightData[weightData.length - 1].weight : null;
    const prevWeight = weightData.length >= 2 ? weightData[weightData.length - 2].weight : null;
    const weightChange = latestWeight && prevWeight ? Math.round((latestWeight - prevWeight) * 10) / 10 : null;

    // Alerts
    const alerts: { type: string; message: string; tip: string }[] = [];
    if (recent7.length >= 5) {
      const declining = recent7.every((d, i) => i === 0 || d.uf <= recent7[i - 1].uf);
      if (declining) alerts.push({ type: 'warning', message: 'UF declining for 7 days', tip: 'Review dialysate strength or dwell time' });
    }
    if (recentAvg > 0 && recentAvg < 300) {
      alerts.push({ type: 'alert', message: 'Average UF below 300ml', tip: 'Consult nephrologist about adequacy' });
    }
    if (weightChange !== null && weightChange > 2) {
      alerts.push({ type: 'warning', message: `Weight increased by ${weightChange}kg`, tip: 'Monitor fluid intake and UF adequacy' });
    }

    return {
      ufData, drainColorData, exchangeCountData, weightData, painData,
      stats: {
        avg: recentAvg, change, trend: change >= 0 ? 'up' : 'down' as const,
        days: ufData.length, total: filtered.length,
        latestWeight, weightChange,
      },
      alerts,
    };
  }, [exchangeLogs, daysBack]);

  const chartConfig = {
    uf: { label: 'UF (ml)', color: 'hsl(var(--primary))' },
    target: { label: 'Target', color: 'hsl(var(--mint))' },
    count: { label: 'Exchanges', color: 'hsl(var(--lavender))' },
    weight: { label: 'Weight (kg)', color: 'hsl(var(--peach))' },
    pain: { label: 'Pain Level', color: 'hsl(var(--coral))' },
  };

  const ranges = [
    { key: 'week' as const, label: '7D' },
    { key: 'month' as const, label: '30D' },
    { key: '3months' as const, label: '90D' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-black text-foreground">📈 Trend Analysis</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Track your PD performance over time</p>
        </div>
        <div className="flex gap-1.5 bg-muted/50 p-1 rounded-full">
          {ranges.map(r => (
            <Button
              key={r.key}
              variant={timeRange === r.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(r.key)}
              className={`rounded-full px-4 h-8 text-xs font-semibold ${timeRange === r.key ? 'shadow-sm' : ''}`}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-destructive/5 border border-destructive/15">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{alert.tip}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Avg UF', value: `${stats.avg}ml`, emoji: '💧', trend: stats.change, trendDir: stats.trend },
          { label: 'Target Hit', value: `${stats.avg > 0 ? Math.round((stats.avg / 500) * 100) : 0}%`, emoji: '🎯' },
          { label: 'Weight', value: stats.latestWeight ? `${stats.latestWeight}kg` : '—', emoji: '⚖️', trend: stats.weightChange !== null ? Math.round((stats.weightChange ?? 0) * 10) : undefined, trendDir: stats.weightChange !== null ? (stats.weightChange! <= 0 ? ('up' as const) : ('down' as const)) : undefined },
          { label: 'Days Tracked', value: stats.days, emoji: '📅' },
          { label: 'Total Exchanges', value: stats.total, emoji: '🔄' },
          { label: 'Drain Quality', value: `${drainColorData.find(d => d.name === 'clear')?.value || 0}/${exchangeLogs.length > 0 ? stats.total : 0}`, emoji: '🧪' },
        ].map(({ label, value, emoji, trend, trendDir }) => (
          <Card key={label} className="rounded-2xl border-border/30 shadow-sm">
            <CardContent className="p-3.5">
              <span className="text-lg">{emoji}</span>
              <p className="text-lg font-black text-foreground mt-1 leading-none">{value}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
                {trend !== undefined && trendDir !== undefined && (
                  <span className={`text-[10px] font-bold ${trendDir === 'up' ? 'text-[hsl(var(--mint))]' : 'text-destructive'}`}>
                    {trendDir === 'up' ? '↑' : '↓'}{typeof trend === 'number' ? Math.abs(trend) : trend}{label === 'Weight' ? 'kg' : '%'}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* UF Area Chart */}
      <Card className="rounded-2xl border-border/30 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">Ultrafiltration Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {ufData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[260px] sm:h-[320px]">
              <AreaChart data={ufData}>
                <defs>
                  <linearGradient id="ufGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis dataKey="date" tickFormatter={v => new Date(v).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="uf" stroke="hsl(var(--primary))" fill="url(#ufGrad)" strokeWidth={2.5} />
                <Line type="monotone" dataKey="target" stroke="hsl(var(--mint))" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="text-center py-12">
              <span className="text-4xl">📊</span>
              <p className="text-sm text-muted-foreground mt-2">No exchange data yet. Log your first exchange to see trends!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weight Trend Chart */}
      <Card className="rounded-2xl border-border/30 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">⚖️ Weight Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {weightData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[220px] sm:h-[260px]">
              <AreaChart data={weightData}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--peach))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--peach))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis dataKey="date" tickFormatter={v => new Date(v).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={['dataMin - 1', 'dataMax + 1']} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="weight" stroke="hsl(var(--peach))" fill="url(#weightGrad)" strokeWidth={2.5} />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="text-center py-8">
              <span className="text-3xl">⚖️</span>
              <p className="text-sm text-muted-foreground mt-2">No weight data yet. Record weight in your exchanges to track trends.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Exchange Count Bar Chart */}
        <Card className="rounded-2xl border-border/30 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Daily Exchange Count</CardTitle>
          </CardHeader>
          <CardContent>
            {exchangeCountData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[200px]">
                <BarChart data={exchangeCountData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="date" tickFormatter={v => new Date(v).toLocaleDateString(undefined, { day: 'numeric' })} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--lavender))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Pain Level Trend */}
        <Card className="rounded-2xl border-border/30 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">😣 Pain Level Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {painData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[200px]">
                <AreaChart data={painData}>
                  <defs>
                    <linearGradient id="painGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--coral))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--coral))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="date" tickFormatter={v => new Date(v).toLocaleDateString(undefined, { day: 'numeric' })} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 10]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="pain" stroke="hsl(var(--coral))" fill="url(#painGrad)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">No pain data recorded</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Drain Clarity Distribution */}
      {drainColorData.length > 0 && (
        <Card className="rounded-2xl border-border/30 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Drain Clarity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {drainColorData.map(({ name, value }) => (
                <div key={name} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-muted/40 border border-border/20">
                  <span className="text-lg">{name === 'clear' ? '✅' : '⚠️'}</span>
                  <div>
                    <p className="text-sm font-bold text-foreground capitalize">{name}</p>
                    <p className="text-xs text-muted-foreground">{value} exchange{value !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrendAnalysis;
