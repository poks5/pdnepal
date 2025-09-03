
export interface PersistedData {
  patientData: any;
  exchangeLogs: any[];
  labData: any[];
  userSettings: any;
  exchangePlans: any[];
  lastSaved: string;
  version: string;
}

class PersistenceService {
  private readonly STORAGE_KEY = 'pd_tracker_data';
  private readonly VERSION = '1.0.0';

  save(data: Partial<PersistedData>): void {
    try {
      const existing = this.load();
      const updated: PersistedData = {
        ...existing,
        ...data,
        lastSaved: new Date().toISOString(),
        version: this.VERSION
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      console.log('Data persisted successfully', Object.keys(data));
    } catch (error) {
      console.error('Failed to persist data:', error);
    }
  }

  load(): PersistedData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return this.getDefaultData();
      }

      const parsed = JSON.parse(stored);
      
      // Handle version migrations if needed
      if (parsed.version !== this.VERSION) {
        return this.migrateData(parsed);
      }

      return parsed;
    } catch (error) {
      console.error('Failed to load persisted data:', error);
      return this.getDefaultData();
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('Persisted data cleared');
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }

  export(): string {
    const data = this.load();
    return JSON.stringify(data, null, 2);
  }

  import(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      this.save(data);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  private getDefaultData(): PersistedData {
    return {
      patientData: null,
      exchangeLogs: [],
      labData: [],
      userSettings: {},
      exchangePlans: [],
      lastSaved: new Date().toISOString(),
      version: this.VERSION
    };
  }

  private migrateData(oldData: any): PersistedData {
    // Handle future data migrations here
    console.log('Migrating data from version:', oldData.version);
    return {
      ...this.getDefaultData(),
      ...oldData,
      version: this.VERSION
    };
  }

  // Utility methods for specific data types
  savePatientData(patientData: any): void {
    this.save({ patientData });
  }

  saveExchangeLogs(exchangeLogs: any[]): void {
    this.save({ exchangeLogs });
  }

  saveLabData(labData: any[]): void {
    this.save({ labData });
  }

  saveExchangePlans(exchangePlans: any[]): void {
    this.save({ exchangePlans });
  }

  saveUserSettings(userSettings: any): void {
    this.save({ userSettings });
  }
}

export const persistenceService = new PersistenceService();
