
export interface PatientProfile {
  id: string;
  name: string;
  dateOfBirth: string;
  diagnosis: string;
  contactPhone: string;
  contactEmail: string;
  language: 'en' | 'ne';
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  nephrologist?: string;
  treatmentStartDate?: string;
  insuranceDetails?: string;
  profilePhoto?: string;
}

export interface CatheterDetails {
  id: string;
  patientId: string;
  placementDate: string;
  type: 'straight' | 'coiled' | 'swan-neck' | 'double-cuff' | 'single-cuff';
  brand: string;
  batchNumber: string;
  placementMethod: 'surgical' | 'percutaneous' | 'laparoscopic';
  hospital: string;
  surgeonNephrologist: string;
  maintenanceSchedule?: string[];
  replacementHistory?: {
    date: string;
    reason: string;
    newCatheterId: string;
  }[];
}

export type PDMode = 'CAPD' | 'APD';
export type DialysateStrength = '1.5%' | '2.5%' | '4.25%';

export interface PDSettings {
  id: string;
  patientId: string;
  mode: PDMode;
  fluidBrand: string;
  exchangesPerDay: 1 | 2 | 3 | 4;
  scheduledTimes: string[];
  pushReminders: boolean;
  defaultDialysateStrengths: DialysateStrength[];
  defaultDwellTime: number; // in hours (0.5 to 15 in 0.5 increments)
  treatmentPlanVersion: number;
}

export interface CaregiverDetails {
  id: string;
  patientId: string;
  name: string;
  relationship: string;
  primaryPhone: string;
  secondaryPhone?: string;
  email: string;
  language: 'en' | 'ne';
  careNotes?: string;
  accessPermissions: string[];
  notifyDoctorOnChange: boolean;
}

export interface SupplierDetails {
  id: string;
  patientId: string;
  companyName: string;
  representativeName: string;
  phone: string;
  whatsapp?: string;
  address: string;
  suppliesChecklist: {
    item: string;
    quantity: number;
    unit: string;
    inStock: boolean;
  }[];
  deliveryFrequency: 'weekly' | 'biweekly' | 'monthly';
  lastDeliveryDate?: string;
  nextDeliveryDate?: string;
}

export type FluidClarity = 'clear' | 'slightly_cloudy' | 'cloudy' | 'very_cloudy';
export type SymptomTag = 'fever' | 'nausea' | 'abdominal_pain' | 'fatigue' | 'shortness_of_breath' | 'dizziness';

export interface DailyExchangeLog {
  id: string;
  patientId: string;
  timestamp: string;
  drainVolume: number;
  fillVolume: number;
  ultrafiltration: number;
  clarity: FluidClarity;
  painLevel: number; // 0-10 scale
  dwellTime: number; // in hours
  dialysateStrength: string;
  photos?: string[];
  symptomTags?: SymptomTag[];
  notes?: string;
  exchangeType: 'morning' | 'afternoon' | 'evening' | 'night';
  weightAfterKg?: number | null;
}
