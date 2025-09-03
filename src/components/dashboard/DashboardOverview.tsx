
import React from 'react';
import TodayProgress from './TodayProgress';
import WeeklyStats from './WeeklyStats';
import RecentExchanges from './RecentExchanges';
import WeightUFTracker from './WeightUFTracker';
import QuickActions from '../QuickActions';
import { DailyExchangeLog } from '@/types/patient';

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
  return (
    <div className="space-y-6">
      <TodayProgress
        completed={todayExchanges.completed}
        total={todayExchanges.total}
        nextTime={todayExchanges.nextTime}
        onAddExchange={onAddExchange}
      />

      <QuickActions />

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
