import { ThemeAccent, ThemeFont, PlanType, PlanLimits } from '@/types';

// Theme constants
export const THEME_ACCENTS: Record<ThemeAccent, { name: string; rgb: string; hex: string }> = {
  BLUE: { name: 'Blu', rgb: '37,99,235', hex: '#2563eb' },
  GREEN: { name: 'Verde', rgb: '22,163,74', hex: '#16a34a' },
  RED: { name: 'Rosso', rgb: '220,38,38', hex: '#dc2626' },
  AMBER: { name: 'Ambra', rgb: '245,158,11', hex: '#f59e0b' },
  VIOLET: { name: 'Viola', rgb: '139,92,246', hex: '#8b5cf6' },
};

export const THEME_FONTS: Record<ThemeFont, { name: string; family: string; weight: string }> = {
  INTER: { name: 'Inter', family: 'Inter', weight: '400' },
  POPPINS: { name: 'Poppins', family: 'Poppins', weight: '400' },
  MONTSERRAT: { name: 'Montserrat', family: 'Montserrat', weight: '400' },
  WORKSANS: { name: 'Work Sans', family: 'Work Sans', weight: '400' },
  DMSANS: { name: 'DM Sans', family: 'DM Sans', weight: '400' },
  NUNITO: { name: 'Nunito', family: 'Nunito', weight: '400' },
  ROBOTO: { name: 'Roboto', family: 'Roboto', weight: '400' },
  LATO: { name: 'Lato', family: 'Lato', weight: '400' },
  LORA: { name: 'Lora', family: 'Lora', weight: '400' },
  PLAYFAIR: { name: 'Playfair Display', family: 'Playfair Display', weight: '400' },
};

// Layout types
export const LAYOUT_TYPES = {
  ELEGANTE: { name: 'Host On Home', description: 'Design raffinato con spaziature ampie e tipografia serif' },
} as const;

// Section types with limits
export const SECTION_TYPES = {
  HERO: { name: 'Hero', maxTitle: 60, maxSubtitle: 120 },
  ABOUT: { name: 'Chi Siamo', maxTitle: 60, maxContent: 500 },
  SERVICES: { name: 'Servizi', maxTitle: 60, maxSubtitle: 120, maxServices: 6 },
  GALLERY: { name: 'Galleria', maxTitle: 60, maxImages: 12 },
  TESTIMONIALS: { name: 'Testimonianze', maxTitle: 60, maxTestimonials: 6 },
  CONTACT: { name: 'Contatti', maxTitle: 60, maxSubtitle: 120 },
} as const;

// Plan limits
export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  BASE: {
    pages: 1,
    sections: 5,
    images: 5,
    customDomain: false,
    contactForm: false,
    analytics: false,
  },
  PLUS: {
    pages: 3,
    sections: 12,
    images: 24,
    customDomain: false,
    contactForm: true,
    analytics: false,
  },
  PRO: {
    pages: 999, // Unlimited
    sections: 999, // Unlimited
    images: 999, // Unlimited
    customDomain: true,
    contactForm: true,
    analytics: true,
  },
};

// Stripe pricing (in cents)
export const STRIPE_PRICING = {
  BASE: {
    monthly: 580, // €5.80/mese
    yearly: 6900, // €69/anno
  },
  PLUS: {
    monthly: 750, // €7.50/mese
    yearly: 8500, // €85/anno
  },
  PRO: {
    monthly: 990, // €9.90/mese
    yearly: 9990, // €99.90/anno
  },
};

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  MAX_IMAGE_DIMENSIONS: { width: 1920, height: 1080 },
  COMPRESSION_QUALITY: 0.8,
};

// Site builder constants
export const BUILDER_CONSTANTS = {
  MAX_SECTIONS_PER_PAGE: 12,
  MAX_TITLE_LENGTH: 60,
  MAX_SUBTITLE_LENGTH: 120,
  MAX_CONTENT_LENGTH: 500,
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  MAX_UNDO_STEPS: 10,
};

// API rate limits
export const RATE_LIMITS = {
  UPLOAD: { requests: 10, window: 60000 }, // 10 uploads per minute
  PUBLISH: { requests: 5, window: 60000 }, // 5 publishes per minute
  API: { requests: 100, window: 60000 }, // 100 API calls per minute
};

// Default site settings
export const DEFAULT_SITE_SETTINGS = {
  SEO_TITLE_SUFFIX: ' - Creato con HostonHome',
  DEFAULT_LOGO_SIZE: { width: 200, height: 60 },
  DEFAULT_FAVICON_SIZE: { width: 32, height: 32 },
  SUBDOMAIN_BASE: 'tuodominio.it', // TODO: configurare dominio reale
};

// Navigation
export const NAVIGATION = {
  DASHBOARD: '/dashboard',
  SITES: '/dashboard/sites',
  SETTINGS: '/dashboard/settings',
  BILLING: '/dashboard/billing',
  HELP: '/help',
};

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Non hai i permessi per accedere a questa risorsa',
  NOT_FOUND: 'Risorsa non trovata',
  VALIDATION_ERROR: 'Dati non validi',
  PLAN_LIMIT_EXCEEDED: 'Limite del piano superato. Aggiorna per continuare',
  UPLOAD_FAILED: 'Caricamento file fallito',
  PUBLISH_FAILED: 'Pubblicazione fallita',
  STRIPE_ERROR: 'Errore durante il pagamento',
};

// Success messages
export const SUCCESS_MESSAGES = {
  SITE_CREATED: 'Sito creato con successo',
  SITE_UPDATED: 'Sito aggiornato con successo',
  SITE_PUBLISHED: 'Sito pubblicato con successo',
  UPLOAD_SUCCESS: 'File caricato con successo',
  SETTINGS_SAVED: 'Impostazioni salvate',
  PAYMENT_SUCCESS: 'Pagamento completato con successo',
};
