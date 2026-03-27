import React from 'react';
import { Droplets, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface UFInterpretationProps {
  ultrafiltration: number;
  drainVolume: number;
  fillVolume: number;
  todayTotalUF: number;
  isAutoCalculated: boolean;
}

const UFInterpretation: React.FC<UFInterpretationProps> = ({
  ultrafiltration,
  drainVolume,
  fillVolume,
  todayTotalUF,
  isAutoCalculated,
}) => {
  if (!drainVolume || drainVolume <= 0) return null;

  const getUFStatus = (uf: number) => {
    if (uf >= 200) return { label: 'Good UF', color: 'text-[hsl(var(--mint))]', bg: 'bg-[hsl(var(--mint))]/10', icon: CheckCircle };
    if (uf >= 0) return { label: 'Low UF', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/20', icon: TrendingDown };
    return { label: 'Negative UF', color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertTriangle };
  };

  const getDailyStatus = (total: number) => {
    if (total >= 750) return { label: 'Daily UF adequate', color: 'text-[hsl(var(--mint))]' };
    if (total >= 400) return { label: 'Daily UF borderline', color: 'text-yellow-600 dark:text-yellow-400' };
    return { label: 'Daily UF low — monitor closely', color: 'text-destructive' };
  };

  const status = getUFStatus(ultrafiltration);
  const dailyStatus = getDailyStatus(todayTotalUF + ultrafiltration);
  const StatusIcon = status.icon;

  return (
    <div className={`rounded-xl p-3 ${status.bg} border border-border/30 space-y-2`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-4 h-4 ${status.color}`} />
          <span className={`text-sm font-bold ${status.color}`}>
            UF: {ultrafiltration > 0 ? '+' : ''}{ultrafiltration}ml
          </span>
          <span className="text-[10px] text-muted-foreground">({status.label})</span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <Droplets className="w-3 h-3 text-primary" />
          <span className="text-muted-foreground">
            Today total: <strong className={dailyStatus.color}>{todayTotalUF + ultrafiltration}ml</strong>
          </span>
        </div>
        <span className={`text-[10px] font-medium ${dailyStatus.color}`}>{dailyStatus.label}</span>
      </div>
    </div>
  );
};

export default UFInterpretation;
