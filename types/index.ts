// Core types for the site builder application
export type LayoutType = 'ELEGANTE';
export type ThemeAccent = 'BLUE' | 'GREEN' | 'RED' | 'AMBER' | 'VIOLET';
export type ThemeFont = 'INTER' | 'POPPINS' | 'MONTSERRAT' | 'WORKSANS' | 'DMSANS';
export type SectionType = 'HERO' | 'ABOUT' | 'SERVICES' | 'GALLERY' | 'TESTIMONIALS' | 'CONTACT' | 'PHOTO_GALLERY' | 'AMENITIES' | 'GET_YOUR_GUIDE';
export type PlanType = 'BASE' | 'PLUS' | 'PRO';
export type UserRole = 'OWNER' | 'EDITOR';

// Theme configuration
export interface ThemeConfig {
  accent: ThemeAccent;
  font: ThemeFont;
}

// Section properties based on type
export interface BaseSectionProps {
  isActive: boolean;
  order: number;
  isPublished?: boolean;
  publishedAt?: string;
}

export interface HeroSectionProps extends BaseSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  backgroundImage?: string;
}

export interface AboutSectionProps extends BaseSectionProps {
  title: string;
  content: string;
  image?: string;
  imageAlt?: string;
}

export interface ServicesSectionProps extends BaseSectionProps {
  title: string;
  subtitle: string;
  services: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
}

export interface GallerySectionProps extends BaseSectionProps {
  title: string;
  images: Array<{
    url: string;
    alt: string;
    caption?: string;
  }>;
}

export interface PhotoGallerySectionProps extends BaseSectionProps {
  title: string;
  photos: Array<{
    url: string;
    alt?: string;
  }>;
}

export interface AmenitiesSectionProps extends BaseSectionProps {
  title: string;
  items: Array<{
    icon?: string;
    label: string;
  }>;
}

export interface GetYourGuideSectionProps extends BaseSectionProps {
  title: string;
  activities: Array<{
    title: string;
    description?: string;
    imageUrl?: string;
    link: string; // URL GetYourGuide
  }>;
}

export interface TestimonialsSectionProps extends BaseSectionProps {
  title: string;
  testimonials: Array<{
    content: string;
    author: string;
    role?: string;
    avatar?: string;
  }>;
}

export interface ContactSectionProps extends BaseSectionProps {
  title: string;
  subtitle: string;
  email: string;
  phone?: string;
  address?: string;
  showContactForm: boolean;
}

export type SectionProps = 
  | HeroSectionProps 
  | AboutSectionProps 
  | ServicesSectionProps 
  | GallerySectionProps 
  | PhotoGallerySectionProps
  | AmenitiesSectionProps
  | GetYourGuideSectionProps
  | TestimonialsSectionProps 
  | ContactSectionProps;

// Section definition
export interface Section {
  id: string;
  type: SectionType;
  props: SectionProps;
}

// Page definition
export interface Page {
  id: string;
  path: string;
  seoTitle?: string;
  seoDesc?: string;
  isHome: boolean;
  sections: Section[];
}

// Site definition
export interface Site {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  subdomain: string;
  layoutType: LayoutType;
  theme: ThemeConfig;
  logoUrl?: string;
  faviconUrl?: string;
  isPublished: boolean;
  publishedAt?: Date;
  plan: PlanType;
  pages: Page[];
}

// Template definition
export interface Template {
  id: string;
  name: string;
  layoutType: LayoutType;
  sectionsSchema: SectionType[];
  thumbnailUrl?: string;
}

// User profile
export interface UserProfile {
  id: string;
  userId: string;
  displayName?: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  tenantId: string;
}

// Tenant
export interface Tenant {
  id: string;
  name: string;
  slug: string;
}

// Subscription
export interface Subscription {
  id: string;
  stripeSubscriptionId: string;
  plan: PlanType;
  status: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

// Plan limits
export interface PlanLimits {
  pages: number;
  sections: number;
  images: number;
  customDomain: boolean;
  contactForm: boolean;
  analytics: boolean;
}

// Media asset
export interface MediaAsset {
  id: string;
  fileName: string;
  fileUrl: string;
  alt?: string;
  width?: number;
  height?: number;
  size: number;
  mimeType: string;
}

// Activity log
export interface ActivityLog {
  id: string;
  action: string;
  payload?: any;
  userId: string;
  tenantId: string;
  createdAt: Date;
}

// Stripe related types
export interface StripePrice {
  id: string;
  unit_amount: number;
  currency: string;
  recurring: {
    interval: 'month' | 'year';
  };
}

export interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  metadata: {
    plan: PlanType;
    limits: string; // JSON string of PlanLimits
  };
}

// Form validation types
export interface CreateSiteFormData {
  name: string;
  layoutType: LayoutType;
  theme: ThemeConfig;
  logo?: File;
}

export interface UpdateSiteFormData {
  name?: string;
  theme?: Partial<ThemeConfig>;
  logo?: File;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
