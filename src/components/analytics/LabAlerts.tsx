import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, TrendingDown, Bell } from 'lucide-react';

interface LabAlert {
  id: string;
  parameter: string;
  value: number;
  referenceRange: string;
  severity: 'low' | 'high' | 'critical';
  trend: 'improving' | 'stable' | 'worsening';
  recommendation: string;
  timestamp: string;
}

const LabAlerts: React.FC = () => {
  const alerts: LabAlert[] = [
    { id: '1', parameter: 'Hemoglobin', value: 8.2, referenceRange: '12.0-15.5 g/dL', severity: 'low', trend: 'worsening', recommendation: 'Consider iron supplementation and EPO therapy evaluation', timestamp: '2024-06-15T10:00:00Z' },
    { id: '2', parameter: 'Phosphorus', value: 6.8, referenceRange: '2.5-4.5 mg/dL', severity: 'high', trend: 'stable', recommendation: 'Review phosphate binder dosage and dietary phosphorus intake', timestamp: '2024-06-15T10:00:00Z' },
    { id: '3', parameter: 'iPTH', value: 650, referenceRange: '15-65 pg/mL', severity: 'critical', trend: 'improving', recommendation: 'Immediate nephrologist consultation for hyperparathyroidism management', timestamp: '2024-06-15T10:00:00Z' },
  ];

  const severityConfig: Record<string, { bg: string; text: string; border: string; emoji: string }> = {
    critical: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/20', emoji: '🔴' },
    high: { bg: 'bg-[hsl(var(--coral))]/10', text: 'text-[hsl(var(--coral))]', border: 'border-[hsl(var(--coral))]/20', emoji: '🟠' },
    low: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20', emoji: '🔵' },
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-[hsl(var(--mint))]" />;
    if (trend === 'worsening') return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <div className="w-4 h-1 bg-muted-foreground/40 rounded-full" />;
  };

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const otherAlerts = alerts.filter(a => a.severity !== 'critical');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground">🔬 Lab Alerts</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Automated flagging of concerning lab values</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs">
          <Bell className="w-3.5 h-3.5" /> Settings
        </Button>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Critical', value: criticalAlerts.length, emoji: '🔴', color: 'text-destructive' },
          { label: 'Total', value: alerts.length, emoji: '⚠️', color: 'text-[hsl(var(--coral))]' },
          { label: 'Worsening', value: alerts.filter(a => a.trend === 'worsening').length, emoji: '📉', color: 'text-destructive' },
        ].map(s => (
          <Card key={s.label} className="rounded-2xl border-border/30 shadow-sm">
            <CardContent className="p-3.5 text-center">
              <span className="text-xl">{s.emoji}</span>
              <p className={`text-2xl font-black mt-1 leading-none ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Critical alerts */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-3">
          {criticalAlerts.map(alert => {
            const cfg = severityConfig[alert.severity];
            return (
              <Card key={alert.id} className={`rounded-2xl border ${cfg.border} ${cfg.bg} shadow-sm`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cfg.emoji}</span>
                      <h3 className="font-bold text-foreground">{alert.parameter}</h3>
                      <Badge variant="destructive" className="text-[10px] px-2 py-0">CRITICAL</Badge>
                    </div>
                    {getTrendIcon(alert.trend)}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-xl bg-card/60">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Current</p>
                      <p className="text-lg font-black text-destructive">{alert.value}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card/60">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Normal</p>
                      <p className="text-sm font-semibold text-foreground">{alert.referenceRange}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground bg-card/60 p-3 rounded-xl">💡 {alert.recommendation}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Other alerts */}
      <div className="space-y-3">
        {otherAlerts.map(alert => {
          const cfg = severityConfig[alert.severity];
          return (
            <Card key={alert.id} className="rounded-2xl border-border/30 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{cfg.emoji}</span>
                    <h3 className="font-bold text-sm text-foreground">{alert.parameter}</h3>
                    <Badge className={`text-[10px] px-2 py-0 ${cfg.bg} ${cfg.text} border-0`}>{alert.severity}</Badge>
                  </div>
                  {getTrendIcon(alert.trend)}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-xl bg-muted/30">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Value</p>
                    <p className={`text-lg font-black ${cfg.text}`}>{alert.value}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/30">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Normal</p>
                    <p className="text-sm font-semibold text-foreground">{alert.referenceRange}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">💡 {alert.recommendation}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {alerts.length === 0 && (
        <Card className="rounded-2xl border-border/30 shadow-sm">
          <CardContent className="p-8 text-center">
            <span className="text-4xl">✅</span>
            <h3 className="font-bold text-foreground mt-2">All Clear!</h3>
            <p className="text-sm text-muted-foreground mt-1">All lab values are within normal ranges.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LabAlerts;
