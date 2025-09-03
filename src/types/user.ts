
export type UserRole = 'patient' | 'doctor' | 'caregiver' | 'admin' | 'coordinator';

export type UserStatus = 'active' | 'pending' | 'pending_approval' | 'invited' | 'suspended';

export interface PendingConnection {
  type: 'doctor' | 'patient' | 'caregiver';
  id: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  message?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  language: 'en' | 'ne';
  hospital?: string;
  specialization?: string[];
  doctorId?: string;
  needsDoctorSelection?: boolean;
  createdAt?: string;
  lastLogin?: string;
  permissions?: string[];
  patientIds?: string[];
  pendingConnections?: PendingConnection[];
  referralCode?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  hospital?: string;
  specialization?: string[];
}

export interface RegistrationData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  language: 'en' | 'ne';
  hospital?: string;
  specialization?: string[];
  selectedDoctorId?: string;
  referralCode?: string;
  inviteToken?: string;
}
