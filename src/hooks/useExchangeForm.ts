
import { useState, useEffect } from 'react';
import { usePatient } from '@/contexts/PatientContext';
import { calculateUF } from '@/utils/ufCalculations';

export interface ExchangeData {
  time: string;
  type: 'morning' | 'afternoon' | 'evening' | 'night';
  drainVolume: number;
  fillVolume: number;
  ultrafiltration: number;
  weightAfter: number | null;
  clarity: 'clear' | 'cloudy';
  color: 'normal' | 'yellow' | 'red' | 'brown';
  pain: number;
  symptoms: string[];
  notes: string;
}

export const useExchangeForm = () => {
  const { exchangeLogs } = usePatient();
  
  const [formData, setFormData] = useState<ExchangeData>({
    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    type: 'morning',
    drainVolume: null as unknown as number,
    fillVolume: 2000,
    ultrafiltration: 0,
    weightAfter: null,
    clarity: 'clear',
    color: 'normal',
    pain: 0,
    symptoms: [],
    notes: ''
  });

  const [previousFillVolume, setPreviousFillVolume] = useState<number | null>(null);
  const [isUFAutoCalculated, setIsUFAutoCalculated] = useState(false);

  // Get the most recent exchange's fill volume and weight when component mounts
  useEffect(() => {
    if (exchangeLogs && exchangeLogs.length > 0) {
      const sortedLogs = [...exchangeLogs].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const lastExchange = sortedLogs[0];
      setPreviousFillVolume(lastExchange.fillVolume);
    }

    // Fetch the last recorded weight from the database
    const fetchLastWeight = async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('exchange_logs')
        .select('weight_after_kg')
        .not('weight_after_kg', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (data?.weight_after_kg) {
        setFormData(prev => ({ ...prev, weightAfter: Number(data.weight_after_kg) }));
      }
    };
    fetchLastWeight();
  }, [exchangeLogs]);

  // Auto-calculate UF when drain volume changes
  useEffect(() => {
    if (previousFillVolume && formData.drainVolume > 0 && !isUFAutoCalculated) {
      const calculatedUF = calculateUF(formData.drainVolume, previousFillVolume, formData.fillVolume);
      setFormData(prev => ({ ...prev, ultrafiltration: calculatedUF }));
      setIsUFAutoCalculated(true);
    }
  }, [formData.drainVolume, previousFillVolume, isUFAutoCalculated]);

  const updateField = (field: keyof ExchangeData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'ultrafiltration') {
      setIsUFAutoCalculated(false);
    }
  };

  return {
    formData,
    updateField,
    previousFillVolume,
    isUFAutoCalculated,
    setIsUFAutoCalculated
  };
};
