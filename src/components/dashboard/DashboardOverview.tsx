import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import WeeklyStats from './WeeklyStats';
import RecentExchanges from './RecentExchanges';
import WeightUFTracker from './WeightUFTracker';
import HealthTips from './HealthTips';
import QuickActions from '../QuickActions';
import PatientTrends from './PatientTrends';
import AchievementsBadges from './AchievementsBadges';
import AIWeeklySummary from './AIWeeklySummary';
import { DailyExchangeLog } from '@/types/patient';
import { useAuth } from '@/contexts/AuthContext';
import TodayProgress from './TodayProgress';

interface DashboardOverviewProps {
  todayExchanges: {
    completed: number;
    total: number;
    nextTime: string;
  };
  weeklyStats: {
    adherence: number;
    avgUF: number;
    missedExchanges: number;
  };
  recentExchanges: DailyExchangeLog[];
  allExchangeLogs: DailyExchangeLog[];
  onAddExchange: () => void;
  loadingExchanges?: boolean;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  todayExchanges,
  weeklyStats,
  recentExchanges,
  allExchangeLogs,
  onAddExchange,
  loadingExchanges = false,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const hour = new Date().getHours();
  const greetingKey = hour >= 5 && hour < 12 ? 'goodMorning' : hour >= 12 && hour < 17 ? 'goodAfternoon' : hour >= 17 && hour < 21 ? 'goodEvening' : 'goodNight';
  const greetingEmoji = hour >= 5 && hour < 12 ? '🌅' : hour >= 12 && hour < 17 ? '🙏' : hour >= 17 && hour < 21 ? '🌇' : '🌙';
  const firstName = user?.fullName?.split(' ')[0] || '';

  // Streak calculation
  const logDates = new Set(allExchangeLogs.map(e => new Date(e.timestamp).toDateString()));
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    if (logDates.has(d.toDateString())) { streak++; } else if (i > 0) break;
    d.setDate(d.getDate() - 1);
  }

  return (
    <div className="space-y-5 page-transition max-w-2xl mx-auto">
      {/* Greeting – prestige emerald → gold */}
      <div className="relative rounded-[28px] gradient-prestige p-5 sm:p-6 text-primary-foreground shadow-emerald overflow-hidden grain">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[hsl(var(--gold))]/20 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-[0.22em] font-medium text-[hsl(var(--cream))]/70">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-semibold mt-1.5 leading-tight">
              {greetingEmoji} {t(greetingKey)}{firstName ? `, ${firstName}` : ''}
            </h2>
            <p className="text-xs sm:text-sm text-[hsl(var(--cream))]/80 mt-1.5">{t('pdJourneyGreat')}</p>
            {streak > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-[hsl(var(--gold))]/20 backdrop-blur-sm border border-[hsl(var(--gold))]/40 rounded-full px-3 py-1 text-[11px] font-semibold mt-3 text-[hsl(var(--cream))]">
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--gold))] animate-pulse" />
                🔥 {streak} {t('dayStreak')}
              </span>
            )}
          </div>
        </div>
      </div>


      <TodayProgress
        completed={todayExchanges.completed}
        total={todayExchanges.total}
        nextTime={todayExchanges.nextTime}
        onAddExchange={onAddExchange}
      />

      <QuickActions />

      <AIWeeklySummary allExchangeLogs={allExchangeLogs} />

      <AchievementsBadges allExchangeLogs={allExchangeLogs} />

      <HealthTips />
      <WeightUFTracker />

      <PatientTrends />

      <WeeklyStats
        adherence={weeklyStats.adherence}
        avgUF={weeklyStats.avgUF}
        missedExchanges={weeklyStats.missedExchanges}
      />

      <RecentExchanges exchanges={recentExchanges} loading={loadingExchanges} />
    </div>
  );
};

export default DashboardOverview;
