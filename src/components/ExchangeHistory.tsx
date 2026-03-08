import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Droplets, AlertTriangle, Filter } from 'lucide-react';

interface Exchange {
  id: string;
  date: string;
  time: string;
  type: 'morning' | 'afternoon' | 'evening' | 'night';
  drainVolume: number;
  fillVolume: number;
  ultrafiltration: number;
  clarity: 'clear' | 'cloudy';
  color: 'normal' | 'yellow' | 'red' | 'brown';
  pain: number;
  notes?: string;
  symptoms?: string[];
}

interface ExchangeHistoryProps {
  exchanges?: Exchange[];
}

const ExchangeHistory: React.FC<ExchangeHistoryProps> = ({ exchanges = [] }) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'concerns'>('all');

  const typeConfig: Record<string, { bg: string; text: string }> = {
    morning: { bg: 'bg-amber-500/10', text: 'text-amber-600' },
    afternoon: { bg: 'bg-orange-500/10', text: 'text-orange-600' },
    evening: { bg: 'bg-violet-500/10', text: 'text-violet-600' },
    night: { bg: 'bg-primary/10', text: 'text-primary' },
  };

  const colorDot: Record<string, string> = {
    normal: 'bg-emerald-500',
    yellow: 'bg-amber-500',
    red: 'bg-destructive',
    brown: 'bg-amber-800',
  };

  const hasConcerns = (ex: Exchange) =>
    ex.clarity === 'cloudy' || ex.color !== 'normal' || ex.pain > 3 || ex.ultrafiltration < -100;

  const filtered = exchanges.filter(ex => filter === 'all' || hasConcerns(ex));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">{t('exchangeHistory')}</h2>
        </div>
        <div className="flex gap-1.5">
          <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')} className="rounded-full text-xs h-8 px-3">
            {t('all')}
          </Button>
          <Button variant={filter === 'concerns' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('concerns')} className="rounded-full text-xs h-8 px-3">
            <AlertTriangle className="w-3 h-3 mr-1" /> {t('concerns')}
          </Button>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Droplets className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{filter === 'concerns' ? t('noConcernsFound') : t('noExchangesYet')}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((ex) => {
            const concern = hasConcerns(ex);
            const tc = typeConfig[ex.type] || { bg: 'bg-muted', text: 'text-muted-foreground' };
            return (
              <Card key={ex.id} className={`border-border/50 shadow-sm ${concern ? 'border-l-4 border-l-amber-400' : ''}`}>
                <CardContent className="p-3 sm:p-4">
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`${tc.bg} ${tc.text} border-0 text-[10px] px-1.5 py-0`}>
                        {t(ex.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {ex.time}
                      </span>
                      <span className="text-xs text-muted-foreground">{ex.date}</span>
                    </div>
                    {concern && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                  </div>

                  {/* Stats grid — 2x2 on mobile, 4 col on desktop */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                    <div className="bg-muted/50 rounded-lg px-2.5 py-1.5">
                      <span className="text-[10px] text-muted-foreground block">{t('drain')}</span>
                      <span className="font-semibold text-foreground">{ex.drainVolume}ml</span>
                    </div>
                    <div className="bg-muted/50 rounded-lg px-2.5 py-1.5">
                      <span className="text-[10px] text-muted-foreground block">{t('fill')}</span>
                      <span className="font-semibold text-foreground">{ex.fillVolume}ml</span>
                    </div>
                    <div className="bg-muted/50 rounded-lg px-2.5 py-1.5">
                      <span className="text-[10px] text-muted-foreground block">{t('uf')}</span>
                      <span className={`font-semibold ${ex.ultrafiltration >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                        {ex.ultrafiltration > 0 ? '+' : ''}{ex.ultrafiltration}ml
                      </span>
                    </div>
                    <div className="bg-muted/50 rounded-lg px-2.5 py-1.5">
                      <span className="text-[10px] text-muted-foreground block">{t('pain')}</span>
                      <span className={`font-semibold ${ex.pain > 3 ? 'text-destructive' : 'text-emerald-600'}`}>
                        {ex.pain}/10
                      </span>
                    </div>
                  </div>

                  {/* Clarity & color */}
                  <div className="flex items-center gap-3 mt-2.5">
                    <Badge className={`border-0 text-[10px] ${ex.clarity === 'clear' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
                      {t(ex.clarity)}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${colorDot[ex.color] ?? 'bg-muted-foreground'}`} />
                      <span className="text-xs text-muted-foreground capitalize">{t(ex.color)}</span>
                    </div>
                  </div>

                  {ex.symptoms && ex.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {ex.symptoms.map((symptom) => (
                        <Badge key={symptom} className="bg-amber-500/10 text-amber-700 border-0 text-[10px] px-1.5 py-0">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {ex.notes && (
                    <div className="mt-2.5 p-2.5 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">{ex.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExchangeHistory;
