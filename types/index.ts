// Core types for the site builder application
export type LayoutType = 'ELEGANTE';
export type ThemeAccent = 'BLUE' | 'GREEN' | 'RED' | 'AMBER' | 'VIOLET';
export type ThemeFont = 'INTER' | 'POPPINS' | 'MONTSERRAT' | 'WORKSANS' | 'DMSANS';
export type SectionType = 'HERO' | 'ABOUT' | 'SERVICES' | 'GALLERY' | 'TESTIMONIALS' | 'CONTACT' | 'PHOTO_GALLERY' | 'AMENITIES' | 'GET_YOUR_GUIDE' | 'DOMAIN_NAME';
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
  primaryButtonColor?: ThemeAccent;
  secondaryButtonColor?: ThemeAccent;
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

export interface DomainNameSectionProps extends BaseSectionProps {
  title: string;
  subtitle: string;
  domainInputs: Array<{
    id: string;
    placeholder: string;
    value: string;
  }>;
  contactEmail: string;
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
  | ContactSectionProps
  | DomainNameSectionProps;

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

// Challenge types
export type ChallengeType = 
  | 'SHARE_SITE'
  | 'FIRST_VISITS'
  | 'FIRST_REVIEW'
  | 'WHATSAPP_CONTACT'
  | 'UPDATE_PHOTOS'
  | 'FIRST_BOOKING'
  | 'SOCIAL_SHARE'
  | 'INTERNATIONAL_GUEST'
  | 'TOP_HOST_MONTH'
  | 'SUPER_HOST_INDEPENDENT';

export type ChallengeStatus = 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'PENDING_VERIFICATION' | 'COMPLETED' | 'REJECTED';

export type RewardType = 'BADGE' | 'CONSULTATION' | 'TEMPLATE' | 'GUIDE' | 'TRANSLATION' | 'SHOWCASE';

export interface Challenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  icon: string;
  reward: {
    type: RewardType;
    title: string;
    description: string;
  };
  target: {
    value: number;
    unit: string;
    description: string;
  };
  status: ChallengeStatus;
  progress: {
    current: number;
    target: number;
    percentage: number;
  };
  completedAt?: Date;
  unlockedAt?: Date;
}

export interface ChallengeProgress {
  challengeId: string;
  userId: string;
  currentValue: number;
  lastUpdated: Date;
  metadata?: Record<string, any>;
}

export interface UserBadge {
  id: string;
  challengeId: string;
  userId: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  isVisible: boolean;
  rarity?: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  color?: string;
}

// Sistema di sblocco banner
export type BannerType = 'PRIMI_PASSI' | 'OSPITE_FELICE' | 'INDIPENDENTE';

export interface Banner {
  id: BannerType;
  title: string;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE';
  requiredChallenges: string[]; // Array di challenge IDs
  unlockedAt?: Date;
  isUnlocked: boolean;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

// Sistema di verifica foto
export interface ChallengeVerification {
  id: string;
  challengeId: string;
  userId: string;
  photoUrl: string;
  photoDescription?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface AdminNotification {
  id: string;
  type: 'CHALLENGE_VERIFICATION';
  userId: string;
  challengeId: string;
  verificationId: string;
  title: string;
  message: string;
  photoUrl: string;
  isRead: boolean;
  createdAt: Date;
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
