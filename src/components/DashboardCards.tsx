import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, AlertTriangle, Clock } from 'lucide-react';

interface DashboardCardsProps {
  patientCount: number;
  totalAlerts: number;
  totalMissedExchanges: number;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({
  patientCount,
  totalAlerts,
  totalMissedExchanges
}) => {
  const cards = [
    {
      label: 'Active Patients',
      value: patientCount,
      sub: 'Under your care',
      icon: Users,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      valueColor: 'text-foreground',
    },
    {
      label: 'Active Alerts',
      value: totalAlerts,
      sub: 'Requiring attention',
      icon: AlertTriangle,
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
      valueColor: 'text-destructive',
    },
    {
      label: 'Missed Exchanges',
      value: totalMissedExchanges,
      sub: 'Last 24 hours',
      icon: Clock,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {cards.map(({ label, value, sub, icon: Icon, iconBg, iconColor, valueColor }) => (
        <Card key={label} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-xl sm:text-2xl font-bold ${valueColor} leading-none`}>{value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mt-0.5 truncate">{label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardCards;
