import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { DailyExchangeLog } from '@/types/patient';
import { Droplets } from 'lucide-react';

interface RecentExchangesProps {
  exchanges: DailyExchangeLog[];
}

const RecentExchanges: React.FC<RecentExchangesProps> = ({ exchanges }) => {
  const { t } = useLanguage();

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Droplets className="w-4 h-4 text-primary" />
          {t('recent_exchanges')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {exchanges.length > 0 ? (
          <div className="space-y-2">
            {exchanges.map((exchange) => (
              <div key={exchange.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {new Date(exchange.timestamp).toLocaleDateString()} — {exchange.exchangeType}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    UF: +{exchange.ultrafiltration}ml · {t('clarity')}: {exchange.clarity}
                  </p>
                </div>
                <Badge
                  className={`text-[10px] ml-2 border-0 shrink-0 ${
                    exchange.clarity === 'clear'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-destructive/10 text-destructive'
                  }`}
                >
                  {exchange.clarity}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-6 text-sm">
            {t('no_exchanges_recorded')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentExchanges;
