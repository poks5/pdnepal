/**
 * Production constants and configuration
 */

export const APP_CONFIG = {
  name: 'PDsathi',
  version: '1.0.0',
  description: 'Peritoneal Dialysis Management System',
  supportEmail: 'support@pdsathi.com',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
} as const;

export const API_ENDPOINTS = {
  base: import.meta.env.PROD ? 'https://api.pdsathi.com' : 'http://localhost:3000',
  auth: '/api/auth',
  patients: '/api/patients',
  doctors: '/api/doctors',
  exchanges: '/api/exchanges',
  files: '/api/files',
} as const;

export const STORAGE_KEYS = {
  user: 'dialysis_user',
  data: 'pd_tracker_data',
  settings: 'user_settings',
  offline_queue: 'pd_offline_queue',
} as const;

export const VALIDATION_RULES = {
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
  },
  phone: {
    pattern: /^(\+977[-\s]?)?[1-9]\d{8,9}$/,
    message: 'Please enter a valid Nepali phone number'
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  }
} as const;

export const MEDICAL_CONSTANTS = {
  normalVitalRanges: {
    bloodPressure: { systolic: [90, 140], diastolic: [60, 90] },
    heartRate: [60, 100],
    temperature: [36.1, 37.2], // Celsius
    weight: { min: 30, max: 200 }, // kg
  },
  exchangeTypes: [
    'morning',
    'afternoon', 
    'evening',
    'night',
    'manual'
  ],
  solutionTypes: [
    'Dianeal 1.5%',
    'Dianeal 2.5%', 
    'Dianeal 4.25%',
    'Physioneal 1.36%',
    'Physioneal 2.27%',
    'Physioneal 3.86%'
  ]
} as const;

export const FEATURE_FLAGS = {
  enableOfflineMode: true,
  enablePushNotifications: true,
  enableVoiceNotes: true,
  enableBarcodeScanning: true,
  enableDataExport: true,
  enableAnalytics: true,
} as const;