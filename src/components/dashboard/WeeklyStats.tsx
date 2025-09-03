
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface WeeklyStatsProps {
  adherence: number;
  avgUF: number;
  missedExchanges: number;
}

const WeeklyStats: React.FC<WeeklyStatsProps> = ({
  adherence,
  avgUF,
  missedExchanges
}) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{adherence}%</div>
            <div className="text-sm text-gray-600">{t('adherence')}</div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">+{avgUF}ml</div>
            <div className="text-sm text-gray-600">{t('avg_ultrafiltration')}</div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{missedExchanges}</div>
            <div className="text-sm text-gray-600">{t('missed_exchanges')}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyStats;
