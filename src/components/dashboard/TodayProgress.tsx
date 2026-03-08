import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Clock, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import kidneyMascot from '@/assets/kidney-mascot.png';

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
  const allDone = completed >= total;

  return (
    <Card className="border-0 shadow-lg overflow-hidden relative">
      {/* Gradient background */}
      <div className="absolute inset-0 gradient-hero opacity-[0.07]" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-8 translate-x-8 blob" />

      <CardContent className="p-5 sm:p-6 relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold text-foreground">{t('today_progress')}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {allDone ? '🎉 Great job! All done for today!' : `${completed} of ${total} exchanges done`}
            </p>

            <div className="flex items-center gap-2 mt-3 bg-primary/5 rounded-full pl-3 pr-4 py-1.5 w-fit">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">Next: {nextTime}</span>
            </div>
          </div>

          {/* Mascot */}
          <img
            src={kidneyMascot}
            alt="Kidney mascot"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain animate-float drop-shadow-md"
          />
        </div>

        {/* Progress section */}
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center gap-3">
            <Progress value={percentage} className="h-3.5 flex-1 rounded-full" />
            <span className="text-sm font-bold text-primary min-w-[40px] text-right">{percentage}%</span>
          </div>

          {/* Colorful exchange dots */}
          <div className="flex items-center gap-2">
            {Array.from({ length: total }).map((_, i) => {
              const colors = ['bg-primary', 'bg-[hsl(var(--coral))]', 'bg-[hsl(var(--lavender))]', 'bg-[hsl(var(--mint))]'];
              return (
                <div
                  key={i}
                  className={`h-3 flex-1 rounded-full transition-all duration-500 ${
                    i < completed
                      ? `${colors[i % colors.length]} shadow-sm`
                      : 'bg-muted'
                  }`}
                />
              );
            })}
          </div>
        </div>

        <Button
          onClick={onAddExchange}
          size="lg"
          className="w-full mt-5 rounded-2xl h-14 text-base font-bold shadow-lg shadow-primary/25 active:scale-[0.97] transition-all bg-primary hover:bg-primary/90"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('log_exchange')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TodayProgress;
