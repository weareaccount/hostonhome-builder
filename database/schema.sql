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
