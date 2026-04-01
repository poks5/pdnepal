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
import patientHero from '@/assets/patient-hero.png';

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

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl gradient-hero p-5 sm:p-6 text-primary-foreground shadow-xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />

        <div className="flex items-center justify-between relative">
          <div className="flex-1">
            <p className="text-lg sm:text-xl font-bold">{greetingEmoji} {t(greetingKey)}{firstName ? `, ${firstName}` : ''}</p>
            <p className="text-sm opacity-85 mt-1">{t('pdJourneyGreat')}</p>
            {(() => {
              const logDates = new Set(allExchangeLogs.map(e => new Date(e.timestamp).toDateString()));
              let streak = 0;
              const d = new Date();
              for (let i = 0; i < 365; i++) {
                if (logDates.has(d.toDateString())) {
                  streak++;
                } else if (i > 0) break;
                d.setDate(d.getDate() - 1);
              }
              return streak > 0 ? (
                <div className="flex items-center gap-2 mt-3">
                  <span className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold">
                    {t('dayStreak')}: 🔥 {streak}
                  </span>
                </div>
              ) : null;
            })()}
          </div>
          <img
            src={patientHero}
            alt="Patient illustration"
            className="w-28 h-20 sm:w-36 sm:h-24 object-contain drop-shadow-lg hidden sm:block"
          />
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
