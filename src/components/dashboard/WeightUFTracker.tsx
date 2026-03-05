import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Droplets, Weight, TrendingUp } from 'lucide-react';
import { usePatient } from '@/contexts/PatientContext';
import { DailyExchangeLog } from '@/types/patient';

const WeightUFTracker: React.FC = () => {
  const { exchangeLogs } = usePatient();

  const calculate24HourUF = (): number => {
    const now = new Date();
    let endTime = new Date(now);
    endTime.setHours(6, 0, 0, 0);
    if (now.getHours() < 6) endTime.setDate(endTime.getDate() - 1);
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

    return exchangeLogs
      .filter((log: DailyExchangeLog) => {
        const logTime = new Date(log.timestamp);
        return logTime >= startTime && logTime < endTime;
      })
      .reduce((total, log) => total + log.ultrafiltration, 0);
  };

  const totalUF = calculate24HourUF();
  const currentWeight = 65.5;

  const items = [
    {
      label: '24hr UF Total',
      value: `${totalUF}ml`,
      sub: '6 AM to 6 AM',
      icon: Droplets,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      label: 'Current Weight',
      value: `${currentWeight} kg`,
      sub: 'Weigh after draining',
      icon: Weight,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Trend',
      value: '↓ 0.3 kg',
      sub: 'This week',
      icon: TrendingUp,
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-600',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {items.map(({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
        <Card key={label} className="border-border/50 shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <p className="text-sm sm:text-base font-bold text-foreground leading-none">{value}</p>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium">{label}</p>
            <p className="text-[10px] text-muted-foreground/70">{sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WeightUFTracker;
