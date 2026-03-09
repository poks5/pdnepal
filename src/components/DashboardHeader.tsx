import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, Bell, TrendingUp, ShieldAlert, Calendar } from 'lucide-react';

interface DashboardHeaderProps {
  patientCount: number;
  totalAlerts: number;
  avgAdherence: number;
  criticalCount: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ patientCount, totalAlerts, avgAdherence, criticalCount }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="gradient-medical rounded-2xl p-5 sm:p-6 text-primary-foreground shadow-lg shadow-primary/15">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-primary-foreground/70 text-sm font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {today}
          </p>
          <h1 className="text-xl sm:text-2xl font-bold mt-1">
            {t('welcome')}, Dr. {user?.fullName?.split(' ').slice(-1)[0] || 'Doctor'}
          </h1>
          <p className="text-primary-foreground/60 text-xs mt-1">Clinical Overview & Patient Management</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
          <Activity className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold">{patientCount} patients</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold">{avgAdherence}% avg adherence</span>
        </div>
        {totalAlerts > 0 && (
          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
            <Bell className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">{totalAlerts} alerts</span>
          </div>
        )}
        {criticalCount > 0 && (
          <div className="flex items-center gap-1.5 bg-destructive/30 backdrop-blur-sm rounded-full px-3 py-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">{criticalCount} need attention</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
