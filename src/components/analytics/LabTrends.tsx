import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceArea, ReferenceLine, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, FlaskConical } from 'lucide-react';
import { LabTest } from '@/types/labData';

interface LabTrendsProps {
  labData: LabTest[];
}

// ISPD / KDIGO reference ranges for PD patients
const MARKERS = [
  { key: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL', low: 10, high: 11.5, optimalLow: 10, optimalHigh: 11.5, color: 'hsl(var(--coral))', emoji: '🩸', critical: { low: 8, high: 16 } },
  { key: 'creatinine', label: 'Creatinine', unit: 'mg/dL', low: 0, high: 12, optimalLow: 0, optimalHigh: 12, color: 'hsl(var(--primary))', emoji: '💉', critical: { low: 0, high: 18 } },
  { key: 'urea', label: 'BUN / Urea', unit: 'mg/dL', low: 0, high: 100, optimalLow: 0, optimalHigh: 100, color: 'hsl(var(--lavender))', emoji: '🧪', critical: { low: 0, high: 150 } },
  { key: 'potassium', label: 'Potassium', unit: 'mEq/L', low: 3.5, high: 5.5, optimalLow: 3.5, optimalHigh: 5.5, color: 'hsl(var(--peach))', emoji: '⚡', critical: { low: 3.0, high: 6.0 } },
  { key: 'sodium', label: 'Sodium', unit: 'mEq/L', low: 135, high: 145, optimalLow: 135, optimalHigh: 145, color: 'hsl(var(--mint))', emoji: '🧂', critical: { low: 130, high: 150 } },
  { key: 'calcium', label: 'Calcium', unit: 'mg/dL', low: 8.4, high: 10.2, optimalLow: 8.4, optimalHigh: 10.2, color: 'hsl(var(--primary))', emoji: '🦴', critical: { low: 7.5, high: 11.5 } },
  { key: 'phosphorus', label: 'Phosphorus', unit: 'mg/dL', low: 3.5, high: 5.5, optimalLow: 3.5, optimalHigh: 5.5, color: 'hsl(var(--coral))', emoji: '⚗️', critical: { low: 2.5, high: 7.0 } },
  { key: 'albumin', label: 'Albumin', unit: 'g/dL', low: 3.5, high: 5.5, optimalLow: 3.5, optimalHigh: 5.5, color: 'hsl(var(--mint))', emoji: '🥚', critical: { low: 2.5, high: 6.0 } },
  { key: 'ipth', label: 'iPTH', unit: 'pg/mL', low: 150, high: 600, optimalLow: 150, optimalHigh: 600, color: 'hsl(var(--lavender))', emoji: '🧬', critical: { low: 100, high: 900 } },
  { key: 'hba1c', label: 'HbA1c', unit: '%', low: 0, high: 7, optimalLow: 0, optimalHigh: 7, color: 'hsl(var(--peach))', emoji: '🍬', critical: { low: 0, high: 9 } },
] as const;

type MarkerKey = typeof MARKERS[number]['key'];

const interpretValue = (value: number, marker: typeof MARKERS[number]) => {
  if (value < marker.critical.low) return { status: 'critical-low', label: 'Critically Low', color: 'destructive' };
  if (value > marker.critical.high) return { status: 'critical-high', label: 'Critically High', color: 'destructive' };
  if (value < marker.low) return { status: 'low', label: 'Low', color: 'warning' };
  if (value > marker.high) return { status: 'high', label: 'High', color: 'warning' };
  return { status: 'normal', label: 'Normal', color: 'success' };
};

const getTrendDirection = (values: number[]): 'up' | 'down' | 'stable' => {
  if (values.length < 2) return 'stable';
  const first = values[0];
  const last = values[values.length - 1];
  const pctChange = first === 0 ? 0 : ((last - first) / first) * 100;
  if (Math.abs(pctChange) < 5) return 'stable';
  return pctChange > 0 ? 'up' : 'down';
};

const LabTrends: React.FC<LabTrendsProps> = ({ labData }) => {
  const [selectedMarker, setSelectedMarker] = useState<MarkerKey>('hemoglobin');

  const sortedData = useMemo(
    () => [...labData].sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime()),
    [labData]
  );

  // Build per-marker series and stats
  const markerSeries = useMemo(() => {
    const map: Record<string, { date: string; value: number }[]> = {};
    MARKERS.forEach(m => {
      map[m.key] = sortedData
        .filter(l => (l as any)[m.key] != null && !isNaN(Number((l as any)[m.key])))
        .map(l => ({ date: l.testDate, value: Number((l as any)[m.key]) }));
    });
    return map;
  }, [sortedData]);

  const activeMarker = MARKERS.find(m => m.key === selectedMarker)!;
  const activeSeries = markerSeries[selectedMarker] || [];
  const latestValue = activeSeries.length ? activeSeries[activeSeries.length - 1].value : null;
  const previousValue = activeSeries.length > 1 ? activeSeries[activeSeries.length - 2].value : null;
  const trendDir = getTrendDirection(activeSeries.map(s => s.value));
  const interpretation = latestValue !== null ? interpretValue(latestValue, activeMarker) : null;

  // Auto-flagged abnormal markers across most recent test
  const latestTest = sortedData[sortedData.length - 1];
  const abnormalFindings = useMemo(() => {
    if (!latestTest) return [];
    return MARKERS
      .map(m => {
        const v = (latestTest as any)[m.key];
        if (v == null || isNaN(Number(v))) return null;
        const interp = interpretValue(Number(v), m);
        if (interp.status === 'normal') return null;
        return { marker: m, value: Number(v), interpretation: interp };
      })
      .filter(Boolean) as { marker: typeof MARKERS[number]; value: number; interpretation: ReturnType<typeof interpretValue> }[];
  }, [latestTest]);

  if (sortedData.length === 0) {
    return (
      <Card className="rounded-2xl border-dashed">
        <CardContent className="text-center py-12">
          <FlaskConical className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">No lab results yet</p>
          <p className="text-xs text-muted-foreground mt-1">Add your first lab result to start tracking trends.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* Abnormal Findings Summary */}
      {abnormalFindings.length > 0 && (
        <Card className="rounded-2xl border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Abnormal in Latest Test ({new Date(latestTest.testDate).toLocaleDateString()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {abnormalFindings.map(({ marker, value, interpretation }) => (
                <button
                  key={marker.key}
                  onClick={() => setSelectedMarker(marker.key)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-card border border-border hover:border-primary/40 transition-all text-xs"
                >
                  <span>{marker.emoji}</span>
                  <span className="font-semibold">{marker.label}:</span>
                  <span className="font-bold">{value}</span>
                  <Badge
                    variant={interpretation.status.includes('critical') ? 'destructive' : 'secondary'}
                    className="text-[9px] h-4 px-1.5"
                  >
                    {interpretation.label}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Marker Selector Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {MARKERS.filter(m => markerSeries[m.key].length > 0).map(m => (
          <button
            key={m.key}
            onClick={() => setSelectedMarker(m.key)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedMarker === m.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <span>{m.emoji}</span>
            {m.label}
            <span className="text-[10px] opacity-70">({markerSeries[m.key].length})</span>
          </button>
        ))}
      </div>

      {/* Active Marker Chart */}
      <Card className="rounded-2xl border-border/40 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <span className="text-base">{activeMarker.emoji}</span>
                {activeMarker.label} Trend
              </CardTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Reference range: {activeMarker.low}–{activeMarker.high} {activeMarker.unit}
              </p>
            </div>
            {latestValue !== null && interpretation && (
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-2xl font-black text-foreground leading-none">
                    {latestValue}
                    <span className="text-xs font-medium text-muted-foreground ml-1">{activeMarker.unit}</span>
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    {previousValue !== null && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        {trendDir === 'up' && <TrendingUp className="w-3 h-3 text-coral" />}
                        {trendDir === 'down' && <TrendingDown className="w-3 h-3 text-mint" />}
                        {trendDir === 'stable' && <Minus className="w-3 h-3" />}
                        {previousValue} → {latestValue}
                      </span>
                    )}
                    <Badge
                      variant={interpretation.status.includes('critical') ? 'destructive' : interpretation.status === 'normal' ? 'secondary' : 'outline'}
                      className="text-[9px] h-4 px-1.5"
                    >
                      {interpretation.label}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {activeSeries.length > 1 ? (
            <ChartContainer
              config={{ value: { label: activeMarker.label, color: activeMarker.color } }}
              className="h-[260px] sm:h-[300px] w-full"
            >
              <LineChart data={activeSeries} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                <XAxis
                  dataKey="date"
                  tickFormatter={v => new Date(v).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  tick={{ fontSize: 10 }}
                />
                <YAxis tick={{ fontSize: 10 }} domain={['dataMin - 1', 'dataMax + 1']} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceArea
                  y1={activeMarker.low}
                  y2={activeMarker.high}
                  fill="hsl(var(--mint))"
                  fillOpacity={0.08}
                  stroke="hsl(var(--mint))"
                  strokeOpacity={0.2}
                  strokeDasharray="3 3"
                />
                <ReferenceLine y={activeMarker.low} stroke="hsl(var(--mint))" strokeDasharray="3 3" strokeOpacity={0.6} />
                <ReferenceLine y={activeMarker.high} stroke="hsl(var(--mint))" strokeDasharray="3 3" strokeOpacity={0.6} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={activeMarker.color}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: activeMarker.color }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="text-center py-10">
              <p className="text-sm text-muted-foreground">Need at least 2 data points to show trend.</p>
              {activeSeries.length === 1 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Latest: <strong>{activeSeries[0].value} {activeMarker.unit}</strong> on {new Date(activeSeries[0].date).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Markers Snapshot Grid */}
      <Card className="rounded-2xl border-border/40 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">Latest Values Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {MARKERS.map(m => {
              const series = markerSeries[m.key];
              if (series.length === 0) return null;
              const latest = series[series.length - 1];
              const interp = interpretValue(latest.value, m);
              const dir = getTrendDirection(series.slice(-3).map(s => s.value));
              return (
                <button
                  key={m.key}
                  onClick={() => setSelectedMarker(m.key)}
                  className={`text-left p-2.5 rounded-xl border transition-all ${
                    selectedMarker === m.key
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border/40 hover:border-border bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{m.emoji}</span>
                    {dir === 'up' && <TrendingUp className="w-3 h-3 text-coral" />}
                    {dir === 'down' && <TrendingDown className="w-3 h-3 text-mint" />}
                    {dir === 'stable' && <Minus className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide truncate">{m.label}</p>
                  <p className="text-base font-black text-foreground leading-tight">
                    {latest.value}
                    <span className="text-[10px] font-medium text-muted-foreground ml-0.5">{m.unit}</span>
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {interp.status === 'normal' ? (
                      <CheckCircle2 className="w-3 h-3 text-mint" />
                    ) : (
                      <AlertTriangle className={`w-3 h-3 ${interp.status.includes('critical') ? 'text-destructive' : 'text-yellow-600'}`} />
                    )}
                    <span className={`text-[9px] font-semibold ${
                      interp.status === 'normal' ? 'text-mint' :
                      interp.status.includes('critical') ? 'text-destructive' :
                      'text-yellow-600'
                    }`}>
                      {interp.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LabTrends;
