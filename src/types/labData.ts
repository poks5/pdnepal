
export interface LabTest {
  id: string;
  patientId: string;
  testDate: string;
  category: 'blood_chemistry' | 'hematology' | 'hormones' | 'peritoneal' | 'pet_test';
  
  // Blood Chemistry
  rbs?: number; // Random Blood Sugar (mg/dL)
  fbs?: number; // Fasting Blood Sugar (mg/dL)
  pp?: number; // Post Prandial (mg/dL)
  hba1c?: number; // HbA1c (%)
  urea?: number; // mg/dL
  creatinine?: number; // mg/dL
  sodium?: number; // mEq/L
  potassium?: number; // mEq/L
  uricAcid?: number; // mg/dL
  calcium?: number; // mg/dL
  phosphorus?: number; // mg/dL
  albumin?: number; // g/dL
  
  // Hormones
  ipth?: number; // intact Parathyroid Hormone (pg/mL)
  
  // Hematology
  tc?: number; // Total Count (cells/μL)
  neutrophil?: number; // %
  lymphocyte?: number; // %
  hemoglobin?: number; // g/dL
  platelets?: number; // lakhs/μL
  
  // File uploads
  peritonealFluidReport?: string; // file URL
  petTestReport?: string; // file URL
  
  notes?: string;
  reportedBy: string; // patient, doctor, lab
  createdAt: string;
  updatedAt: string;
}

export interface LabRange {
  parameter: string;
  min: number;
  max: number;
  unit: string;
  category: string;
}

export const labRanges: LabRange[] = [
  // Blood Chemistry
  { parameter: 'rbs', min: 80, max: 140, unit: 'mg/dL', category: 'Blood Sugar' },
  { parameter: 'fbs', min: 70, max: 110, unit: 'mg/dL', category: 'Blood Sugar' },
  { parameter: 'pp', min: 80, max: 140, unit: 'mg/dL', category: 'Blood Sugar' },
  { parameter: 'hba1c', min: 4, max: 6, unit: '%', category: 'Blood Sugar' },
  { parameter: 'urea', min: 15, max: 45, unit: 'mg/dL', category: 'Kidney Function' },
  { parameter: 'creatinine', min: 0.6, max: 1.2, unit: 'mg/dL', category: 'Kidney Function' },
  { parameter: 'sodium', min: 135, max: 145, unit: 'mEq/L', category: 'Electrolytes' },
  { parameter: 'potassium', min: 3.5, max: 5.0, unit: 'mEq/L', category: 'Electrolytes' },
  { parameter: 'uricAcid', min: 3.4, max: 7.0, unit: 'mg/dL', category: 'Kidney Function' },
  { parameter: 'calcium', min: 8.5, max: 10.5, unit: 'mg/dL', category: 'Electrolytes' },
  { parameter: 'phosphorus', min: 2.5, max: 4.5, unit: 'mg/dL', category: 'Electrolytes' },
  { parameter: 'albumin', min: 3.5, max: 5.0, unit: 'g/dL', category: 'Proteins' },
  { parameter: 'ipth', min: 10, max: 65, unit: 'pg/mL', category: 'Hormones' },
  
  // Hematology
  { parameter: 'tc', min: 4000, max: 11000, unit: 'cells/μL', category: 'Blood Count' },
  { parameter: 'neutrophil', min: 50, max: 70, unit: '%', category: 'Blood Count' },
  { parameter: 'lymphocyte', min: 20, max: 40, unit: '%', category: 'Blood Count' },
  { parameter: 'hemoglobin', min: 12, max: 16, unit: 'g/dL', category: 'Blood Count' },
  { parameter: 'platelets', min: 1.5, max: 4.5, unit: 'lakhs/μL', category: 'Blood Count' }
];
