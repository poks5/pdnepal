
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

  // ── Exchange History ──
  exchangeHistory: { en: 'Exchange History', ne: 'एक्सचेन्ज इतिहास' },
  all: { en: 'All', ne: 'सबै' },
  concerns: { en: 'Concerns', ne: 'चिन्ताहरू' },
  noConcernsFound: { en: 'No concerning exchanges found', ne: 'चिन्ताजनक एक्सचेन्ज भेटिएन' },
  noExchangesYet: { en: 'No exchanges recorded yet', ne: 'अहिलेसम्म एक्सचेन्ज रेकर्ड भएको छैन' },
  drain: { en: 'Drain', ne: 'निकासी' },
  fill: { en: 'Fill', ne: 'भर्ने' },
  uf: { en: 'UF', ne: 'UF' },
  colorNormal: { en: 'Normal (Clear/Light Yellow)', ne: 'सामान्य (स्पष्ट/हल्का पहेँलो)' },
  colorYellow: { en: 'Dark Yellow', ne: 'गाढा पहेँलो' },
  colorRed: { en: 'Red/Pink', ne: 'रातो/गुलाबी' },
  colorBrown: { en: 'Brown', ne: 'खैरो' },
  normal: { en: 'Normal', ne: 'सामान्य' },
  yellow: { en: 'Yellow', ne: 'पहेँलो' },
  red: { en: 'Red', ne: 'रातो' },
  brown: { en: 'Brown', ne: 'खैरो' },

  // ── Lab Data Management ──
  labDataManagement: { en: 'Lab Data Management', ne: 'ल्याब डाटा व्यवस्थापन' },
  trackManageLabResults: { en: 'Track and manage lab results', ne: 'ल्याब परिणामहरू ट्र्याक र व्यवस्थापन गर्नुहोस्' },
  addLabData: { en: 'Add Lab Data', ne: 'ल्याब डाटा थप्नुहोस्' },
  labHistory: { en: 'Lab History', ne: 'ल्याब इतिहास' },
  trends: { en: 'Trends', ne: 'प्रवृत्ति' },
  trendAnalysisComingSoon: { en: 'Trend analysis coming soon', ne: 'प्रवृत्ति विश्लेषण चाँडै आउँदैछ' },
  editLabData: { en: 'Edit Lab Data', ne: 'ल्याब डाटा सम्पादन गर्नुहोस्' },
  addNewLabData: { en: 'Add New Lab Data', ne: 'नयाँ ल्याब डाटा थप्नुहोस्' },
  success: { en: 'Success', ne: 'सफल' },
  labDataUpdated: { en: 'Lab data updated', ne: 'ल्याब डाटा अपडेट भयो' },
  labDataAdded: { en: 'Lab data added', ne: 'ल्याब डाटा थपियो' },
  error: { en: 'Error', ne: 'त्रुटि' },

  // ── PD Settings ──
  pdMasterSettings: { en: 'PD Master Settings', ne: 'PD मास्टर सेटिङ्ग' },
  configurePDParams: { en: 'Configure your peritoneal dialysis treatment parameters', ne: 'तपाईंको पेरिटोनियल डायलिसिस उपचार प्यारामिटरहरू कन्फिगर गर्नुहोस्' },
  saveSettings: { en: 'Save Settings', ne: 'सेटिङ्ग सेभ गर्नुहोस्' },
  saving: { en: 'Saving...', ne: 'सेभ हुँदैछ...' },
  treatmentConfiguration: { en: 'Treatment Configuration', ne: 'उपचार कन्फिगरेसन' },
  basicTreatmentPrefs: { en: 'Basic treatment mode and fluid preferences', ne: 'आधारभूत उपचार मोड र तरल प्राथमिकताहरू' },
  pdMode: { en: 'PD Mode', ne: 'PD मोड' },
  capdFull: { en: 'CAPD (Continuous Ambulatory)', ne: 'CAPD (निरन्तर एम्बुलेटरी)' },
  apdFull: { en: 'APD (Automated Peritoneal)', ne: 'APD (स्वचालित पेरिटोनियल)' },
  fluidBrand: { en: 'Fluid Brand', ne: 'तरल ब्राण्ड' },
  defaultDwellTime: { en: 'Default Dwell Time (hours)', ne: 'पूर्वनिर्धारित ड्वेल समय (घण्टा)' },
  hours: { en: 'hours', ne: 'घण्टा' },
  enablePushNotifications: { en: 'Enable push notifications', ne: 'पुस सूचनाहरू सक्षम गर्नुहोस्' },
  exchangeSchedule: { en: 'Exchange Schedule', ne: 'एक्सचेन्ज तालिका' },
  setDailyExchangeTimes: { en: 'Set your daily exchange times', ne: 'तपाईंको दैनिक एक्सचेन्ज समय सेट गर्नुहोस्' },
  scheduledTimes: { en: 'Scheduled Times', ne: 'तालिकाबद्ध समय' },
  addTime: { en: 'Add Time', ne: 'समय थप्नुहोस्' },
  totalExchangesPerDay: { en: 'Total exchanges per day', ne: 'प्रतिदिन कुल एक्सचेन्ज' },
  defaultDialysateStrengths: { en: 'Default Dialysate Strengths', ne: 'पूर्वनिर्धारित डायलिसेट शक्ति' },
  selectDialysateConcentrations: { en: 'Select the dialysate concentrations you typically use', ne: 'तपाईंले सामान्यतया प्रयोग गर्ने डायलिसेट सान्द्रता छान्नुहोस्' },
  dextrose: { en: 'Dextrose', ne: 'डेक्स्ट्रोज' },
  clickToToggle: { en: 'Click to toggle. Selected strengths will appear as quick options during exchange logging.', ne: 'टगल गर्न क्लिक गर्नुहोस्। छानिएका शक्तिहरू एक्सचेन्ज लगिङमा छिटो विकल्पको रूपमा देखिनेछ।' },
  treatmentPlan: { en: 'Treatment Plan', ne: 'उपचार योजना' },
  currentVersion: { en: 'Current Version', ne: 'हालको संस्करण' },
  lastUpdated: { en: 'Last updated', ne: 'अन्तिम अपडेट' },
  never: { en: 'Never', ne: 'कहिल्यै छैन' },
  mode: { en: 'Mode', ne: 'मोड' },
  settingsSaved: { en: 'Settings Saved ✅', ne: 'सेटिङ्ग सेभ भयो ✅' },
  settingsSavedDesc: { en: 'Your PD settings have been saved to the database.', ne: 'तपाईंको PD सेटिङ्गहरू डाटाबेसमा सेभ भयो।' },
  errorSavingSettings: { en: 'Error saving settings', ne: 'सेटिङ्ग सेभ गर्दा त्रुटि' },

  // ── Exchange Form extras ──
  time: { en: 'Time', ne: 'समय' },
  postFillWeight: { en: 'Post-Fill Weight (kg)', ne: 'भर्ने पछिको तौल (केजी)' },
  weightAfterFill: { en: 'Weight after fill', ne: 'भर्ने पछिको तौल' },
  autoCalculated: { en: 'Auto-calculated', ne: 'स्वत: गणना' },
  autoOrManual: { en: 'Auto or manual entry', ne: 'स्वत: वा म्यानुअल' },
  color: { en: 'Color', ne: 'रंग' },
  noPain: { en: 'No Pain', ne: 'दुखाइ छैन' },
  current: { en: 'Current', ne: 'हालको' },
  severe: { en: 'Severe', ne: 'गम्भीर' },
  fever: { en: 'Fever', ne: 'ज्वरो' },
  abdominalPain: { en: 'Abdominal Pain', ne: 'पेट दुखाइ' },
  constipation: { en: 'Constipation', ne: 'कब्जियत' },
  nausea: { en: 'Nausea', ne: 'वाकवाकी' },
  headache: { en: 'Headache', ne: 'टाउको दुखाइ' },
  dizziness: { en: 'Dizziness', ne: 'रिंगटा' },
  recordExchange: { en: 'Record your dialysis exchange', ne: 'तपाईंको डायलिसिस एक्सचेन्ज रेकर्ड गर्नुहोस्' },
  previousFill: { en: 'Previous fill', ne: 'अघिल्लो भर्ने' },
  usedForUF: { en: '(used for UF calculation)', ne: '(UF गणनाका लागि प्रयोग भयो)' },
  validationError: { en: 'Validation Error', ne: 'मान्यता त्रुटि' },
  enterValidVolumes: { en: 'Please enter valid volumes', ne: 'कृपया मान्य मात्रा हाल्नुहोस्' },
  anyConcerns: { en: 'Any concerns, symptoms, or observations...', ne: 'कुनै चिन्ता, लक्षण, वा अवलोकन...' },
  ufCalculated: { en: 'UF Calculated', ne: 'UF गणना भयो' },

  // ── PD Timeline ──
  pdTimeline: { en: 'PD Timeline', ne: 'PD समयरेखा' },
  pdTimelineDesc: { en: 'Your complete peritoneal dialysis journey', ne: 'तपाईंको सम्पूर्ण पेरिटोनियल डायलिसिस यात्रा' },
  addEvent: { en: 'Add Event', ne: 'घटना थप्नुहोस्' },
  selectEventType: { en: 'Select event type', ne: 'घटना प्रकार छान्नुहोस्' },
  eventAdded: { en: 'Event added to timeline', ne: 'समयरेखामा घटना थपियो' },
  noEventsYet: { en: 'No events recorded yet. Start by adding your first PD event.', ne: 'अझै कुनै घटना रेकर्ड गरिएको छैन।' },
  event_catheter_insertion: { en: 'Catheter Insertion', ne: 'क्याथेटर राखिएको' },
  event_pd_start: { en: 'PD Started', ne: 'PD सुरु भयो' },
  event_peritonitis: { en: 'Peritonitis', ne: 'पेरिटोनाइटिस' },
  event_exit_site_infection: { en: 'Exit Site Infection', ne: 'बाहिरी ठाउँ संक्रमण' },
  event_tunnel_infection: { en: 'Tunnel Infection', ne: 'टनेल संक्रमण' },
  event_catheter_revision: { en: 'Catheter Revision', ne: 'क्याथेटर संशोधन' },
  event_catheter_removal: { en: 'Catheter Removal', ne: 'क्याथेटर हटाइयो' },
  event_transfer_to_hd: { en: 'Transfer to HD', ne: 'HD मा स्थानान्तरण' },
  event_transplant: { en: 'Transplant', ne: 'प्रत्यारोपण' },
  event_pd_restart: { en: 'PD Restart', ne: 'PD पुनः सुरु' },
  event_death: { en: 'Death', ne: 'मृत्यु' },

  // ── Peritonitis ──
  peritonitisTracker: { en: 'Peritonitis Tracker', ne: 'पेरिटोनाइटिस ट्र्याकर' },
  peritonitisDesc: { en: 'Track infection episodes, antibiotics & cultures', ne: 'संक्रमण प्रकरणहरू, एन्टिबायोटिक र कल्चर ट्र्याक गर्नुहोस्' },
  newEpisode: { en: 'New Episode', ne: 'नयाँ प्रकरण' },
  recordNewEpisode: { en: 'Record New Peritonitis Episode', ne: 'नयाँ पेरिटोनाइटिस प्रकरण रेकर्ड गर्नुहोस्' },
  presentingSymptoms: { en: 'Presenting Symptoms', ne: 'उपस्थित लक्षणहरू' },
  effluentWBC: { en: 'Effluent WBC', ne: 'इफ्लुएन्ट WBC' },
  neutrophilPct: { en: 'Neutrophil %', ne: 'न्यूट्रोफिल %' },
  organism: { en: 'Organism', ne: 'जीवाणु' },
  classification: { en: 'Classification', ne: 'वर्गीकरण' },
  empiricRegimen: { en: 'Empiric Regimen', ne: 'अनुभवजन्य उपचार' },
  clinicalResponse: { en: 'Clinical Response', ne: 'क्लिनिकल प्रतिक्रिया' },
  responseGood: { en: 'Good', ne: 'राम्रो' },
  responsePartial: { en: 'Partial', ne: 'आंशिक' },
  responseNone: { en: 'None', ne: 'छैन' },
  episodeAdded: { en: 'Peritonitis episode recorded', ne: 'पेरिटोनाइटिस प्रकरण रेकर्ड भयो' },
  noEpisodes: { en: 'No peritonitis episodes', ne: 'कुनै पेरिटोनाइटिस प्रकरण छैन' },
  noEpisodesDesc: { en: 'Great! No infections recorded.', ne: 'राम्रो! कुनै संक्रमण रेकर्ड गरिएको छैन।' },
  episode: { en: 'Episode', ne: 'प्रकरण' },
  antibiotics: { en: 'Antibiotics', ne: 'एन्टिबायोटिक' },
  addAntibiotic: { en: 'Add Antibiotic', ne: 'एन्टिबायोटिक थप्नुहोस्' },
  antibioticAdded: { en: 'Antibiotic added', ne: 'एन्टिबायोटिक थपियो' },
  drugName: { en: 'Drug Name', ne: 'औषधिको नाम' },
  drug: { en: 'Drug', ne: 'औषधि' },
  route: { en: 'Route', ne: 'मार्ग' },
  start: { en: 'Start', ne: 'सुरु' },
  stop: { en: 'Stop', ne: 'अन्त्य' },
  dose: { en: 'Dose', ne: 'मात्रा' },
  oral: { en: 'Oral', ne: 'मुखबाट' },
  add: { en: 'Add', ne: 'थप्नुहोस्' },
  cultures: { en: 'Cultures', ne: 'कल्चर' },
  addCulture: { en: 'Add Culture', ne: 'कल्चर थप्नुहोस्' },
  cultureAdded: { en: 'Culture added', ne: 'कल्चर थपियो' },
  cultureDate: { en: 'Culture Date', ne: 'कल्चर मिति' },
  sampleType: { en: 'Sample Type', ne: 'नमूना प्रकार' },
  colonyCount: { en: 'Colony Count', ne: 'कलोनी गणना' },
  gramType: { en: 'Gram Type', ne: 'ग्राम प्रकार' },
  gramPositive: { en: 'Gram Positive', ne: 'ग्राम पोजिटिभ' },
  gramNegative: { en: 'Gram Negative', ne: 'ग्राम नेगेटिभ' },
  fungal: { en: 'Fungal', ne: 'फंगल' },
  mycobacterial: { en: 'Mycobacterial', ne: 'माइकोब्याक्टेरियल' },
  antibiogram: { en: 'Antibiogram', ne: 'एन्टिबायोग्राम' },
  addRow: { en: 'Add Row', ne: 'पङ्क्ति थप्नुहोस्' },
  antibioticName: { en: 'Antibiotic', ne: 'एन्टिबायोटिक' },
  result: { en: 'Result', ne: 'परिणाम' },
  sensitive: { en: 'Sensitive', ne: 'संवेदनशील' },
  resistant: { en: 'Resistant', ne: 'प्रतिरोधी' },
  intermediate: { en: 'Intermediate', ne: 'मध्यम' },
  noOrganism: { en: 'No organism', ne: 'कुनै जीव छैन' },
  gram_positive: { en: 'Gram +', ne: 'ग्राम +' },
  gram_negative: { en: 'Gram −', ne: 'ग्राम −' },
  gram_fungal: { en: 'Fungal', ne: 'फंगल' },
  gram_mycobacterial: { en: 'Mycobacterial', ne: 'माइकोब्याक्टेरियल' },
  uploadPhoto: { en: 'Upload Photo', ne: 'फोटो अपलोड गर्नुहोस्' },
  photosUploaded: { en: 'Photos uploaded', ne: 'फोटो अपलोड भयो' },
  maxPhotosReached: { en: 'Maximum photos reached', ne: 'अधिकतम फोटो पुगेको छ' },
  fileTooLarge: { en: 'File too large (max 5MB)', ne: 'फाइल धेरै ठूलो छ (अधिकतम ५MB)' },
  clinicalPhoto: { en: 'Clinical photo', ne: 'क्लिनिकल फोटो' },
  effluentPhotos: { en: 'Effluent Photos', ne: 'इफ्लुएन्ट फोटोहरू' },
  exitSitePhotos: { en: 'Exit Site Photos', ne: 'एक्जिट साइट फोटोहरू' },
  symptom_cloudy_effluent: { en: 'Cloudy Effluent', ne: 'धमिलो इफ्लुएन्ट' },
  symptom_abdominal_pain: { en: 'Abdominal Pain', ne: 'पेट दुख्ने' },
  symptom_fever: { en: 'Fever', ne: 'ज्वरो' },
  symptom_nausea: { en: 'Nausea', ne: 'वाकवाकी' },
  symptom_vomiting: { en: 'Vomiting', ne: 'बान्ता' },
  symptom_diarrhea: { en: 'Diarrhea', ne: 'पखाला' },
  class_standard: { en: 'Standard', ne: 'मानक' },
  class_culture_negative: { en: 'Culture Negative', ne: 'कल्चर नेगेटिभ' },
  class_fungal: { en: 'Fungal', ne: 'फंगल' },
  class_polymicrobial: { en: 'Polymicrobial', ne: 'बहुजीवाणु' },
  class_refractory: { en: 'Refractory', ne: 'प्रतिरोधी' },
  class_relapsing: { en: 'Relapsing', ne: 'पुनरावर्ती' },
  class_recurrent: { en: 'Recurrent', ne: 'बारम्बार' },
  class_repeat: { en: 'Repeat', ne: 'दोहोरिएको' },

  // ── Exit Site Infections ──
  exitSiteInfections: { en: 'Exit Site Infections', ne: 'बाहिरी ठाउँ संक्रमण' },
  exitSiteDesc: { en: 'Track and manage exit site infections', ne: 'बाहिरी ठाउँ संक्रमणहरू ट्र्याक र व्यवस्थापन' },
  record: { en: 'Record', ne: 'रेकर्ड' },
  infectionRecorded: { en: 'Infection recorded', ne: 'संक्रमण रेकर्ड भयो' },
  culturePending: { en: 'Culture pending', ne: 'कल्चर बाँकी' },
  resolved: { en: 'Resolved', ne: 'समाधान भयो' },
  active: { en: 'Active', ne: 'सक्रिय' },
  markResolved: { en: 'Mark Resolved', ne: 'समाधान भएको चिन्ह लगाउनुहोस्' },
  markedResolved: { en: 'Marked as resolved', ne: 'समाधान भएको रूपमा चिन्ह लगाइयो' },
  noExitSiteInfections: { en: 'No exit site infections recorded', ne: 'कुनै बाहिरी ठाउँ संक्रमण रेकर्ड गरिएको छैन' },
  antibiotic: { en: 'Antibiotic', ne: 'एन्टिबायोटिक' },
  topical: { en: 'Topical', ne: 'स्थानीय' },
  durationDays: { en: 'Duration (days)', ne: 'अवधि (दिन)' },
  exit_redness: { en: 'Redness', ne: 'रातोपन' },
  exit_swelling: { en: 'Swelling', ne: 'सुन्निने' },
  exit_discharge: { en: 'Discharge', ne: 'स्राव' },
  exit_crusting: { en: 'Crusting', ne: 'खस्रो' },
  exit_tenderness: { en: 'Tenderness', ne: 'दुखाइ' },
  exit_warmth: { en: 'Warmth', ne: 'तातोपन' },

  // ── Center Analytics ──
  centerAnalytics: { en: 'Center Analytics', ne: 'केन्द्र विश्लेषण' },
  centerAnalyticsDesc: { en: 'ISPD-style statistics & research export', ne: 'ISPD शैली तथ्याङ्क र अनुसन्धान निर्यात' },
  totalEpisodes: { en: 'Episodes', ne: 'प्रकरणहरू' },
  peritonitisRate: { en: 'Rate', ne: 'दर' },
  avgClearance: { en: 'Avg Clearance', ne: 'औसत सफाइ' },
  organismDistribution: { en: 'Organism Distribution', ne: 'जीवाणु वितरण' },
  cultureNegative: { en: 'Culture Negative', ne: 'कल्चर नेगेटिभ' },
  researchExport: { en: 'Research Export', ne: 'अनुसन्धान निर्यात' },
  researchExportDesc: { en: 'Download CSV ready for SPSS, R, or Stata analysis', ne: 'SPSS, R, वा Stata विश्लेषणका लागि CSV डाउनलोड गर्नुहोस्' },
  researchExported: { en: 'Research dataset exported', ne: 'अनुसन्धान डेटासेट निर्यात भयो' },
  exportCSV: { en: 'Export CSV', ne: 'CSV निर्यात' },
  timeline: { en: 'Timeline', ne: 'समयरेखा' },
  infections: { en: 'Infections', ne: 'संक्रमणहरू' },

  // ── Smart Clinical Alerts ──
  alertCenter: { en: 'Alert Center', ne: 'अलर्ट केन्द्र' },
  clinicalAlertsDescription: { en: 'Smart clinical alerts based on patient data', ne: 'बिरामी डेटामा आधारित स्मार्ट क्लिनिकल अलर्टहरू' },
  checkAlerts: { en: 'Check Alerts', ne: 'अलर्ट जाँच गर्नुहोस्' },
  activeAlerts: { en: 'Active Alerts', ne: 'सक्रिय अलर्टहरू' },
  alertsRequiringAttention: { en: 'Alerts requiring immediate attention', ne: 'तत्काल ध्यान आवश्यक अलर्टहरू' },
  noActiveAlerts: { en: 'No active alerts', ne: 'कुनै सक्रिय अलर्ट छैन' },
  clickCheckAlerts: { en: 'Click "Check Alerts" to scan patient data', ne: '"अलर्ट जाँच गर्नुहोस्" मा क्लिक गर्नुहोस्' },
  alertsGenerated: { en: 'New alerts found', ne: 'नयाँ अलर्टहरू भेटियो' },
  noNewAlerts: { en: 'No new alerts detected', ne: 'कुनै नयाँ अलर्ट भेटिएन' },
  recentlyAcknowledged: { en: 'Recently Acknowledged', ne: 'हालै स्वीकार गरिएको' },
  previouslyAddressedAlerts: { en: 'Previously addressed alerts', ne: 'पहिले सम्बोधन गरिएका अलर्टहरू' },
  highWBC: { en: 'High WBC', ne: 'उच्च WBC' },
  cultureResult: { en: 'Culture Result', ne: 'कल्चर नतिजा' },
  antibioticOverdue: { en: 'Antibiotic Overdue', ne: 'एन्टिबायोटिक ढिला' },
  noImprovement: { en: 'No Improvement', ne: 'सुधार छैन' },
  acknowledge: { en: 'Acknowledge', ne: 'स्वीकार गर्नुहोस्' },
  active: { en: 'Active', ne: 'सक्रिय' },
  call: { en: 'Call', ne: 'कल' },
  justNow: { en: 'Just now', ne: 'अहिले भर्खरै' },
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
