import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DashboardHeaderProps {
  patientCount: number;
  totalAlerts: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ patientCount, totalAlerts }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <div className="gradient-medical rounded-2xl p-5 sm:p-6 text-primary-foreground shadow-lg shadow-primary/15">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-primary-foreground/70 text-sm font-medium">{t('welcome')}</p>
          <h1 className="text-xl sm:text-2xl font-bold mt-0.5">
            Dr. {user?.fullName?.split(' ').slice(-1)[0] || 'Doctor'}
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1">
              <Activity className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{patientCount} patients</span>
            </div>
            {totalAlerts > 0 && (
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <Bell className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">{totalAlerts} alerts</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
