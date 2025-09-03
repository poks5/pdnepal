import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { PatientProfile, CatheterDetails, PDSettings, CaregiverDetails, SupplierDetails, DailyExchangeLog } from '@/types/patient';
import { usePersistence } from '@/hooks/usePersistence';

interface PatientContextType {
  // Patient Profile
  patientProfile: PatientProfile | null;
  updatePatientProfile: (profile: PatientProfile) => void;
  
  // Catheter Details
  catheterDetails: CatheterDetails | null;
  updateCatheterDetails: (details: CatheterDetails) => void;
  
  // PD Settings
  pdSettings: PDSettings | null;
  updatePDSettings: (settings: PDSettings) => void;
  
  // Caregiver Details
  caregivers: CaregiverDetails[];
  addCaregiver: (caregiver: CaregiverDetails) => void;
  updateCaregiver: (id: string, caregiver: Partial<CaregiverDetails>) => void;
  removeCaregiver: (id: string) => void;
  
  // Supplier Details
  suppliers: SupplierDetails[];
  addSupplier: (supplier: SupplierDetails) => void;
  updateSupplier: (id: string, supplier: Partial<SupplierDetails>) => void;
  removeSupplier: (id: string) => void;
  
  // Daily Exchange Logs
  exchangeLogs: DailyExchangeLog[];
  addExchangeLog: (log: DailyExchangeLog) => void;
  updateExchangeLog: (id: string, log: Partial<DailyExchangeLog>) => void;
  
  // Utility functions
  exportPatientData: () => {
    patientProfile: PatientProfile | null;
    catheterDetails: CatheterDetails | null;
    pdSettings: PDSettings | null;
    caregivers: CaregiverDetails[];
    suppliers: SupplierDetails[];
    exchangeLogs: DailyExchangeLog[];
  };
  importPatientData: (data: any) => void;
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
  
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [catheterDetails, setCatheterDetails] = useState<CatheterDetails | null>(null);
  const [pdSettings, setPDSettings] = useState<PDSettings | null>(null);
  const [caregivers, setCaregivers] = useState<CaregiverDetails[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierDetails[]>([]);
  const [exchangeLogs, setExchangeLogs] = useState<DailyExchangeLog[]>([]);

  // Load persisted data on mount
  useEffect(() => {
    const persistedData = loadData();
    
    if (persistedData.patientData) {
      setPatientProfile(persistedData.patientData.patientProfile);
      setCatheterDetails(persistedData.patientData.catheterDetails);
      setPDSettings(persistedData.patientData.pdSettings);
      setCaregivers(persistedData.patientData.caregivers || []);
      setSuppliers(persistedData.patientData.suppliers || []);
    }
    
    if (persistedData.exchangeLogs) {
      setExchangeLogs(persistedData.exchangeLogs);
    }
    
    console.log('Patient data loaded from persistence');
  }, [loadData]);

  // Auto-save patient data whenever it changes
  useEffect(() => {
    const patientData = {
      patientProfile,
      catheterDetails,
      pdSettings,
      caregivers,
      suppliers
    };
    
    if (patientProfile || catheterDetails || pdSettings || caregivers.length > 0 || suppliers.length > 0) {
      saveData('patientData', patientData);
    }
  }, [patientProfile, catheterDetails, pdSettings, caregivers, suppliers, saveData]);

  // Auto-save exchange logs whenever they change
  useEffect(() => {
    if (exchangeLogs.length > 0) {
      saveData('exchangeLogs', exchangeLogs);
    }
  }, [exchangeLogs, saveData]);

  const updatePatientProfile = (profile: PatientProfile) => {
    setPatientProfile(profile);
    console.log('Patient profile updated:', profile.name);
  };

  const updateCatheterDetails = (details: CatheterDetails) => {
    setCatheterDetails(details);
    console.log('Catheter details updated:', details.type);
  };

  const updatePDSettings = (settings: PDSettings) => {
    setPDSettings(settings);
    console.log('PD settings updated:', settings.mode);
  };

  const addCaregiver = (caregiver: CaregiverDetails) => {
    setCaregivers(prev => [...prev, caregiver]);
    console.log('Caregiver added:', caregiver.name);
  };

  const updateCaregiver = (id: string, updates: Partial<CaregiverDetails>) => {
    setCaregivers(prev => 
      prev.map(caregiver => 
        caregiver.id === id ? { ...caregiver, ...updates } : caregiver
      )
    );
  };

  const removeCaregiver = (id: string) => {
    setCaregivers(prev => prev.filter(caregiver => caregiver.id !== id));
  };

  const addSupplier = (supplier: SupplierDetails) => {
    setSuppliers(prev => [...prev, supplier]);
    console.log('Supplier added:', supplier.companyName);
  };

  const updateSupplier = (id: string, updates: Partial<SupplierDetails>) => {
    setSuppliers(prev => 
      prev.map(supplier => 
        supplier.id === id ? { ...supplier, ...updates } : supplier
      )
    );
  };

  const removeSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
  };

  const addExchangeLog = (log: DailyExchangeLog) => {
    setExchangeLogs(prev => [log, ...prev]);
    console.log('Exchange log added:', log.timestamp);
  };

  const updateExchangeLog = (id: string, updates: Partial<DailyExchangeLog>) => {
    setExchangeLogs(prev => 
      prev.map(log => 
        log.id === id ? { ...log, ...updates } : log
      )
    );
  };

  const exportPatientData = () => {
    return {
      patientProfile,
      catheterDetails,
      pdSettings,
      caregivers,
      suppliers,
      exchangeLogs: exchangeLogs.slice(0, 100) // Last 100 exchanges
    };
  };

  const importPatientData = (data: any) => {
    if (data.patientProfile) setPatientProfile(data.patientProfile);
    if (data.catheterDetails) setCatheterDetails(data.catheterDetails);
    if (data.pdSettings) setPDSettings(data.pdSettings);
    if (data.caregivers) setCaregivers(data.caregivers);
    if (data.suppliers) setSuppliers(data.suppliers);
    if (data.exchangeLogs) setExchangeLogs(data.exchangeLogs);
  };

  const value: PatientContextType = {
    patientProfile,
    updatePatientProfile,
    catheterDetails,
    updateCatheterDetails,
    pdSettings,
    updatePDSettings,
    caregivers,
    addCaregiver,
    updateCaregiver,
    removeCaregiver,
    suppliers,
    addSupplier,
    updateSupplier,
    removeSupplier,
    exchangeLogs,
    addExchangeLog,
    updateExchangeLog,
    exportPatientData,
    importPatientData
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};
