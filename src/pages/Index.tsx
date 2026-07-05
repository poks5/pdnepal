import React, { useEffect, useState } from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { ExchangePlanProvider } from '@/contexts/ExchangePlanContext';
import { PatientProvider } from '@/contexts/PatientContext';
import LandingPage from '@/components/LandingPage';
import { useSEO } from '@/hooks/useSEO';
import Layout from '@/components/Layout';
import PatientDashboard from '@/components/PatientDashboard';
import DoctorDashboard from '@/components/DoctorDashboard';
import DieticianDashboard from '@/components/DieticianDashboard';
import CaregiverDashboard from '@/components/CaregiverDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import RoleSwitcher from '@/components/RoleSwitcher';

const AppContent: React.FC<{ locale?: 'en' | 'ne' }> = ({ locale }) => {
  const { setLanguage } = useLanguage();
  useEffect(() => {
    if (locale) setLanguage(locale);
  }, [locale, setLanguage]);
  useSEO(
    locale === 'ne'
      ? {
          title: 'PDsathi — पेरिटोनियल डायलिसिस साथी बिरामी र स्याहार टोलीका लागि',
          description: 'द्विभाषिक PD साथी एप: CAPD/APD एक्सचेन्ज लग गर्नुहोस्, ल्याब र अल्ट्राफिल्ट्रेसन ट्र्याक गर्नुहोस्, र आफ्नो नेफ्रोलोजी स्याहार टोलीसँग जोडिनुहोस्।',
          path: '/ne',
        }
      : {
          title: 'PDsathi — Peritoneal Dialysis Companion for Patients & Care Teams',
          description: 'Bilingual PD companion app: log CAPD/APD exchanges, track labs and ultrafiltration, and stay connected with your nephrology care team.',
          path: '/',
        }
  );
  const { user, isAuthenticated, loading } = useAuth();
  const [viewRole, setViewRole] = useState<UserRole | null>(null);

  // Reset viewRole when user changes
  const effectiveRole = viewRole ?? user?.role ?? 'patient';

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 gradient-medical rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/25">
            <span className="text-primary-foreground font-bold text-2xl">PD</span>
          </div>
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Loading PDsathi...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LandingPage />;
  }

  const renderDashboard = () => {
    switch (effectiveRole) {
      case 'patient': return <PatientDashboard />;
      case 'doctor': return <DoctorDashboard />;
      case 'dietician': return <DieticianDashboard />;
      case 'caregiver': return <CaregiverDashboard />;
      case 'admin':
      case 'coordinator': return <AdminDashboard />;
      default: return <PatientDashboard />;
    }
  };

  return (
    <Layout viewRole={effectiveRole}>
      {user.roles?.includes('admin') && (
        <div className="mb-4">
          <RoleSwitcher
            activeViewRole={effectiveRole}
            onSwitchRole={(role) => setViewRole(role)}
          />
        </div>
      )}
      {renderDashboard()}
    </Layout>
  );
};

const Index: React.FC = () => (
  <LanguageProvider>
    <ExchangePlanProvider>
      <PatientProvider>
        <AppContent />
      </PatientProvider>
    </ExchangePlanProvider>
  </LanguageProvider>
);

export default Index;
