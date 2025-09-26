-- Schema per HostonHome Builder

-- Tabella utenti (gestita automaticamente da Supabase Auth)
-- CREATE TABLE auth.users (id UUID PRIMARY KEY, email TEXT, created_at TIMESTAMP);

-- Tabella progetti
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sections JSONB DEFAULT '[]'::jsonb,
  theme JSONB DEFAULT '{"accent": "BLUE", "font": "INTER"}'::jsonb,
  layout_type TEXT DEFAULT 'ELEGANTE',
  domain_names JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON public.projects(updated_at);

-- Funzione per aggiornare automaticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger per aggiornare automaticamente updated_at
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON public.projects 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Politiche RLS (Row Level Security)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Politica: gli utenti possono vedere solo i propri progetti
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

-- Politica: gli utenti possono inserire solo i propri progetti
CREATE POLICY "Users can insert own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politica: gli utenti possono aggiornare solo i propri progetti
CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

-- Politica: gli utenti possono eliminare solo i propri progetti
CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Politica: chiunque può vedere i progetti pubblici (per preview)
CREATE POLICY "Anyone can view public projects" ON public.projects
  FOR SELECT USING (true);

-- Tabella verifiche challenge
CREATE TABLE IF NOT EXISTS public.challenge_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  photo_description TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella notifiche admin
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('CHALLENGE_VERIFICATION', 'USER_REGISTRATION', 'SUBSCRIPTION_UPDATE')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id TEXT,
  verification_id UUID REFERENCES public.challenge_verifications(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  photo_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella notifiche utenti
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('CHALLENGE_APPROVED', 'CHALLENGE_REJECTED', 'BADGE_UNLOCKED', 'SUBSCRIPTION_UPDATE')),
  challenge_id TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_challenge_verifications_user_id ON public.challenge_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_verifications_status ON public.challenge_verifications(status);
CREATE INDEX IF NOT EXISTS idx_challenge_verifications_submitted_at ON public.challenge_verifications(submitted_at);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON public.admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON public.admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON public.admin_notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON public.user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON public.user_notifications(created_at);

-- Trigger per aggiornare automaticamente updated_at
CREATE TRIGGER update_challenge_verifications_updated_at 
  BEFORE UPDATE ON public.challenge_verifications 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_notifications_updated_at 
  BEFORE UPDATE ON public.admin_notifications 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notifications_updated_at 
  BEFORE UPDATE ON public.user_notifications 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Politiche RLS per challenge_verifications
ALTER TABLE public.challenge_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verifications" ON public.challenge_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verifications" ON public.challenge_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all verifications" ON public.challenge_verifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email IN ('admin@hostonhome.com', 'matteo@weareaccount.com')
    )
  );

CREATE POLICY "Admins can update verifications" ON public.challenge_verifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email IN ('admin@hostonhome.com', 'matteo@weareaccount.com')
    )
  );

-- Politiche RLS per admin_notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin notifications" ON public.admin_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email IN ('admin@hostonhome.com', 'matteo@weareaccount.com')
    )
  );

CREATE POLICY "Admins can update admin notifications" ON public.admin_notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email IN ('admin@hostonhome.com', 'matteo@weareaccount.com')
    )
  );

CREATE POLICY "System can insert admin notifications" ON public.admin_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can delete admin notifications" ON public.admin_notifications
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email IN ('admin@hostonhome.com', 'matteo@weareaccount.com')
    )
  );

-- Politiche RLS per user_notifications
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.user_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.user_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert user notifications" ON public.user_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can delete user notifications" ON public.user_notifications
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email IN ('admin@hostonhome.com', 'matteo@weareaccount.com')
    )
  );

-- Funzione per ottenere i progetti di un utente
CREATE OR REPLACE FUNCTION get_user_projects(user_uuid UUID)
RETURNS SETOF public.projects AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.projects 
  WHERE user_id = user_uuid 
  ORDER BY updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per ottenere le notifiche admin
CREATE OR REPLACE FUNCTION get_admin_notifications()
RETURNS SETOF public.admin_notifications AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.admin_notifications 
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per ottenere le notifiche utente
CREATE OR REPLACE FUNCTION get_user_notifications(user_uuid UUID)
RETURNS SETOF public.user_notifications AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.user_notifications 
  WHERE user_id = user_uuid 
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
