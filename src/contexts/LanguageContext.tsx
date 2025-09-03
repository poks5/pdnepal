
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ne';

interface Translations {
  [key: string]: {
    en: string;
    ne: string;
  };
}

const translations: Translations = {
  // Navigation
  dashboard: { en: 'Dashboard', ne: 'ड्यासबोर्ड' },
  profile: { en: 'Profile', ne: 'प्रोफाइल' },
  exchanges: { en: 'Exchanges', ne: 'एक्सचेन्ज' },
  settings: { en: 'Settings', ne: 'सेटिङ्गहरू' },
  logout: { en: 'Logout', ne: 'लगआउट' },
  
  // Auth
  login: { en: 'Login', ne: 'लगइन' },
  email: { en: 'Email', ne: 'इमेल' },
  password: { en: 'Password', ne: 'पासवर्ड' },
  
  // Dashboard
  welcome: { en: 'Welcome', ne: 'स्वागत छ' },
  todayExchanges: { en: "Today's Exchanges", ne: 'आजका एक्सचेन्जहरू' },
  recentActivity: { en: 'Recent Activity', ne: 'हालैका गतिविधिहरू' },
  alerts: { en: 'Alerts', ne: 'अलर्टहरू' },
  
  // Patient
  patients: { en: 'Patients', ne: 'बिरामीहरू' },
  addExchange: { en: 'Add Exchange', ne: 'एक्सचेन्ज थप्नुहोस्' },
  drainVolume: { en: 'Drain Volume (ml)', ne: 'निकासी मात्रा (मिली)' },
  fillVolume: { en: 'Fill Volume (ml)', ne: 'भर्ने मात्रा (मिली)' },
  ultrafiltration: { en: 'Ultrafiltration (ml)', ne: 'अल्ट्राफिल्ट्रेशन (मिली)' },
  clarity: { en: 'Clarity', ne: 'स्पष्टता' },
  clear: { en: 'Clear', ne: 'स्पष्ट' },
  cloudy: { en: 'Cloudy', ne: 'बादल' },
  pain: { en: 'Pain', ne: 'दुखाइ' },
  
  // Time
  morning: { en: 'Morning', ne: 'बिहान' },
  afternoon: { en: 'Afternoon', ne: 'दिउँसो' },
  evening: { en: 'Evening', ne: 'साँझ' },
  night: { en: 'Night', ne: 'राति' },
  
  // Common
  save: { en: 'Save', ne: 'सेभ गर्नुहोस्' },
  cancel: { en: 'Cancel', ne: 'रद्द गर्नुहोस्' },
  yes: { en: 'Yes', ne: 'हो' },
  no: { en: 'No', ne: 'होइन' },
  completed: { en: 'Completed', ne: 'सम्पन्न' },
  pending: { en: 'Pending', ne: 'बाँकी' },
  emergency: { en: 'Emergency', ne: 'आपातकालीन' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('dialysis_language') as Language;
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('dialysis_language', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
