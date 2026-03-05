import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, Droplets, AlertCircle } from 'lucide-react';

interface WeeklyStatsProps {
  adherence: number;
  avgUF: number;
  missedExchanges: number;
}

const WeeklyStats: React.FC<WeeklyStatsProps> = ({ adherence, avgUF, missedExchanges }) => {
  const { t } = useLanguage();

  const stats = [
    {
      label: t('adherence'),
      value: `${adherence}%`,
      icon: TrendingUp,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      label: t('avg_ultrafiltration'),
      value: `+${avgUF}ml`,
      icon: Droplets,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600',
    },
    {
      label: t('missed_exchanges'),
      value: `${missedExchanges}`,
      icon: AlertCircle,
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {stats.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
        <Card key={label} className="border-border/50 shadow-sm">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${iconBg} flex items-center justify-center mx-auto mb-2`}>
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
            </div>
            <p className="text-lg sm:text-xl font-bold text-foreground leading-none">{value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-tight">{label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WeeklyStats;
