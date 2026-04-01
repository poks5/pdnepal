import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, Target, Star, Award, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DailyExchangeLog } from '@/types/patient';
import { usePrescription } from '@/hooks/usePrescription';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
  target?: number;
}

interface AchievementsBadgesProps {
  allExchangeLogs: DailyExchangeLog[];
}

const ICON_MAP: Record<string, React.ReactNode> = {
  flame: <Flame className="w-5 h-5" />,
  target: <Target className="w-5 h-5" />,
  star: <Star className="w-5 h-5" />,
  award: <Award className="w-5 h-5" />,
  heart: <Heart className="w-5 h-5" />,
  trophy: <Trophy className="w-5 h-5" />,
};

const AchievementsBadges: React.FC<AchievementsBadgesProps> = ({ allExchangeLogs }) => {
  const { user } = useAuth();
  const { dailyExchanges } = usePrescription(user?.id);

  const { streak, achievements } = useMemo(() => {
    const logDates = new Map<string, number>();
    allExchangeLogs.forEach((e) => {
      const d = new Date(e.timestamp).toDateString();
      logDates.set(d, (logDates.get(d) || 0) + 1);
    });

    // Calculate streak
    let streak = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      if (logDates.has(d.toDateString())) {
        streak++;
      } else if (i > 0) break;
      d.setDate(d.getDate() - 1);
    }

    // Perfect adherence days (completed all prescribed exchanges)
    let perfectDays = 0;
    logDates.forEach((count) => {
      if (count >= dailyExchanges) perfectDays++;
    });

    const totalExchanges = allExchangeLogs.length;

    const achievements: Achievement[] = [
      {
        id: 'streak-7',
        title: '7-Day Warrior',
        description: '7 consecutive days of exchanges',
        icon: 'flame',
        earned: streak >= 7,
        progress: Math.min(streak, 7),
        target: 7,
      },
      {
        id: 'streak-30',
        title: '30-Day Champion',
        description: '30 consecutive days of exchanges',
        icon: 'trophy',
        earned: streak >= 30,
        progress: Math.min(streak, 30),
        target: 30,
      },
      {
        id: 'perfect-7',
        title: 'Perfect Week',
        description: '7 days with all prescribed exchanges',
        icon: 'star',
        earned: perfectDays >= 7,
        progress: Math.min(perfectDays, 7),
        target: 7,
      },
      {
        id: 'exchanges-50',
        title: 'Half Century',
        description: 'Logged 50 exchanges total',
        icon: 'target',
        earned: totalExchanges >= 50,
        progress: Math.min(totalExchanges, 50),
        target: 50,
      },
      {
        id: 'exchanges-100',
        title: 'Century Club',
        description: 'Logged 100 exchanges',
        icon: 'award',
        earned: totalExchanges >= 100,
        progress: Math.min(totalExchanges, 100),
        target: 100,
      },
      {
        id: 'dedication',
        title: 'Dedicated Patient',
        description: '14 perfect adherence days',
        icon: 'heart',
        earned: perfectDays >= 14,
        progress: Math.min(perfectDays, 14),
        target: 14,
      },
    ];

    return { streak, achievements };
  }, [allExchangeLogs, dailyExchanges]);

  const earnedCount = achievements.filter((a) => a.earned).length;

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--warning))]/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-[hsl(var(--warning))]" />
            </div>
            <span>Achievements</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {earnedCount}/{achievements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Streak highlight */}
        {streak > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-[hsl(var(--warning))]/10 to-[hsl(var(--coral))]/10 border border-[hsl(var(--warning))]/20">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🔥</div>
              <div>
                <p className="font-bold text-lg text-foreground">{streak} Day Streak!</p>
                <p className="text-xs text-muted-foreground">Keep going — you're doing great!</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`relative flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                a.earned
                  ? 'bg-primary/5 border-primary/20 shadow-sm'
                  : 'bg-muted/30 border-border opacity-50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 ${
                  a.earned
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {ICON_MAP[a.icon] || <Trophy className="w-5 h-5" />}
              </div>
              <p className="text-[11px] font-semibold leading-tight">{a.title}</p>
              {!a.earned && a.progress !== undefined && a.target && (
                <div className="w-full mt-1.5">
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/40 rounded-full transition-all"
                      style={{ width: `${(a.progress / a.target) * 100}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-0.5">
                    {a.progress}/{a.target}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementsBadges;
