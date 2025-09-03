import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, UserStatus, RegistrationData } from '@/types/user';
import { invitationService } from '@/services/invitationService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  logout: () => void;
  assignDoctor: (doctorId: string) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('dialysis_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data based on email
    let mockUser: User;
    
    if (email.includes('admin')) {
      mockUser = {
        id: 'admin1',
        name: 'System Administrator',
        email,
        role: 'admin',
        phone: '+977-9801234567',
        language: 'en',
        status: 'active',
        permissions: ['manage_users', 'view_analytics', 'system_settings', 'data_export']
      };
    } else if (email.includes('doctor')) {
      mockUser = {
        id: 'doc1',
        name: 'Dr. Pramod Sharma',
        email,
        role: 'doctor',
        phone: '+977-9841234567',
        language: 'en',
        status: 'active',
        patientIds: ['pat1', 'pat2'],
        hospital: 'Tribhuvan University Teaching Hospital',
        specialization: ['Nephrology', 'Peritoneal Dialysis']
      };
    } else if (email.includes('caregiver')) {
      mockUser = {
        id: 'care1',
        name: 'Maya Thapa',
        email,
        role: 'caregiver',
        phone: '+977-9851234567',
        language: 'ne',
        status: 'pending_approval',
        pendingConnections: [{
          type: 'doctor',
          id: 'doc1',
          name: 'Dr. Pramod Sharma',
          status: 'pending',
          requestedAt: new Date(),
          message: 'Request to access patient records'
        }]
      };
    } else if (email.includes('coordinator')) {
      mockUser = {
        id: 'coord1',
        name: 'Sita Sharma',
        email,
        role: 'coordinator',
        phone: '+977-9871234567',
        language: 'en',
        status: 'active',
        hospital: 'Bir Hospital',
        permissions: ['manage_patients', 'assign_doctors']
      };
    } else {
      // For patients, check if they need doctor selection
      const needsSelection = !email.includes('existing');
      mockUser = {
        id: 'pat1',
        name: 'Ram Bahadur Gurung',
        email,
        role: 'patient',
        phone: '+977-9861234567',
        language: 'ne',
        status: 'active',
        doctorId: needsSelection ? undefined : 'doc1',
        needsDoctorSelection: needsSelection
      };
    }
    
    setUser(mockUser);
    localStorage.setItem('dialysis_user', JSON.stringify(mockUser));
    setLoading(false);
  };

  const register = async (data: RegistrationData) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let status: UserStatus = 'active';
    let pendingConnections: User['pendingConnections'] = undefined;
    
    // Determine initial status based on role and registration method
    if (data.role === 'caregiver') {
      status = 'pending_approval';
      // In real app, this would create a pending connection to the patient's doctor
    } else if (data.role === 'doctor' && !data.hospital) {
      status = 'pending'; // Require verification for doctors
    } else if (data.inviteToken) {
      // Validate invite token
      const invitation = await invitationService.validateInviteToken(data.inviteToken);
      if (invitation) {
        await invitationService.acceptInvitation(data.inviteToken);
        status = 'active';
      }
    } else if (data.referralCode) {
      // Validate referral code
      const invitation = await invitationService.validateReferralCode(data.referralCode);
      if (invitation) {
        status = 'active';
        // Auto-assign doctor for patients with valid referral
        if (data.role === 'patient') {
          data.selectedDoctorId = invitation.fromUserId;
        }
      }
    }

    const newUser: User = {
      id: `${data.role}_${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      language: data.language,
      status,
      doctorId: data.selectedDoctorId,
      hospital: data.hospital,
      specialization: data.specialization,
      needsDoctorSelection: data.role === 'patient' && !data.selectedDoctorId && !data.referralCode,
      pendingConnections,
      referralCode: data.role === 'doctor' ? invitationService.generateReferralCode() : undefined
    };

    setUser(newUser);
    localStorage.setItem('dialysis_user', JSON.stringify(newUser));
    setLoading(false);
  };

  const assignDoctor = (doctorId: string) => {
    if (user && user.role === 'patient') {
      const updatedUser = {
        ...user,
        doctorId,
        needsDoctorSelection: false
      };
      setUser(updatedUser);
      localStorage.setItem('dialysis_user', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dialysis_user');
  };

  const value = {
    user,
    login,
    register,
    logout,
    assignDoctor,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
