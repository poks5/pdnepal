
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardHeaderProps {
  patientCount: number;
  totalAlerts: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ patientCount, totalAlerts }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
      <h1 className="text-2xl font-bold mb-2">{t('welcome')}, Dr. Sharma!</h1>
      <p className="text-green-100">Managing {patientCount} patients with {totalAlerts} active alerts</p>
    </div>
  );
};

export default DashboardHeader;
