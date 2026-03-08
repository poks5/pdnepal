import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { PatientProfile, CatheterDetails, PDSettings, CaregiverDetails, SupplierDetails, DailyExchangeLog } from '@/types/patient';
import { usePersistence } from '@/hooks/usePersistence';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PatientContextType {
  patientProfile: PatientProfile | null;
  updatePatientProfile: (profile: PatientProfile) => void;
  catheterDetails: CatheterDetails | null;
  updateCatheterDetails: (details: CatheterDetails) => void;
  pdSettings: PDSettings | null;
  updatePDSettings: (settings: PDSettings) => void;
  caregivers: CaregiverDetails[];
  addCaregiver: (caregiver: CaregiverDetails) => void;
  updateCaregiver: (id: string, caregiver: Partial<CaregiverDetails>) => void;
  removeCaregiver: (id: string) => void;
  suppliers: SupplierDetails[];
  addSupplier: (supplier: SupplierDetails) => void;
  updateSupplier: (id: string, supplier: Partial<SupplierDetails>) => void;
  removeSupplier: (id: string) => void;
  exchangeLogs: DailyExchangeLog[];
  addExchangeLog: (log: DailyExchangeLog) => void;
  updateExchangeLog: (id: string, log: Partial<DailyExchangeLog>) => void;
  exportPatientData: () => any;
  importPatientData: (data: any) => void;
  loadingExchanges: boolean;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};

interface PatientProviderProps {
  children: ReactNode;
}

