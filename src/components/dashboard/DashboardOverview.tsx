import React from 'react';
import TodayProgress from './TodayProgress';
import WeeklyStats from './WeeklyStats';
import RecentExchanges from './RecentExchanges';
import WeightUFTracker from './WeightUFTracker';
import HealthTips from './HealthTips';
import QuickActions from '../QuickActions';
import { DailyExchangeLog } from '@/types/patient';
import { useAuth } from '@/contexts/AuthContext';
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
  onAddExchange: () => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  todayExchanges,
  weeklyStats,
  recentExchanges,
  onAddExchange
}) => {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour >= 5 && hour < 12 ? '🌅 शुभ प्रभात' : hour >= 12 && hour < 17 ? '🙏 नमस्ते' : hour >= 17 && hour < 21 ? '🌇 शुभ सन्ध्या' : '🌙 शुभ रात्रि';
  const firstName = user?.fullName?.split(' ')[0] || '';

  return (
    <div className="space-y-5">
      {/* Greeting banner with illustration */}
      <div className="relative overflow-hidden rounded-3xl gradient-hero p-5 sm:p-6 text-primary-foreground shadow-xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />

        <div className="flex items-center justify-between relative">
          <div className="flex-1">
            <p className="text-lg sm:text-xl font-bold">{greeting}</p>
            <p className="text-sm opacity-85 mt-1">Your PD journey is looking great today!</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold">
                Day streak: 🔥 7
              </span>
            </div>
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

      <HealthTips />

      <WeightUFTracker />

      <WeeklyStats
        adherence={weeklyStats.adherence}
        avgUF={weeklyStats.avgUF}
        missedExchanges={weeklyStats.missedExchanges}
      />

      <RecentExchanges exchanges={recentExchanges} />
    </div>
  );
};

export default DashboardOverview;
