import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePersistence } from '@/hooks/usePersistence';

export interface ExchangeSchedule {
  id: string;
  time: string;
  type: 'morning' | 'afternoon' | 'evening' | 'night';
  fillVolume: number;
  dwellTime: number; // in minutes
  solution: 'low' | 'medium' | 'high'; // glucose concentration
  enabled: boolean;
}

export interface ExchangePlan {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  name: string;
  description: string;
  schedules: ExchangeSchedule[];
  isActive: boolean;
  createdAt: string;
  modifiedAt: string;
  modifiedBy: string;
  totalDailyVolume: number;
  notes: string;
}

interface ExchangePlanContextType {
  plans: ExchangePlan[];
  currentPlan: ExchangePlan | null;
  createPlan: (plan: Omit<ExchangePlan, 'id' | 'createdAt' | 'modifiedAt'>) => void;
  updatePlan: (planId: string, updates: Partial<ExchangePlan>) => void;
  setActivePlan: (planId: string) => void;
  getPlanForPatient: (patientId: string) => ExchangePlan | null;
  deletePlan: (planId: string) => void;
}

const ExchangePlanContext = createContext<ExchangePlanContextType | undefined>(undefined);

export const useExchangePlan = () => {
  const context = useContext(ExchangePlanContext);
  if (context === undefined) {
    throw new Error('useExchangePlan must be used within an ExchangePlanProvider');
  }
  return context;
};

export const ExchangePlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { saveData, loadData } = usePersistence();
  
  const [plans, setPlans] = useState<ExchangePlan[]>([
    {
      id: 'plan1',
      patientId: 'pat1',
      patientName: 'Ram Bahadur Gurung',
      doctorId: 'doc1',
      name: 'Standard CAPD Plan',
      description: 'Four exchanges daily with 2L solution',
      schedules: [
        {
          id: 'sched1',
          time: '06:00',
          type: 'morning',
          fillVolume: 2000,
          dwellTime: 360,
          solution: 'low',
          enabled: true
        },
        {
          id: 'sched2',
          time: '12:00',
          type: 'afternoon',
          fillVolume: 2000,
          dwellTime: 360,
          solution: 'medium',
          enabled: true
        },
        {
          id: 'sched3',
          time: '18:00',
          type: 'evening',
          fillVolume: 2000,
          dwellTime: 360,
          solution: 'medium',
          enabled: true
        },
        {
          id: 'sched4',
          time: '22:00',
          type: 'night',
          fillVolume: 2000,
          dwellTime: 480,
          solution: 'high',
          enabled: true
        }
      ],
      isActive: true,
      createdAt: '2024-06-10',
      modifiedAt: '2024-06-15',
      modifiedBy: 'Dr. Pramod Sharma',
      totalDailyVolume: 8000,
      notes: 'Patient responding well to current regimen'
    }
  ]);

  const [currentPlan, setCurrentPlan] = useState<ExchangePlan | null>(null);

  // Load persisted exchange plans on mount
  useEffect(() => {
    const persistedData = loadData();
    
    if (persistedData.exchangePlans && persistedData.exchangePlans.length > 0) {
      setPlans(persistedData.exchangePlans);
      console.log('Exchange plans loaded from persistence');
    }
  }, [loadData]);

  // Auto-save exchange plans whenever they change
  useEffect(() => {
    if (plans.length > 0) {
      saveData('exchangePlans', plans);
    }
  }, [plans, saveData]);

  useEffect(() => {
    // Set the active plan as current
    const activePlan = plans.find(plan => plan.isActive);
    setCurrentPlan(activePlan || null);
  }, [plans]);

  const createPlan = (planData: Omit<ExchangePlan, 'id' | 'createdAt' | 'modifiedAt'>) => {
    const newPlan: ExchangePlan = {
      ...planData,
      id: `plan_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      modifiedAt: new Date().toISOString().split('T')[0]
    };
    setPlans(prev => [...prev, newPlan]);
  };

  const updatePlan = (planId: string, updates: Partial<ExchangePlan>) => {
    setPlans(prev => prev.map(plan => 
      plan.id === planId 
        ? { 
            ...plan, 
            ...updates, 
            modifiedAt: new Date().toISOString().split('T')[0] 
          }
        : plan
    ));
  };

  const setActivePlan = (planId: string) => {
    setPlans(prev => prev.map(plan => ({
      ...plan,
      isActive: plan.id === planId
    })));
  };

  const getPlanForPatient = (patientId: string) => {
    return plans.find(plan => plan.patientId === patientId && plan.isActive) || null;
  };

  const deletePlan = (planId: string) => {
    setPlans(prev => prev.filter(plan => plan.id !== planId));
  };

  const value = {
    plans,
    currentPlan,
    createPlan,
    updatePlan,
    setActivePlan,
    getPlanForPatient,
    deletePlan
  };

  return (
    <ExchangePlanContext.Provider value={value}>
      {children}
    </ExchangePlanContext.Provider>
  );
};
