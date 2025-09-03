
export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  experience: number; // years
  hospital: string;
  location: string;
  languages: string[];
  bio: string;
  availability: 'available' | 'busy' | 'unavailable';
  currentPatients: number;
  maxPatients: number;
  image?: string;
  credentials: string[];
  consultationFee?: number;
}
