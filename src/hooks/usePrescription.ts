import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PDPrescription {
  id: string;
  patient_id: string;
  daily_exchanges: number;
  fill_volume_ml: number;
  dwell_time_hours: number | null;
  dialysate_type: string | null;
  glucose_concentration: string | null;
  active_from: string;
  active_to: string | null;
  created_by: string;
  notes: string | null;
}

const DEFAULT_PRESCRIPTION: Omit<PDPrescription, 'id' | 'patient_id' | 'created_by' | 'active_from' | 'active_to' | 'notes'> = {
  daily_exchanges: 4,
  fill_volume_ml: 2000,
  dwell_time_hours: 4,
  dialysate_type: 'Dianeal',
  glucose_concentration: '1.5%',
};

/**
 * Centralized hook to fetch the active PD prescription for a patient.
 * All components should use this instead of hardcoded values.
 */
export function usePrescription(patientId: string | undefined) {
  const [prescription, setPrescription] = useState<PDPrescription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    const fetchPrescription = async () => {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('pd_prescriptions' as any)
        .select('*')
        .eq('patient_id', patientId)
        .lte('active_from', today)
        .or(`active_to.is.null,active_to.gte.${today}`)
        .order('active_from', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setPrescription(data as unknown as PDPrescription);
      } else {
        setPrescription(null);
      }
      setLoading(false);
    };

    fetchPrescription();

    // Realtime subscription for prescription changes
    const channel = supabase
      .channel(`prescription-${patientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pd_prescriptions',
          filter: `patient_id=eq.${patientId}`,
        },
        () => { fetchPrescription(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [patientId]);

  return {
    prescription,
    loading,
    dailyExchanges: prescription?.daily_exchanges ?? DEFAULT_PRESCRIPTION.daily_exchanges,
    fillVolume: prescription?.fill_volume_ml ?? DEFAULT_PRESCRIPTION.fill_volume_ml,
    dwellTime: prescription?.dwell_time_hours ?? DEFAULT_PRESCRIPTION.dwell_time_hours,
    dialysateType: prescription?.dialysate_type ?? DEFAULT_PRESCRIPTION.dialysate_type,
    glucoseConcentration: prescription?.glucose_concentration ?? DEFAULT_PRESCRIPTION.glucose_concentration,
    hasPrescription: !!prescription,
  };
}
