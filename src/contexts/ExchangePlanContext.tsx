import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from '@/integrations/supabase/types';

export interface ExchangeSchedule {
  id: string;
  time: string;
  type: 'morning' | 'afternoon' | 'evening' | 'night';
  fillVolume: number;
  dwellTime: number;
  solution: 'low' | 'medium' | 'high';
  enabled: boolean;
}

export interface ExchangePlan {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  name: string;
  description?: string;
  schedules: ExchangeSchedule[];
  isActive: boolean;
  createdAt: string;
  modifiedAt: string;
  effectiveFrom?: string;
  effectiveUntil?: string | null;
  notes: string;
  totalDailyVolume: number;
}

interface ExchangePlanContextType {
  plans: ExchangePlan[];
  currentPlan: ExchangePlan | null;
  loading: boolean;
  createPlan: (plan: Omit<ExchangePlan, 'id' | 'createdAt' | 'modifiedAt'>) => Promise<void>;
  updatePlan: (planId: string, updates: Partial<ExchangePlan>) => Promise<void>;
  setActivePlan: (planId: string) => Promise<void>;
  getPlanForPatient: (patientId: string) => ExchangePlan | null;
  deletePlan: (planId: string) => Promise<void>;
  refreshPlans: () => Promise<void>;
}

const ExchangePlanContext = createContext<ExchangePlanContextType | undefined>(undefined);

export const useExchangePlan = () => {
  const context = useContext(ExchangePlanContext);
  if (context === undefined) {
    throw new Error('useExchangePlan must be used within an ExchangePlanProvider');
  }
  return context;
};

// Map DB row to ExchangePlan
const mapRowToPlan = (row: any): ExchangePlan => ({
  id: row.id,
  patientId: row.patient_id,
  doctorId: row.prescribed_by,
  name: row.plan_name,
  schedules: (Array.isArray(row.exchanges) ? row.exchanges : []) as ExchangeSchedule[],
  isActive: row.is_active ?? false,
  createdAt: row.created_at,
  modifiedAt: row.updated_at,
  effectiveFrom: row.effective_from,
  effectiveUntil: row.effective_until,
  notes: row.notes || '',
  totalDailyVolume: ((Array.isArray(row.exchanges) ? row.exchanges : []) as ExchangeSchedule[])
    .filter(s => s.enabled)
    .reduce((sum, s) => sum + (s.fillVolume || 0), 0),
});

export const ExchangePlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<ExchangePlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    if (!user) { setPlans([]); setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exchange_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans((data || []).map(mapRowToPlan));
    } catch (err) {
      console.error('Failed to fetch exchange plans:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const currentPlan = plans.find(p => p.isActive) || null;

  const createPlan = async (planData: Omit<ExchangePlan, 'id' | 'createdAt' | 'modifiedAt'>) => {
    if (!user) return;
    const { error } = await supabase
      .from('exchange_plans')
      .insert({
        patient_id: planData.patientId,
        prescribed_by: user.id,
        plan_name: planData.name,
        exchanges: planData.schedules as unknown as Json,
        is_active: planData.isActive ?? false,
        notes: planData.notes || null,
        effective_from: planData.effectiveFrom || new Date().toISOString().split('T')[0],
        effective_until: planData.effectiveUntil || null,
      });
    if (error) throw error;
    await fetchPlans();
  };

  const updatePlan = async (planId: string, updates: Partial<ExchangePlan>) => {
    const updatePayload: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) updatePayload.plan_name = updates.name;
    if (updates.schedules !== undefined) updatePayload.exchanges = updates.schedules as unknown as Json;
    if (updates.isActive !== undefined) updatePayload.is_active = updates.isActive;
    if (updates.notes !== undefined) updatePayload.notes = updates.notes;
    if (updates.effectiveUntil !== undefined) updatePayload.effective_until = updates.effectiveUntil;

    const { error } = await supabase
      .from('exchange_plans')
      .update(updatePayload)
      .eq('id', planId);
    if (error) throw error;
    await fetchPlans();
  };

  const setActivePlan = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    // Deactivate other plans for same patient
    const samePt = plans.filter(p => p.patientId === plan.patientId && p.id !== planId);
    for (const p of samePt) {
      await supabase.from('exchange_plans').update({ is_active: false }).eq('id', p.id);
    }
    await supabase.from('exchange_plans').update({ is_active: true }).eq('id', planId);
    await fetchPlans();
  };

  const getPlanForPatient = (patientId: string) => {
    return plans.find(plan => plan.patientId === patientId && plan.isActive) || null;
  };

  const deletePlan = async (planId: string) => {
    const { error } = await supabase.from('exchange_plans').delete().eq('id', planId);
    if (error) throw error;
    await fetchPlans();
  };

  const value = {
    plans,
    currentPlan,
    loading,
    createPlan,
    updatePlan,
    setActivePlan,
    getPlanForPatient,
    deletePlan,
    refreshPlans: fetchPlans,
  };

  return (
    <ExchangePlanContext.Provider value={value}>
      {children}
    </ExchangePlanContext.Provider>
  );
};
