import { supabase, Project } from './supabase'

export interface CreateProjectData {
  name: string
  slug: string
  sections: any[]
  theme: {
    accent: string
    font: string
  }
  layout_type: string
}

export interface UpdateProjectData {
  name?: string
  sections?: any[]
  theme?: {
    accent: string
    font: string
  }
  layout_type?: string
}

export class ProjectService {
  // Controlla se Supabase è configurato
  private static checkSupabaseConfig() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('⚠️ Supabase non configurato, usando storage locale');
      return false;
    }
    return true;
  }

  // Storage locale come fallback
  private static localStorageKey = 'hostonhome_projects';
  
  static getLocalProjects(): Project[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.localStorageKey);
      const projects = data ? JSON.parse(data) : [];
      console.log('📁 Progetti locali caricati:', projects.length, 'progetti');
      return projects;
    } catch (error) {
      console.error('Errore nel caricamento locale:', error);
      return [];
    }
  }
  
  private static saveLocalProjects(projects: Project[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(projects));
      console.log('💾 Progetti salvati localmente:', projects.length, 'progetti');
    } catch (error) {
      console.error('Errore nel salvataggio locale:', error);
    }
  }

  // Crea un nuovo progetto
  static async createProject(userId: string, data: CreateProjectData): Promise<Project> {
    console.log('🆕 ProjectService.createProject chiamato:', { userId, data });
    const hasSupabase = this.checkSupabaseConfig();
    
    if (hasSupabase) {
      try {
        console.log('🆕 Creando progetto su Supabase...');
        const insertData = {
          user_id: userId,
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        console.log('🆕 Dati da inserire:', insertData);
        
        const { data: project, error } = await supabase
          .from('projects')
          .insert(insertData)
          .select()
          .single()

        if (error) {
          console.error('❌ Errore Supabase createProject:', error);
          throw error;
        }
        
        // Salva anche localmente come backup
        const projects = this.getLocalProjects();
        projects.push(project);
        this.saveLocalProjects(projects);
        console.log('✅ Progetto creato su Supabase e salvato localmente:', project);
        return project;
      } catch (error) {
        console.warn('⚠️ Creazione progetto su Supabase fallita, uso fallback locale:', error)
        // Fallback locale
        const newProject: Project = {
          id: `project-${Date.now()}`,
          user_id: userId,
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const projects = this.getLocalProjects();
        projects.push(newProject);
        this.saveLocalProjects(projects);
        console.log('✅ Progetto creato localmente (fallback):', newProject);
        return newProject;
      }
    } else {
      // Fallback locale
      const newProject: Project = {
        id: `project-${Date.now()}`,
        user_id: userId,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const projects = this.getLocalProjects();
      projects.push(newProject);
      this.saveLocalProjects(projects);
      
      console.log('✅ Progetto creato localmente:', newProject);
      return newProject;
    }
  }

  // Ottiene tutti i progetti di un utente
  static async getUserProjects(userId: string): Promise<Project[]> {
    const hasSupabase = this.checkSupabaseConfig();
    
    // Prima carica i progetti locali per feedback immediato
    const localProjects = this.getLocalProjects()
      .filter(p => p.user_id === userId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    
    if (!hasSupabase) {
      console.log('ℹ️ Supabase non configurato, uso solo progetti locali')
      return localProjects;
    }
    
    // Poi prova a sincronizzare con Supabase (con timeout ridotto)
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout Supabase')), 2000) // 2 secondi per essere più veloce
      );
      
      const supabasePromise = supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      const { data: remoteProjects, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;

      if (error) throw error;
      
      // Unisci risultati rimuovendo duplicati per slug
      const mergedMap = new Map<string, Project>();
      (remoteProjects || []).forEach((p: Project) => mergedMap.set(p.slug, p));
      localProjects.forEach(p => mergedMap.set(p.slug, p));
      
      const merged = Array.from(mergedMap.values())
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      
      console.log('✅ Progetti caricati da Supabase:', merged.length);
      return merged;
    } catch (error) {
      console.warn('⚠️ Caricamento progetti da Supabase fallito, uso solo progetti locali:', error);
      return localProjects;
    }
  }

  // Ottiene un progetto specifico
  static async getProject(projectId: string): Promise<Project | null> {
    console.log('🔍 ProjectService.getProject chiamato con ID:', projectId);
    const hasSupabase = this.checkSupabaseConfig();
    
    if (hasSupabase) {
      try {
        console.log('🔍 Cercando progetto su Supabase...');
        const { data: project, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (error) {
          console.warn('⚠️ Errore nel recupero progetto da Supabase:', error);
          console.log('⚠️ Fallback a progetti locali...');
          // Fallback locale
          const projects = this.getLocalProjects();
          const localProject = projects.find(p => p.id === projectId);
          console.log('🔍 Progetto locale trovato:', localProject?.id || 'null');
          return localProject || null;
        }
        
        console.log('✅ Progetto trovato su Supabase:', project?.id);
        return project;
      } catch (error) {
        console.warn('⚠️ Fallback a progetti locali per ID:', projectId, 'errore:', error);
        const projects = this.getLocalProjects();
        const localProject = projects.find(p => p.id === projectId);
        console.log('🔍 Progetto locale trovato (catch):', localProject?.id || 'null');
        return localProject || null;
      }
    } else {
      // Fallback locale
      console.log('🔍 Supabase non configurato, uso progetti locali');
      const projects = this.getLocalProjects();
      const localProject = projects.find(p => p.id === projectId);
      console.log('🔍 Progetto locale trovato (no supabase):', localProject?.id || 'null');
      return localProject || null;
    }
  }

  // Aggiorna un progetto
  static async updateProject(projectId: string, data: UpdateProjectData): Promise<Project> {
    const hasSupabase = this.checkSupabaseConfig();
    
    if (hasSupabase) {
      try {
        // Aggiungi timeout per evitare statement timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: operazione troppo lenta')), 10000)
        );
        
        const updatePromise = supabase
          .from('projects')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', projectId)
          .select()
          .single();

        const { data: project, error } = await Promise.race([updatePromise, timeoutPromise]) as any;

        if (error) {
          console.error('❌ Errore Supabase updateProject:', error);
          throw error;
        }
        
        console.log('✅ Progetto aggiornato in Supabase:', project.id);
        return project;
      } catch (error) {
        console.error('❌ Errore durante updateProject:', error);
        // Fallback locale in caso di errore
        console.log('🔄 Fallback a storage locale...');
        const projects = this.getLocalProjects();
        const projectIndex = projects.findIndex(p => p.id === projectId);
        
        if (projectIndex === -1) {
          throw new Error('Progetto non trovato');
        }
        
        const updatedProject = {
          ...projects[projectIndex],
          ...data,
          updated_at: new Date().toISOString()
        };
        
        projects[projectIndex] = updatedProject;
        this.saveLocalProjects(projects);
        
        console.log('✅ Progetto aggiornato localmente (fallback):', updatedProject.id);
        return updatedProject;
      }
    } else {
      // Fallback locale
      const projects = this.getLocalProjects();
      const projectIndex = projects.findIndex(p => p.id === projectId);
      
      if (projectIndex === -1) {
        throw new Error('Progetto non trovato');
      }
      
      const updatedProject = {
        ...projects[projectIndex],
        ...data,
        updated_at: new Date().toISOString()
      };
      
      projects[projectIndex] = updatedProject;
      this.saveLocalProjects(projects);
      
      console.log('✅ Progetto aggiornato localmente:', updatedProject.id, 'con', data.sections?.length || 0, 'sezioni');
      return updatedProject;
    }
  }

  // Elimina un progetto
  static async deleteProject(projectId: string): Promise<void> {
    const hasSupabase = this.checkSupabaseConfig()
    
    // Prima rimuovi dallo storage locale per feedback immediato
    const projects = this.getLocalProjects();
    const idx = projects.findIndex(p => p.id === projectId)
    if (idx !== -1) {
      projects.splice(idx, 1)
      this.saveLocalProjects(projects)
      console.log('✅ Progetto rimosso dallo storage locale')
    }
    
    // Poi prova a rimuovere da Supabase se configurato
    if (hasSupabase) {
      try {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', projectId)
        if (error) {
          console.warn('⚠️ Eliminazione su Supabase fallita:', error)
          throw new Error(`Errore Supabase: ${error.message}`)
        } else {
          console.log('✅ Progetto eliminato da Supabase')
        }
      } catch (error) {
        console.warn('⚠️ Eliminazione su Supabase fallita, progetto rimane solo in locale:', error)
        // Non rilanciare l'errore perché abbiamo già rimosso localmente
      }
    } else {
      console.log('ℹ️ Supabase non configurato, progetto rimosso solo localmente')
    }
  }

  // Ottiene un progetto per slug
  static async getProjectBySlug(slug: string): Promise<Project | null> {
    const hasSupabase = this.checkSupabaseConfig()
    if (hasSupabase) {
      try {
        const { data: project, error } = await supabase
          .from('projects')
          .select('*')
          .eq('slug', slug)
          .single()
        if (error) throw error
        return project
      } catch (error) {
        console.warn('⚠️ Recupero per slug da Supabase fallito, provo locale:', error)
        const local = this.getLocalProjects().find(p => p.slug === slug) || null
        return local
      }
    }
    // Fallback locale
    return this.getLocalProjects().find(p => p.slug === slug) || null
  }
}
