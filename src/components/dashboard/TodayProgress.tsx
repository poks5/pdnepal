import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Clock } from 'lucide-react';
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
  const percentage = Math.round((completed / total) * 100);

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{t('today_progress')}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {completed} of {total} exchanges done
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-muted rounded-full px-2.5 py-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Next: {nextTime}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Progress value={percentage} className="h-3 flex-1 rounded-full" />
            <span className="text-sm font-bold text-primary">{percentage}%</span>
          </div>

          {/* Exchange dots visualization */}
          <div className="flex items-center gap-1.5 mt-1">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  i < completed ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        <Button
          onClick={onAddExchange}
          className="w-full mt-4 rounded-xl h-12 text-sm font-semibold shadow-md shadow-primary/20 active:scale-[0.98] transition-transform"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('log_exchange')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TodayProgress;
