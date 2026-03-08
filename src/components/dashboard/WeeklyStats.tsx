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
      gradient: 'from-primary/15 to-[hsl(var(--lavender))]/10',
      iconBg: 'bg-primary/15',
      iconColor: 'text-primary',
      ringColor: adherence >= 80 ? 'ring-primary/20' : 'ring-[hsl(var(--coral))]/20',
    },
    {
      label: t('avg_ultrafiltration'),
      value: `+${avgUF}ml`,
      icon: Droplets,
      gradient: 'from-[hsl(var(--mint))]/15 to-accent/10',
      iconBg: 'bg-[hsl(var(--mint))]/15',
      iconColor: 'text-[hsl(var(--mint))]',
      ringColor: 'ring-[hsl(var(--mint))]/20',
    },
    {
      label: t('missed_exchanges'),
      value: `${missedExchanges}`,
      icon: AlertCircle,
      gradient: 'from-[hsl(var(--coral))]/10 to-[hsl(var(--peach))]/10',
      iconBg: 'bg-[hsl(var(--coral))]/15',
      iconColor: 'text-[hsl(var(--coral))]',
      ringColor: missedExchanges > 0 ? 'ring-[hsl(var(--coral))]/20' : 'ring-[hsl(var(--mint))]/20',
    },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-foreground px-1">📊 This Week</h3>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {stats.map(({ label, value, icon: Icon, gradient, iconBg, iconColor, ringColor }) => (
          <Card key={label} className={`border-0 shadow-md ring-1 ${ringColor} overflow-hidden card-hover`}>
            <CardContent className={`p-3 sm:p-4 text-center bg-gradient-to-br ${gradient}`}>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl ${iconBg} flex items-center justify-center mx-auto mb-2.5 shadow-sm`}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-foreground leading-none">{value}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 leading-tight font-medium">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WeeklyStats;
