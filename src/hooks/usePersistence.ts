
import { useEffect, useCallback } from 'react';
import { persistenceService } from '@/services/persistenceService';

export const usePersistence = () => {
  const saveData = useCallback((key: string, data: any) => {
    const saveMap: Record<string, (data: any) => void> = {
      patientData: persistenceService.savePatientData.bind(persistenceService),
      exchangeLogs: persistenceService.saveExchangeLogs.bind(persistenceService),
      labData: persistenceService.saveLabData.bind(persistenceService),
      exchangePlans: persistenceService.saveExchangePlans.bind(persistenceService),
      userSettings: persistenceService.saveUserSettings.bind(persistenceService),
    };

    const saveFunction = saveMap[key];
    if (saveFunction) {
      saveFunction(data);
    }
  }, []);

  const loadData = useCallback(() => {
    return persistenceService.load();
  }, []);

  const clearData = useCallback(() => {
    persistenceService.clear();
  }, []);

  const exportData = useCallback(() => {
    return persistenceService.export();
  }, []);

  const importData = useCallback((jsonData: string) => {
    return persistenceService.import(jsonData);
  }, []);

  return {
    saveData,
    loadData,
    clearData,
    exportData,
    importData
  };
};
