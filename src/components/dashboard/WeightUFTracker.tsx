
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, Weight, Clock, Plus } from 'lucide-react';
import { usePatient } from '@/contexts/PatientContext';
import { DailyExchangeLog } from '@/types/patient';

const WeightUFTracker: React.FC = () => {
  const {
    exchangeLogs,
    patientProfile
  } = usePatient();

  // Calculate UF for last 24 hours (6 AM to 6 AM)
  const calculate24HourUF = (): number => {
    const now = new Date();
    
    // Calculate the most recent 6 AM boundary
    let endTime = new Date(now);
    endTime.setHours(6, 0, 0, 0);
    
    // If current time is before 6 AM today, use yesterday's 6 AM
    if (now.getHours() < 6) {
      endTime.setDate(endTime.getDate() - 1);
    }
    
    // Start time is 24 hours before end time
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
    
    console.log('UF Calculation:', {
      now: now.toISOString(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      totalLogs: exchangeLogs.length
    });

    const relevantExchanges = exchangeLogs.filter((log: DailyExchangeLog) => {
      const logTime = new Date(log.timestamp);
      const isInRange = logTime >= startTime && logTime < endTime;
      
      if (isInRange) {
        console.log('Including exchange:', {
          timestamp: log.timestamp,
          ultrafiltration: log.ultrafiltration
        });
      }
      
      return isInRange;
    });
    
    const totalUF = relevantExchanges.reduce((total, log) => total + log.ultrafiltration, 0);
    
    console.log('24hr UF Total:', {
      relevantExchanges: relevantExchanges.length,
      totalUF
    });
    
    return totalUF;
  };

  const totalUF = calculate24HourUF();
  const currentWeight = 65.5; // This would come from patient data in real implementation

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Card className="p-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium">24hr UF Total</CardTitle>
          <Droplets className="h-3 w-3 text-blue-500" />
        </CardHeader>
        <CardContent className="p-0 pt-1">
          <div className="text-lg font-bold text-blue-600">{totalUF}ml</div>
          <p className="text-xs text-muted-foreground">6 AM to 6 AM</p>
        </CardContent>
      </Card>

      <Card className="p-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium">Current Weight</CardTitle>
          <Weight className="h-3 w-3 text-green-500" />
        </CardHeader>
        <CardContent className="p-0 pt-1">
          <div className="text-lg font-bold text-green-600">{currentWeight} kg</div>
          <p className="text-xs text-muted-foreground">Last recorded</p>
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-orange-600 font-medium">Weigh after draining</p>
            <p className="text-xs text-muted-foreground">Each exchange</p>
          </div>
        </CardContent>
      </Card>

      <Card className="p-3">
        <CardContent className="p-0 pt-1">
          <div className="text-sm font-medium text-purple-600">
            {/* Placeholder for future content */}
          </div>
          <div className="mt-1">
            {/* Placeholder for future content */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeightUFTracker;
