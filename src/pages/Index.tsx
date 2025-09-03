import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ExchangePlanProvider } from '@/contexts/ExchangePlanContext';
import { PatientProvider } from '@/contexts/PatientContext';
import LoginForm from '@/components/LoginForm';
import Layout from '@/components/Layout';
import PatientDashboard from '@/components/PatientDashboard';
import DoctorDashboard from '@/components/DoctorDashboard';
import CaregiverDashboard from '@/components/CaregiverDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import DoctorSelection from '@/components/DoctorSelection';
import PendingApprovalScreen from '@/components/PendingApprovalScreen';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import { mockDoctors } from '@/data/doctors';
import { logger } from '@/utils/monitoring';

console.log('Index.tsx: Starting to load');

const AppContent: React.FC = () => {
  console.log('Index.tsx: AppContent component rendering');
  
  const { user, isAuthenticated, loading, assignDoctor, logout } = useAuth();
  
  logger.debug('Auth state changed', { 
    userName: user?.name, 
    isAuthenticated, 
    loading, 
    userStatus: user?.status 
  });

  if (loading) {
    logger.debug('Showing loading screen');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">PD</span>
          </div>
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading PDsathi...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    logger.info('User not authenticated, showing login form');
    return <LoginForm />;
  }

  // Handle pending approval states
  if (user?.status === 'pending' || user?.status === 'pending_approval' || user?.status === 'invited') {
    console.log('Index.tsx: User has pending status, showing approval screen');
    return <PendingApprovalScreen user={user} onLogout={logout} />;
  }

  // Check if patient needs doctor selection
  if (user?.role === 'patient' && user.needsDoctorSelection) {
    console.log('Index.tsx: Patient needs doctor selection');
    const handleDoctorSelect = (doctor: any) => {
      console.log('Index.tsx: Doctor selected:', doctor.name);
      assignDoctor(doctor.id);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto py-8">
          <DoctorSelection 
            onDoctorSelect={handleDoctorSelect}
            selectedDoctorId={user.doctorId}
          />
        </div>
      </div>
    );
  }

  console.log('Index.tsx: User authenticated and active, rendering dashboard for role:', user?.role);

  const renderDashboard = () => {
    switch (user?.role) {
      case 'patient':
        console.log('Index.tsx: Rendering PatientDashboard');
        return <PatientDashboard />;
      case 'doctor':
        console.log('Index.tsx: Rendering DoctorDashboard');
        return <DoctorDashboard />;
      case 'caregiver':
        console.log('Index.tsx: Rendering CaregiverDashboard');
        return <CaregiverDashboard />;
      case 'admin':
      case 'coordinator':
        console.log('Index.tsx: Rendering AdminDashboard');
        return <AdminDashboard />;
      default:
        console.log('Index.tsx: Unknown role, defaulting to PatientDashboard');
        return <PatientDashboard />;
    }
  };

  return (
    <Layout>
      {renderDashboard()}
    </Layout>
  );
};

const Index: React.FC = () => {
  console.log('Index.tsx: Index component rendering');
  
  return (
    <>
      <PerformanceMonitor />
      <AuthProvider>
        <LanguageProvider>
          <ExchangePlanProvider>
            <PatientProvider>
              <AppContent />
            </PatientProvider>
          </ExchangePlanProvider>
        </LanguageProvider>
      </AuthProvider>
    </>
  );
};

console.log('Index.tsx: Component defined, exporting');

export default Index;
