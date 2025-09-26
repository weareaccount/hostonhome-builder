'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { InteractiveThemePreview } from '@/components/builder/InteractiveThemePreview';
import { ProjectService, Project } from '@/lib/projects';
import { useIsAdmin } from '@/components/auth/AdminGuard';
import { Section, LayoutType, ThemeAccent, ThemeFont } from '@/types';

export default function AdminPreviewPage() {
  const params = useParams();
  const isAdmin = useIsAdmin();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      if (!params.slug) return;
      
      console.log('🔍 DEBUG AdminPreviewPage:', {
        slug: params.slug,
        isAdmin,
        adminSession: localStorage.getItem('admin_session')
      });
      
      if (!isAdmin) {
        console.log('❌ Accesso negato: non è admin');
        setLoading(false);
        return;
      }
      
      try {
        console.log('🔍 Admin: Caricamento progetto per anteprima:', params.slug);
        const foundProject = await ProjectService.getProjectBySlug(params.slug as string);
        console.log('🔍 Admin: Risultato ricerca progetto:', foundProject);
        
        if (foundProject) {
          setProject(foundProject);
          console.log('✅ Progetto caricato per anteprima admin:', foundProject.name);
        } else {
          console.log('❌ Progetto non trovato per anteprima admin:', params.slug);
        }
      } catch (error) {
        console.error('Errore nel caricamento del progetto:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [isAdmin, params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento anteprima...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accesso Negato</h1>
          <p className="text-gray-600 mb-6">Solo gli amministratori possono accedere a questa anteprima.</p>
          <button
            onClick={() => window.close()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Chiudi finestra
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Progetto non trovato</h1>
          <p className="text-gray-600 mb-6">Il progetto richiesto non esiste o non hai i permessi per visualizzarlo.</p>
          <button
            onClick={() => window.close()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Chiudi finestra
          </button>
        </div>
      </div>
    );
  }

  // Crea un sito mock dal progetto
  const mockSite = {
    id: project.id,
    name: project.name,
    slug: project.slug,
    subdomain: `${project.slug}.tuodominio.it`,
    layoutType: project.layout_type as LayoutType,
    theme: {
      accent: project.theme.accent as ThemeAccent,
      font: project.theme.font as ThemeFont
    },
    isPublished: true,
    plan: 'PLUS',
    pages: [
      {
        id: 'page-1',
        path: '/',
        isHome: true,
        seoTitle: `${project.name} - Home`,
        seoDesc: `Sito web professionale per ${project.name}`,
        sections: project.sections as Section[]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
          🔒 Anteprima Admin
        </div>
      </div>
      
      <InteractiveThemePreview 
        site={mockSite}
        isPreview={true}
        showAdminBadge={true}
      />
    </div>
  );
}