export const PatientProvider: React.FC<PatientProviderProps> = ({ children }) => {
  const { saveData, loadData } = usePersistence();
  const { user } = useAuth();
  
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [catheterDetails, setCatheterDetails] = useState<CatheterDetails | null>(null);
  const [pdSettings, setPDSettings] = useState<PDSettings | null>(null);
  const [caregivers, setCaregivers] = useState<CaregiverDetails[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierDetails[]>([]);
  const [exchangeLogs, setExchangeLogs] = useState<DailyExchangeLog[]>([]);
  const [loadingExchanges, setLoadingExchanges] = useState(false);

  // Load patient profile from Supabase
  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (error) throw error;
        if (data) {
          setPatientProfile({
            id: data.user_id,
            name: data.full_name,
            dateOfBirth: data.date_of_birth || '',
            diagnosis: '',
            contactPhone: data.phone || '',
            contactEmail: user.email || '',
            language: (data.language as 'en' | 'ne') || 'en',
            emergencyContact: data.emergency_contact_name ? {
              name: data.emergency_contact_name,
              relationship: '',
              phone: data.emergency_contact_phone || '',
            } : undefined,
          });
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };
    loadProfile();
  }, [user]);

  // Load PD settings from Supabase
  useEffect(() => {
    if (!user) return;
    const loadPDSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('pd_settings')
          .select('*')
          .eq('patient_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        if (data) {
          setPDSettings({
            id: data.id,
            patientId: data.patient_id,
            mode: (data.modality as any) || 'CAPD',
            fluidBrand: data.brand || '',
            exchangesPerDay: (data.daily_exchanges || 4) as 1 | 2 | 3 | 4,
            scheduledTimes: [],
            pushReminders: true,
            defaultDialysateStrengths: data.solution_type ? [data.solution_type as any] : ['1.5%'],
            defaultDwellTime: Number(data.dwell_time_hours) || 4,
            treatmentPlanVersion: 1,
          });
        }
      } catch (err) {
        console.error('Failed to load PD settings:', err);
      }
    };
    loadPDSettings();
  }, [user]);

  // Load exchange logs from Supabase when user is available
  useEffect(() => {
    if (!user) return;
    const loadExchanges = async () => {
      setLoadingExchanges(true);
      try {
        const { data, error } = await supabase
          .from('exchange_logs')
          .select('*')
          .eq('patient_id', user.id)
          .order('created_at', { ascending: false })
          .limit(200);
        if (error) throw error;
        if (data) {
          const mapped: DailyExchangeLog[] = data.map(row => ({
            id: row.id,
            patientId: row.patient_id,
            timestamp: row.created_at,
            drainVolume: row.drain_volume_ml ?? 0,
            fillVolume: row.fill_volume_ml,
            ultrafiltration: row.ultrafiltration_ml ?? 0,
            clarity: row.drain_color === 'cloudy' ? 'cloudy' : 'clear',
            painLevel: row.pain_level ?? 0,
            dwellTime: 4,
            dialysateStrength: (row.solution_type as any) || '1.5%',
            notes: row.notes ?? undefined,
            exchangeType: row.exchange_type as any,
            photos: [],
            symptomTags: (row as any).symptoms ?? [],
          }));
          setExchangeLogs(mapped);
        }
      } catch (err) {
        console.error('Failed to load exchange logs from database:', err);
      } finally {
        setLoadingExchanges(false);
      }
    };
    loadExchanges();
  }, [user]);

  // Load non-exchange data from localStorage (catheter, caregivers, suppliers)
  useEffect(() => {
    const persistedData = loadData();
    if (persistedData.patientData) {
      setCatheterDetails(persistedData.patientData.catheterDetails);
      setCaregivers(persistedData.patientData.caregivers || []);
      setSuppliers(persistedData.patientData.suppliers || []);
    }
    console.log('Patient data loaded from persistence');
  }, [loadData]);

  // Auto-save non-exchange patient data to localStorage
  useEffect(() => {
    const patientData = { patientProfile, catheterDetails, pdSettings, caregivers, suppliers };
    if (catheterDetails || pdSettings || caregivers.length > 0 || suppliers.length > 0) {
      saveData('patientData', patientData);
    }
  }, [catheterDetails, pdSettings, caregivers, suppliers, saveData]);

  const updatePatientProfile = (profile: PatientProfile) => {
    setPatientProfile(profile);
  };

  const updateCatheterDetails = (details: CatheterDetails) => {
    setCatheterDetails(details);
  };

  const updatePDSettings = (settings: PDSettings) => {
    setPDSettings(settings);
  };

  const addCaregiver = (caregiver: CaregiverDetails) => {
    setCaregivers(prev => [...prev, caregiver]);
  };
  const updateCaregiver = (id: string, updates: Partial<CaregiverDetails>) => {
    setCaregivers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };
  const removeCaregiver = (id: string) => {
    setCaregivers(prev => prev.filter(c => c.id !== id));
  };
  const addSupplier = (supplier: SupplierDetails) => {
    setSuppliers(prev => [...prev, supplier]);
  };
  const updateSupplier = (id: string, updates: Partial<SupplierDetails>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };
  const removeSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const addExchangeLog = (log: DailyExchangeLog) => {
    setExchangeLogs(prev => [log, ...prev]);
  };

  const updateExchangeLog = (id: string, updates: Partial<DailyExchangeLog>) => {
    setExchangeLogs(prev => prev.map(log => log.id === id ? { ...log, ...updates } : log));
  };

  const exportPatientData = () => ({
    patientProfile, catheterDetails, pdSettings, caregivers, suppliers,
    exchangeLogs: exchangeLogs.slice(0, 100),
  });

  const importPatientData = (data: any) => {
    if (data.catheterDetails) setCatheterDetails(data.catheterDetails);
    if (data.pdSettings) setPDSettings(data.pdSettings);
    if (data.caregivers) setCaregivers(data.caregivers);
    if (data.suppliers) setSuppliers(data.suppliers);
  };

  return (
    <PatientContext.Provider value={{
      patientProfile, updatePatientProfile,
      catheterDetails, updateCatheterDetails,
      pdSettings, updatePDSettings,
      caregivers, addCaregiver, updateCaregiver, removeCaregiver,
      suppliers, addSupplier, updateSupplier, removeSupplier,
      exchangeLogs, addExchangeLog, updateExchangeLog,
      exportPatientData, importPatientData, loadingExchanges,
    }}>
      {children}
    </PatientContext.Provider>
  );
};
