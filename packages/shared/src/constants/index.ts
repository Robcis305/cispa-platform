// CISPA Application Constants

// Assessment Configuration
export const ASSESSMENT_CONFIG = {
  CORE_QUESTIONS_COUNT: 30,
  MAX_ASSESSMENT_TIME_HOURS: 2,
  DIMENSIONS: [
    'Financial',
    'Operational', 
    'Strategic',
    'Technology',
    'Human Capital',
    'Market Position'
  ] as const,
  MODULES: {
    CORE: 'core',
    MARKETING: 'marketing',
    TECHNOLOGY: 'technology',
    INVESTOR: 'investor'
  } as const,
} as const;

// Scoring Configuration
export const SCORING_CONFIG = {
  MIN_SCORE: 0,
  MAX_SCORE: 100,
  SCORE_RANGES: {
    EXCELLENT: { min: 80, max: 100, label: 'Excellent' },
    GOOD: { min: 60, max: 79, label: 'Good' },
    FAIR: { min: 40, max: 59, label: 'Fair' },
    POOR: { min: 0, max: 39, label: 'Poor' }
  } as const,
  RISK_THRESHOLDS: {
    HIGH_RISK: 40,
    MEDIUM_RISK: 60
  } as const
} as const;

// Report Configuration
export const REPORT_CONFIG = {
  SUPPORTED_FORMATS: ['pdf', 'powerpoint'] as const,
  MAX_FILE_SIZE_MB: 50,
  EXPIRY_DAYS: 30,
  DEFAULT_TEMPLATE: 'standard',
} as const;

// Investor Comparison
export const INVESTOR_CONFIG = {
  MAX_COMPARISON_COUNT: 5,
  DEFAULT_CRITERIA: [
    'valuation',
    'structure', 
    'culture',
    'speed'
  ] as const,
  WEIGHT_SCALE: {
    MIN: 1,
    MAX: 10,
    DEFAULT: 5
  } as const
} as const;

// User Interface
export const UI_CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
  } as const,
  DEBOUNCE_MS: 300,
  TOAST_DURATION_MS: 5000,
  AUTO_SAVE_INTERVAL_MS: 30000,
} as const;

// API Configuration
export const API_CONFIG = {
  TIMEOUT_MS: 30000,
  RETRY_ATTEMPTS: 3,
  RATE_LIMITS: {
    DEFAULT: { requests: 100, windowMs: 60000 },
    ASSESSMENT: { requests: 10, windowMs: 60000 },
    REPORT_GENERATION: { requests: 5, windowMs: 60000 }
  } as const
} as const;

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'application/pdf',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ] as const,
  MAX_FILES_PER_QUESTION: 3
} as const;

// Security Configuration
export const SECURITY_CONFIG = {
  SESSION_DURATION_HOURS: 24,
  SHARE_LINK_EXPIRY_DAYS: 7,
  PASSWORD_REQUIREMENTS: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: false
  } as const,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15
} as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must meet security requirements',
  ASSESSMENT_INCOMPLETE: 'Please complete all required questions',
  FILE_TOO_LARGE: `File size must be less than ${UPLOAD_CONFIG.MAX_FILE_SIZE_MB}MB`,
  INVALID_FILE_TYPE: 'File type not supported'
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ASSESSMENTS: '/dashboard/assessments',
  ASSESSMENT_NEW: '/dashboard/assessments/new',
  ASSESSMENT_VIEW: (id: string) => `/dashboard/assessments/${id}`,
  REPORTS: '/dashboard/reports',
  REPORT_VIEW: (id: string) => `/dashboard/reports/${id}`,
  SETTINGS: '/dashboard/settings',
  SHARED_REPORT: (token: string) => `/shared/${token}`,
} as const;