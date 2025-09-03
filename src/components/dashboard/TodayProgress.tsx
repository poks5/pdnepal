
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Plus } from 'lucide-react';
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>{t('today_progress')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {t('exchanges_completed')}: {completed}/{total}
            </span>
            <Badge variant="outline">
              {t('next_at')} {nextTime}
            </Badge>
          </div>
          <Progress 
            value={(completed / total) * 100} 
            className="h-3"
          />
          <Button 
            onClick={onAddExchange}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('log_exchange')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TodayProgress;
