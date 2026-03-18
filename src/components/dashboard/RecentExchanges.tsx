import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { DailyExchangeLog } from '@/types/patient';
import dropletCharacter from '@/assets/droplet-character.png';

interface RecentExchangesProps {
  exchanges: DailyExchangeLog[];
  loading?: boolean;
}

const RecentExchanges: React.FC<RecentExchangesProps> = ({ exchanges, loading = false }) => {
  const { t } = useLanguage();

  const exchangeColors = [
    { bg: 'bg-primary/10', border: 'border-primary/20', dot: 'bg-primary' },
    { bg: 'bg-accent/40', border: 'border-border', dot: 'bg-accent-foreground' },
    { bg: 'bg-muted/60', border: 'border-border', dot: 'bg-foreground/70' },
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
        {loading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="rounded-2xl border border-border bg-muted/40 p-3.5 animate-pulse">
                <div className="h-4 w-40 rounded bg-muted mb-2" />
                <div className="h-3 w-56 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : exchanges.length > 0 ? (
          <div className="space-y-2.5">
            {exchanges.map((exchange, idx) => {
              const color = exchangeColors[idx % exchangeColors.length];
              const additiveLabel = exchange.additive?.drugName || exchange.additive?.additiveType;
              const vitals = [
                exchange.bloodPressureSystolic != null || exchange.bloodPressureDiastolic != null
                  ? `BP ${exchange.bloodPressureSystolic ?? '—'}/${exchange.bloodPressureDiastolic ?? '—'}`
                  : null,
                exchange.temperature != null ? `Temp ${exchange.temperature}°F` : null,
              ].filter(Boolean);

              return (
                <div key={exchange.id} className={`p-3.5 ${color.bg} border ${color.border} rounded-2xl transition-all card-hover`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`w-2.5 h-2.5 rounded-full ${color.dot} shrink-0 mt-1.5`} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {new Date(exchange.timestamp).toLocaleDateString()} — {exchange.exchangeType}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          UF: <span className="font-semibold text-foreground">{exchange.ultrafiltration > 0 ? '+' : ''}{exchange.ultrafiltration}ml</span> · {t('clarity')}: {exchange.clarity}
                        </p>
                        {(vitals.length > 0 || additiveLabel) && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {vitals.map((item) => (
                              <Badge key={item} variant="secondary" className="text-[10px] font-medium">
                                {item}
                              </Badge>
                            ))}
                            {additiveLabel && (
                              <Badge variant="secondary" className="text-[10px] font-medium">
                                Additive: {additiveLabel}{exchange.additive?.dose ? ` • ${exchange.additive.dose}` : ''}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge
                      className={`text-[10px] ml-2 border-0 shrink-0 font-semibold ${
                        exchange.clarity === 'clear'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {exchange.clarity === 'clear' ? '✓ Clear' : '⚠ Cloudy'}
                    </Badge>
                  </div>
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
