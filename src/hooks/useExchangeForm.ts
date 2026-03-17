import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePatient } from '@/contexts/PatientContext';
import { calculateUF } from '@/utils/ufCalculations';

export interface AdditiveData {
  additiveType: 'none' | 'heparin' | 'antibiotic' | 'other';
  drugName: string;
  dose: string;
  reason: string;
}

export interface ExchangeData {
  time: string;
  type: 'morning' | 'afternoon' | 'evening' | 'night';
  drainVolume: number;
  fillVolume: number;
  ultrafiltration: number;
  weightAfter: number | null;
  solutionType: string;
  clarity: 'clear' | 'cloudy';
  color: 'normal' | 'yellow' | 'red' | 'brown';
  pain: number;
  symptoms: string[];
  notes: string;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  temperature: number | null;
  additive: AdditiveData;
}

export const useExchangeForm = () => {
  const { user, loading: authLoading } = useAuth();
  const { exchangeLogs } = usePatient();

  const [formData, setFormData] = useState<ExchangeData>({
    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    type: 'morning',
    drainVolume: null as unknown as number,
    fillVolume: 2000,
    ultrafiltration: 0,
    weightAfter: null,
    solutionType: 'Dianeal 1.5%',
    clarity: 'clear',
    color: 'normal',
    pain: 0,
    symptoms: [],
    notes: '',
    bloodPressureSystolic: null,
    bloodPressureDiastolic: null,
    temperature: null,
    additive: { additiveType: 'none', drugName: '', dose: '', reason: '' },
  });

  const [previousFillVolume, setPreviousFillVolume] = useState<number | null>(null);
  const [recentAdditive, setRecentAdditive] = useState<AdditiveData | null>(null);
  const [isLoadingReferenceData, setIsLoadingReferenceData] = useState(true);
  const [isUFAutoCalculated, setIsUFAutoCalculated] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadReferenceData = async () => {
      if (exchangeLogs && exchangeLogs.length > 0) {
        const sortedLogs = [...exchangeLogs].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setPreviousFillVolume(sortedLogs[0].fillVolume);
      } else {
        setPreviousFillVolume(null);
      }

      if (authLoading || !user) {
        if (!authLoading && isActive) {
          setRecentAdditive(null);
          setIsLoadingReferenceData(false);
        }
        return;
      }

      setIsLoadingReferenceData(true);
      const { supabase } = await import('@/integrations/supabase/client');

      const [lastWeightResult, lastAdditiveResult] = await Promise.all([
        supabase
          .from('exchange_logs')
          .select('weight_after_kg')
          .eq('patient_id', user.id)
          .not('weight_after_kg', 'is', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('exchange_additives')
          .select('additive_type, drug_name, dose, reason')
          .eq('patient_id', user.id)
          .neq('additive_type', 'none')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (!isActive) return;

      if (lastWeightResult.data?.weight_after_kg != null) {
        setFormData((prev) => ({ ...prev, weightAfter: Number(lastWeightResult.data.weight_after_kg) }));
      }

      setRecentAdditive(
        lastAdditiveResult.data
          ? {
              additiveType: lastAdditiveResult.data.additive_type as AdditiveData['additiveType'],
              drugName: lastAdditiveResult.data.drug_name ?? '',
              dose: lastAdditiveResult.data.dose ?? '',
              reason: lastAdditiveResult.data.reason ?? '',
            }
          : null
      );
      setIsLoadingReferenceData(false);
    };

    loadReferenceData();

    return () => {
      isActive = false;
    };
  }, [authLoading, user, exchangeLogs]);

  // Auto-calculate UF whenever drain or fill volume changes
  useEffect(() => {
    if (formData.drainVolume && formData.drainVolume > 0) {
      const infillVolume = previousFillVolume ?? formData.fillVolume;
      const calculatedUF = calculateUF(formData.drainVolume, infillVolume, formData.fillVolume);
      setFormData((prev) => ({ ...prev, ultrafiltration: calculatedUF }));
      setIsUFAutoCalculated(true);
    }
  }, [formData.drainVolume, formData.fillVolume, previousFillVolume]);

  const updateField = (field: keyof ExchangeData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'ultrafiltration') {
      setIsUFAutoCalculated(false);
    }
  };

  return {
    formData,
    updateField,
    previousFillVolume,
    recentAdditive,
    isLoadingReferenceData,
    isUFAutoCalculated,
    setIsUFAutoCalculated,
  };
};