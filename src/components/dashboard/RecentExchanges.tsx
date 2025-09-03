
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { DailyExchangeLog } from '@/types/patient';

interface RecentExchangesProps {
  exchanges: DailyExchangeLog[];
}

const RecentExchanges: React.FC<RecentExchangesProps> = ({ exchanges }) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('recent_exchanges')}</CardTitle>
        <CardDescription>{t('last_few_exchanges')}</CardDescription>
      </CardHeader>
      <CardContent>
        {exchanges.length > 0 ? (
          <div className="space-y-3">
            {exchanges.map((exchange) => (
              <div key={exchange.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">
                    {new Date(exchange.timestamp).toLocaleDateString()} - {exchange.exchangeType}
                  </p>
                  <p className="text-sm text-gray-600">
                    UF: +{exchange.ultrafiltration}ml | {t('clarity')}: {exchange.clarity}
                  </p>
                </div>
                <Badge variant={exchange.clarity === 'clear' ? 'default' : 'destructive'}>
                  {exchange.clarity}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-4">
            {t('no_exchanges_recorded')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentExchanges;
