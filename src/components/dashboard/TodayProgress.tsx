import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Clock, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TodayProgressProps {
  completed: number;
  total: number;
  nextTime: string;
  onAddExchange: () => void;
}

const TodayProgress: React.FC<TodayProgressProps> = ({
  completed,
  total,
  nextTime,
  onAddExchange
}) => {
  const { t } = useLanguage();
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const allDone = completed >= total;

  return (
    <Card className="border-0 shadow-md overflow-hidden relative native-card">
      <CardContent className="p-4 sm:p-6 relative">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">{t('today_progress')}</h3>
          </div>
          <div className="flex items-center gap-1.5 bg-primary/8 rounded-full px-2.5 py-1">
            <Clock className="w-3 h-3 text-primary" />
            <span className="text-[11px] font-semibold text-primary">{nextTime}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-3">
          {allDone ? '🎉 Great job! All done for today!' : `${completed} of ${total} exchanges done`}
        </p>

        {/* Progress bar + dots */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2.5">
            <Progress value={percentage} className="h-2.5 flex-1 rounded-full" />
            <span className="text-xs font-bold text-primary min-w-[32px] text-right">{percentage}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: total }).map((_, i) => {
              const colors = ['bg-primary', 'bg-[hsl(var(--coral))]', 'bg-[hsl(var(--lavender))]', 'bg-[hsl(var(--mint))]'];
              return (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                    i < completed ? `${colors[i % colors.length]}` : 'bg-muted'
                  }`}
                />
              );
            })}
          </div>
        </div>

        <Button
          onClick={onAddExchange}
          className="w-full rounded-xl h-12 text-sm font-bold shadow-md shadow-primary/20 active:scale-[0.98] transition-all bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4.5 h-4.5 mr-1.5" />
          {t('log_exchange')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TodayProgress;
