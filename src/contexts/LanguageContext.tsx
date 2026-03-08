
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ne';

interface Translations {
  [key: string]: { en: string; ne: string };
}

const translations: Translations = {
  // ── Navigation ──
  home: { en: 'Home', ne: 'गृह' },
  dashboard: { en: 'Dashboard', ne: 'ड्यासबोर्ड' },
  profile: { en: 'Profile', ne: 'प्रोफाइल' },
  exchanges: { en: 'Exchanges', ne: 'एक्सचेन्ज' },
  settings: { en: 'Settings', ne: 'सेटिङ्गहरू' },
  logout: { en: 'Sign Out', ne: 'लगआउट' },
  labs: { en: 'Labs', ne: 'ल्याब' },
  analytics: { en: 'Analytics', ne: 'विश्लेषण' },
  more: { en: 'More', ne: 'थप' },
  alerts: { en: 'Alerts', ne: 'अलर्ट' },
  plans: { en: 'Plans', ne: 'योजनाहरू' },
  users: { en: 'Users', ne: 'प्रयोगकर्ता' },
  security: { en: 'Security', ne: 'सुरक्षा' },

  // ── Auth / Landing ──
  login: { en: 'Sign In', ne: 'साइन इन' },
  signIn: { en: 'Sign In', ne: 'साइन इन' },
  signingIn: { en: 'Signing in…', ne: 'साइन इन हुँदैछ…' },
  email: { en: 'Email', ne: 'इमेल' },
  password: { en: 'Password', ne: 'पासवर्ड' },
  forgotPassword: { en: 'Forgot?', ne: 'बिर्सनुभयो?' },
  welcomeBack: { en: 'Welcome back 👋', ne: 'फेरि स्वागत छ 👋' },
  signInToContinue: { en: 'Sign in to continue', ne: 'जारी राख्न साइन इन गर्नुहोस्' },
  newHere: { en: 'New here?', ne: 'नयाँ हुनुहुन्छ?' },
  createAccount: { en: 'Create Account', ne: 'खाता बनाउनुहोस्' },
  enterPassword: { en: 'Enter password', ne: 'पासवर्ड हाल्नुहोस्' },

  // ── Landing Page ──
  appTagline: { en: 'Your Peritoneal Dialysis Companion', ne: 'तपाईंको पेरिटोनियल डायलिसिस साथी' },
  appMotivation: { en: '"A companion on your health journey"', ne: '"साथी जो तपाईंको स्वास्थ्य यात्रामा सँगै छ"' },
  trackExchanges: { en: 'Track Exchanges', ne: 'एक्सचेन्ज ट्र्याक' },
  labInsights: { en: 'Lab Insights', ne: 'ल्याब विश्लेषण' },
  doctorConnect: { en: 'Doctor Connect', ne: 'डाक्टर जडान' },
  sharePDsathi: { en: 'Share PDsathi', ne: 'PDsathi साझा गर्नुहोस्' },
  shareDescription: { en: 'Scan this QR code or tap below to share PDsathi with fellow patients, caregivers, or doctors.', ne: 'यो QR कोड स्क्यान गर्नुहोस् वा PDsathi साझा गर्न तल ट्याप गर्नुहोस्।' },
  shareAppLink: { en: 'Share App Link', ne: 'एप लिंक साझा गर्नुहोस्' },
  learnMore: { en: 'Learn More About PDsathi', ne: 'PDsathi बारेमा थप जान्नुहोस्' },
  learnMoreDesc: { en: 'Features, guides, and how PD tracking works', ne: 'सुविधाहरू, गाइडहरू, र PD ट्र्याकिङ कसरी काम गर्छ' },

  // ── Greetings ──
  goodMorning: { en: 'Good Morning', ne: 'शुभ प्रभात' },
  goodAfternoon: { en: 'Namaste', ne: 'नमस्ते' },
  goodEvening: { en: 'Good Evening', ne: 'शुभ सन्ध्या' },
  goodNight: { en: 'Good Night', ne: 'शुभ रात्रि' },
  welcome: { en: 'Welcome', ne: 'स्वागत छ' },

  // ── Dashboard ──
  todayExchanges: { en: "Today's Exchanges", ne: 'आजका एक्सचेन्जहरू' },
  recentActivity: { en: 'Recent Activity', ne: 'हालैका गतिविधिहरू' },
  todayProgress: { en: "Today's Progress", ne: 'आजको प्रगति' },
  weeklyStats: { en: 'Weekly Stats', ne: 'साप्ताहिक तथ्याङ्क' },
  pdJourneyGreat: { en: 'Your PD journey is looking great! 💪', ne: 'तपाईंको PD यात्रा राम्रो चलिरहेको छ! 💪' },
  dayStreak: { en: 'Day streak', ne: 'दिन स्ट्रिक' },
  exchangesDone: { en: 'exchanges done', ne: 'एक्सचेन्ज सम्पन्न' },
  nextExchange: { en: 'Next exchange', ne: 'अर्को एक्सचेन्ज' },
  noExchangeToday: { en: 'No exchanges today', ne: 'आज एक्सचेन्ज छैन' },
  addExchange: { en: 'Add Exchange', ne: 'एक्सचेन्ज थप्नुहोस्' },
  logExchange: { en: 'Log Exchange', ne: 'एक्सचेन्ज लग गर्नुहोस्' },
  viewHistory: { en: 'View History', ne: 'इतिहास हेर्नुहोस्' },
  recentExchanges: { en: 'Recent Exchanges', ne: 'हालैका एक्सचेन्जहरू' },

  // ── Exchange Form ──
  drainVolume: { en: 'Drain Volume (ml)', ne: 'निकासी मात्रा (मिली)' },
  fillVolume: { en: 'Fill Volume (ml)', ne: 'भर्ने मात्रा (मिली)' },
  ultrafiltration: { en: 'Ultrafiltration (ml)', ne: 'अल्ट्राफिल्ट्रेशन (मिली)' },
  clarity: { en: 'Clarity', ne: 'स्पष्टता' },
  clear: { en: 'Clear', ne: 'स्पष्ट' },
  cloudy: { en: 'Cloudy', ne: 'बादलमय' },
  pain: { en: 'Pain', ne: 'दुखाइ' },
  notes: { en: 'Notes', ne: 'नोटहरू' },
  solutionType: { en: 'Solution Type', ne: 'सोलुसन प्रकार' },
  exchangeType: { en: 'Exchange Type', ne: 'एक्सचेन्ज प्रकार' },

  // ── Analytics ──
  analyticsMedical: { en: 'Analytics & Medical', ne: 'विश्लेषण र मेडिकल' },
  analyticsDesc: { en: 'Comprehensive health insights at your fingertips', ne: 'तपाईंको हातमा स्वास्थ्य अन्तर्दृष्टि' },
  ufTrends: { en: 'UF Trends', ne: 'UF प्रवृत्ति' },
  labAlerts: { en: 'Lab Alerts', ne: 'ल्याब अलर्ट' },
  medications: { en: 'Medications', ne: 'औषधिहरू' },
  symptoms: { en: 'Symptoms', ne: 'लक्षणहरू' },
  photos: { en: 'Photos', ne: 'फोटोहरू' },
  export: { en: 'Export', ne: 'निर्यात' },
  trackMedsAdherence: { en: 'Track meds & adherence', ne: 'औषधि र पालना ट्र्याक गर्नुहोस्' },
  logScoreSymptoms: { en: 'Log & score daily symptoms', ne: 'दैनिक लक्षणहरू लग गर्नुहोस्' },
  documentCatheterFluid: { en: 'Document catheter & fluid', ne: 'क्याथेटर र तरल दस्तावेज' },
  downloadShareReports: { en: 'Download & share reports', ne: 'रिपोर्ट डाउनलोड र साझा' },
  trackUFPatterns: { en: 'Track ultrafiltration & exchange patterns', ne: 'UF र एक्सचेन्ज ढाँचा ट्र्याक' },
  smartLabAlerts: { en: 'Smart alerts on lab values', ne: 'ल्याब मानमा स्मार्ट अलर्ट' },
  healthScore: { en: 'Health Score', ne: 'स्वास्थ्य स्कोर' },
  avgUF: { en: 'Avg UF', ne: 'औसत UF' },
  backToAnalytics: { en: 'Back to Analytics', ne: 'विश्लेषणमा फर्कनुहोस्' },
  dataEncrypted: { en: 'Your health data is encrypted and only visible to you and your assigned doctor. All analytics are generated locally.', ne: 'तपाईंको स्वास्थ्य डेटा इन्क्रिप्टेड छ र तपाईं र तपाईंको डाक्टरलाई मात्र देखिन्छ।' },

  // ── Quick Actions ──
  quickActions: { en: 'Quick Actions', ne: 'छिटो कार्यहरू' },
  labData: { en: 'Lab Data', ne: 'ल्याब डाटा' },
  myDoctor: { en: 'My Doctor', ne: 'मेरो डाक्टर' },
  pdSettings: { en: 'PD Settings', ne: 'PD सेटिङ्ग' },

  // ── Medical ──
  symptomTracker: { en: 'Symptom Tracker', ne: 'लक्षण ट्र्याकर' },
  medicationTracker: { en: 'Medication Tracker', ne: 'औषधि ट्र्याकर' },
  photoDocumentation: { en: 'Photo Documentation', ne: 'फोटो कागजात' },

  // ── Time / Common ──
  morning: { en: 'Morning', ne: 'बिहान' },
  afternoon: { en: 'Afternoon', ne: 'दिउँसो' },
  evening: { en: 'Evening', ne: 'साँझ' },
  night: { en: 'Night', ne: 'राति' },
  save: { en: 'Save', ne: 'सेभ गर्नुहोस्' },
  cancel: { en: 'Cancel', ne: 'रद्द गर्नुहोस्' },
  yes: { en: 'Yes', ne: 'हो' },
  no: { en: 'No', ne: 'होइन' },
  completed: { en: 'Completed', ne: 'सम्पन्न' },
  pending: { en: 'Pending', ne: 'बाँकी' },
  emergency: { en: 'Emergency', ne: 'आपातकालीन' },
  patients: { en: 'Patients', ne: 'बिरामीहरू' },
  patient: { en: 'Patient', ne: 'बिरामी' },
  doctor: { en: 'Doctor', ne: 'डाक्टर' },
  caregiver: { en: 'Caregiver', ne: 'हेरचाहकर्ता' },
  admin: { en: 'Admin', ne: 'प्रशासक' },
  coordinator: { en: 'Coordinator', ne: 'समन्वयक' },
  pdCompanion: { en: 'PD Companion', ne: 'PD साथी' },
  conceptBy: { en: 'A concept by', ne: 'एउटा अवधारणा' },
  consultantNephrologist: { en: 'Consultant Nephrologist', ne: 'परामर्शदाता नेफ्रोलोजिस्ट' },

  // ── Settings Hub ──
  patientProfile: { en: 'Patient Profile', ne: 'बिरामी प्रोफाइल' },
  catheterDetails: { en: 'Catheter Details', ne: 'क्याथेटर विवरण' },
  supplierInfo: { en: 'Supplier Info', ne: 'आपूर्तिकर्ता जानकारी' },
  caregiverInfo: { en: 'Caregiver Info', ne: 'हेरचाहकर्ता जानकारी' },
  dataManagement: { en: 'Data Management', ne: 'डाटा व्यवस्थापन' },
  language: { en: 'Language', ne: 'भाषा' },
  english: { en: 'English', ne: 'अंग्रेजी' },
  nepali: { en: 'नेपाली', ne: 'नेपाली' },

  // ── Health Tips ──
  healthTips: { en: 'Health Tips', ne: 'स्वास्थ्य सुझाव' },
  tipHydration: { en: 'Monitor your fluid intake carefully. Stay within your recommended limits.', ne: 'आफ्नो तरल पदार्थको सेवन सावधानीपूर्वक निगरानी गर्नुहोस्।' },
  tipHygiene: { en: 'Always wash hands thoroughly before performing exchanges.', ne: 'एक्सचेन्ज गर्नु अघि सधैं हात राम्ररी धुनुहोस्।' },
  tipExercise: { en: 'Light exercise like walking can improve your overall well-being.', ne: 'हल्का व्यायामले तपाईंको समग्र स्वास्थ्यमा सुधार गर्छ।' },
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
    const stored = localStorage.getItem('dialysis_language') as Language;
    if (stored) setLanguage(stored);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('dialysis_language', lang);
  };

  const t = (key: string): string => translations[key]?.[language] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
