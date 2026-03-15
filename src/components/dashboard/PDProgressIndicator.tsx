import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Droplets, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PDProgressIndicatorProps {
  completed: number;
  prescribed: number;
  /** Compact mode for sidebars / cards */
  compact?: boolean;
  className?: string;
}

/**
 * Standardized PD progress component used across the entire app.
 * Shows "Today's PD Progress: X / Y exchanges completed"
 */
const PDProgressIndicator: React.FC<PDProgressIndicatorProps> = ({
  completed,
  prescribed,
  compact = false,
  className = '',
}) => {
  const { t } = useLanguage();
  const percentage = prescribed > 0 ? Math.min(100, Math.round((completed / prescribed) * 100)) : 0;
  const allDone = completed >= prescribed;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {allDone ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        ) : (
          <Droplets className="w-4 h-4 text-primary shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs mb-0.5">
            <span className="text-muted-foreground truncate">
              {allDone ? '✅ All done' : `${completed}/${prescribed} exchanges`}
            </span>
            <span className="font-bold text-primary ml-1">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-1.5" />
        </div>
      </div>
    );
  }

  return (
    <Card className={`border-border/40 rounded-xl ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {allDone ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : completed === 0 ? (
            <AlertCircle className="w-4 h-4 text-amber-500" />
          ) : (
            <Droplets className="w-4 h-4 text-primary" />
          )}
          <span className="text-sm font-bold text-foreground">
            {t('today_progress') || "Today's PD Progress"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-2">
          {allDone
            ? '🎉 Great job! All exchanges completed for today!'
            : `${completed} of ${prescribed} exchanges completed`}
        </p>
        <div className="flex items-center gap-3">
          <Progress value={percentage} className="h-3 flex-1 rounded-full" />
          <span className="text-sm font-bold text-primary min-w-[40px] text-right">{percentage}%</span>
        </div>
        {/* Exchange dots */}
        <div className="flex items-center gap-2 mt-2">
          {Array.from({ length: prescribed }).map((_, i) => {
            const colors = ['bg-primary', 'bg-[hsl(var(--coral))]', 'bg-[hsl(var(--lavender))]', 'bg-[hsl(var(--mint))]'];
            return (
              <div
                key={i}
                className={`h-2.5 flex-1 rounded-full transition-all duration-500 ${
                  i < completed
                    ? `${colors[i % colors.length]} shadow-sm`
                    : 'bg-muted'
                }`}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PDProgressIndicator;
