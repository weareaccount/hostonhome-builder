import { createClient } from '@supabase/supabase-js';
import type { PlanType } from '@/types';

// Environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key';

// Check if Supabase is properly configured
const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Client-side Supabase client (for components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (for API routes)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Simple types for our use case
export interface User {
  id: string;
  email: string;
  created_at: string;
  plan?: PlanType;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'NONE';
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  sections: any[];
  theme: {
    accent: string;
    font: string;
  };
  layout_type: string;
  created_at: string;
  updated_at: string;
}
