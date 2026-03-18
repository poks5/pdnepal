
import { DailyExchangeLog, ExchangeAdditiveInfo } from '@/types/patient';

export interface FormattedExchange {
  id: string;
  date: string;
  time: string;
  type: 'morning' | 'afternoon' | 'evening' | 'night';
  drainVolume: number;
  fillVolume: number;
  ultrafiltration: number;
  clarity: 'clear' | 'cloudy';
  color: 'normal' | 'yellow' | 'red' | 'brown';
  pain: number;
  notes?: string;
  symptoms?: string[];
  solutionType?: string;
  weightAfterKg?: number | null;
  bloodPressureSystolic?: number | null;
  bloodPressureDiastolic?: number | null;
  temperature?: number | null;
  additive?: ExchangeAdditiveInfo | null;
}

export const formatExchangeForHistory = (log: DailyExchangeLog): FormattedExchange => ({
  id: log.id,
  date: new Date(log.timestamp).toLocaleDateString(),
  time: new Date(log.timestamp).toLocaleTimeString(),
  type: log.exchangeType as 'morning' | 'afternoon' | 'evening' | 'night',
  drainVolume: log.drainVolume || 0,
  fillVolume: log.fillVolume || 0,
  ultrafiltration: log.ultrafiltration || 0,
  clarity: log.clarity as 'clear' | 'cloudy',
  color: 'normal',
  pain: log.painLevel || 0,
  notes: log.notes,
  symptoms: log.symptomTags || [],
  solutionType: log.dialysateStrength || undefined,
  weightAfterKg: log.weightAfterKg ?? null,
  bloodPressureSystolic: log.bloodPressureSystolic ?? null,
  bloodPressureDiastolic: log.bloodPressureDiastolic ?? null,
  temperature: log.temperature ?? null,
  additive: log.additive ?? null,
});
