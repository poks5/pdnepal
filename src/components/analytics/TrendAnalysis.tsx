
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Calendar } from 'lucide-react';
import { usePatient } from '@/contexts/PatientContext';
import { DailyExchangeLog } from '@/types/patient';

const TrendAnalysis: React.FC = () => {
  const { exchangeLogs } = usePatient();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | '3months'>('month');

  const getFilteredData = () => {
    const now = new Date();
    const daysBack = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    return exchangeLogs.filter(log => new Date(log.timestamp) >= cutoffDate);
  };

  const getUFTrendData = () => {
    const filteredLogs = getFilteredData();
    const dailyUF = new Map<string, number>();
    
    filteredLogs.forEach(log => {
      const date = new Date(log.timestamp).toISOString().split('T')[0];
      const current = dailyUF.get(date) || 0;
      dailyUF.set(date, current + log.ultrafiltration);
    });
    
    return Array.from(dailyUF.entries())
      .map(([date, uf]) => ({ date, uf, target: 500 }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const getWeeklyStats = () => {
    const data = getUFTrendData();
    const recent = data.slice(-7);
    const previous = data.slice(-14, -7);
    
    const recentAvg = recent.reduce((sum, d) => sum + d.uf, 0) / recent.length;
    const previousAvg = previous.reduce((sum, d) => sum + d.uf, 0) / previous.length;
    
    return {
      current: Math.round(recentAvg),
      change: Math.round(((recentAvg - previousAvg) / previousAvg) * 100),
      trend: recentAvg > previousAvg ? 'up' : 'down'
    };
  };

  const getPredictiveAlerts = () => {
    const data = getUFTrendData();
    const alerts = [];
    
    // Check for declining UF trend
    if (data.length >= 7) {
      const recent = data.slice(-7);
      const declining = recent.every((day, index) => 
        index === 0 || day.uf <= recent[index - 1].uf
      );
      
      if (declining) {
        alerts.push({
          type: 'warning',
          message: 'Declining UF trend detected over last 7 days',
          recommendation: 'Consider reviewing dialysate strength or dwell times'
        });
      }
    }
    
    // Check for consistently low UF
    const recentAvg = data.slice(-7).reduce((sum, d) => sum + d.uf, 0) / 7;
    if (recentAvg < 300) {
      alerts.push({
        type: 'alert',
        message: 'Low average UF detected',
        recommendation: 'Consult with nephrologist about adequacy'
      });
    }
    
    return alerts;
  };

  const chartConfig = {
    uf: {
      label: "Ultrafiltration (ml)",
      color: "#3b82f6",
    },
    target: {
      label: "Target UF",
      color: "#10b981",
    },
  };

  const trendData = getUFTrendData();
  const weeklyStats = getWeeklyStats();
  const alerts = getPredictiveAlerts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Trend Analysis</h2>
        <div className="flex space-x-2">
          <Button 
            variant={timeRange === 'week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeRange('week')}
          >
            7 Days
          </Button>
          <Button 
            variant={timeRange === 'month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeRange('month')}
          >
            30 Days
          </Button>
          <Button 
            variant={timeRange === '3months' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeRange('3months')}
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Predictive Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span>Predictive Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className="border rounded-lg p-4 bg-orange-50">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-800">{alert.message}</p>
                      <p className="text-sm text-orange-600 mt-1">{alert.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Weekly Average UF</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{weeklyStats.current}ml</span>
              <div className="flex items-center space-x-1">
                {weeklyStats.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm ${weeklyStats.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(weeklyStats.change)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Target Achievement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((weeklyStats.current / 500) * 100)}%
            </div>
            <p className="text-sm text-gray-600">of daily target</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Data Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trendData.length}</div>
            <p className="text-sm text-gray-600">days recorded</p>
          </CardContent>
        </Card>
      </div>

      {/* UF Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Ultrafiltration Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="uf"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#10b981"
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendAnalysis;
