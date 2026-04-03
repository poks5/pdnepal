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
    <div className="space-y-4 page-transition">
      {/* Greeting – compact native style */}
      <div className="rounded-2xl gradient-hero p-4 sm:p-5 text-primary-foreground shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base sm:text-lg font-bold">{greetingEmoji} {t(greetingKey)}{firstName ? `, ${firstName}` : ''}</p>
            <p className="text-xs opacity-80 mt-0.5">{t('pdJourneyGreat')}</p>
            {streak > 0 && (
              <span className="inline-flex items-center bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-[11px] font-semibold mt-2">
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
