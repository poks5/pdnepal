import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, AlertTriangle, Clock, TrendingUp, FlaskConical, ShieldAlert } from 'lucide-react';

interface DashboardCardsProps {
  patientCount: number;
  totalAlerts: number;
  totalMissedExchanges: number;
  avgAdherence: number;
  criticalCount: number;
  pendingLabCount: number;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({
  patientCount,
  totalAlerts,
  totalMissedExchanges,
  avgAdherence,
  criticalCount,
  pendingLabCount,
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
      label: 'Avg Adherence',
      value: `${avgAdherence}%`,
      sub: 'Weekly average',
      icon: TrendingUp,
      iconBg: avgAdherence >= 80 ? 'bg-emerald-500/10' : 'bg-amber-500/10',
      iconColor: avgAdherence >= 80 ? 'text-emerald-600' : 'text-amber-600',
      valueColor: avgAdherence >= 80 ? 'text-emerald-600' : 'text-amber-600',
    },
    {
      label: 'Active Alerts',
      value: totalAlerts,
      sub: 'Requiring review',
      icon: AlertTriangle,
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
      valueColor: totalAlerts > 0 ? 'text-destructive' : 'text-muted-foreground',
    },
    {
      label: 'Critical',
      value: criticalCount,
      sub: 'Need attention',
      icon: ShieldAlert,
      iconBg: criticalCount > 0 ? 'bg-destructive/10' : 'bg-muted/50',
      iconColor: criticalCount > 0 ? 'text-destructive' : 'text-muted-foreground',
      valueColor: criticalCount > 0 ? 'text-destructive' : 'text-muted-foreground',
    },
    {
      label: 'Missed Exchanges',
      value: totalMissedExchanges,
      sub: 'This week',
      icon: Clock,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-600',
      valueColor: totalMissedExchanges > 0 ? 'text-amber-600' : 'text-muted-foreground',
    },
    {
      label: 'Pending Labs',
      value: pendingLabCount,
      sub: 'Awaiting review',
      icon: FlaskConical,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      valueColor: 'text-foreground',
    },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
      {cards.map(({ label, value, sub, icon: Icon, iconBg, iconColor, valueColor }) => (
        <Card key={label} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${iconBg} flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <p className={`text-lg sm:text-xl font-bold ${valueColor} leading-none`}>{value}</p>
            <p className="text-[10px] text-muted-foreground font-medium mt-1 leading-tight">{label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardCards;
