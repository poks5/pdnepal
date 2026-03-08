import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { DailyExchangeLog } from '@/types/patient';
import dropletCharacter from '@/assets/droplet-character.png';

interface RecentExchangesProps {
  exchanges: DailyExchangeLog[];
}

const RecentExchanges: React.FC<RecentExchangesProps> = ({ exchanges }) => {
  const { t } = useLanguage();

  const exchangeColors = [
    { bg: 'bg-primary/8', border: 'border-primary/15', dot: 'bg-primary' },
    { bg: 'bg-[hsl(var(--lavender))]/8', border: 'border-[hsl(var(--lavender))]/15', dot: 'bg-[hsl(var(--lavender))]' },
    { bg: 'bg-[hsl(var(--coral))]/8', border: 'border-[hsl(var(--coral))]/15', dot: 'bg-[hsl(var(--coral))]' },
  ];

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <img src={dropletCharacter} alt="" className="w-6 h-6" />
          {t('recent_exchanges')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {exchanges.length > 0 ? (
          <div className="space-y-2.5">
            {exchanges.map((exchange, idx) => {
              const color = exchangeColors[idx % exchangeColors.length];
              return (
                <div key={exchange.id} className={`flex items-center justify-between p-3.5 ${color.bg} border ${color.border} rounded-2xl transition-all card-hover`}>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${color.dot} shrink-0`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {new Date(exchange.timestamp).toLocaleDateString()} — {exchange.exchangeType}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        UF: <span className="font-semibold text-foreground">+{exchange.ultrafiltration}ml</span> · {t('clarity')}: {exchange.clarity}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`text-[10px] ml-2 border-0 shrink-0 font-semibold ${
                      exchange.clarity === 'clear'
                        ? 'bg-[hsl(var(--mint))]/15 text-[hsl(var(--mint))]'
                        : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {exchange.clarity === 'clear' ? '✓ Clear' : '⚠ Cloudy'}
                  </Badge>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <img src={dropletCharacter} alt="" className="w-16 h-16 mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground text-sm font-medium">
              {t('no_exchanges_recorded')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Tap "Log Exchange" to get started! 💧
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentExchanges;
