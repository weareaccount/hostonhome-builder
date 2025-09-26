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
        adminSession: typeof window !== 'undefined' ? localStorage.getItem('admin_session') : null
      });
      
      // Controllo admin più permissivo per anteprima (solo client-side)
      const adminSession = typeof window !== 'undefined' ? localStorage.getItem('admin_session') : null;
      const isAdminSession = adminSession && adminSession.includes('admin@hostonhome.it');
      
      console.log('🔍 DEBUG AdminPreviewPage - Controlli:', {
        isAdmin,
        isAdminSession,
        adminSession
      });
      
      if (!isAdmin && !isAdminSession) {
        console.log('❌ Accesso negato: non è admin');
        setLoading(false);
        return;
      }
      
      try {
        console.log('🔍 Admin: Caricamento progetto per anteprima:', params.slug);
        const foundProject = await ProjectService.getProjectBySlug(params.slug as string);
        console.log('🔍 Admin: Risultato ricerca progetto:', foundProject);
        
        if (foundProject) {
          console.log('🔍 DEBUG - Struttura progetto:', {
            id: foundProject.id,
            name: foundProject.name,
            theme: foundProject.theme,
            layout_type: foundProject.layout_type,
            sections: foundProject.sections
          });
          setProject(foundProject);
          console.log('✅ Progetto caricato per anteprima admin:', foundProject.name);
        } else {
          console.log('❌ Progetto non trovato per anteprima admin:', params.slug);
          // Mostra un messaggio di errore più user-friendly
          console.warn('⚠️ Il progetto potrebbe non esistere o essere stato eliminato');
        }
      } catch (error) {
        console.error('❌ Errore critico nel caricamento del progetto:', error);
        // In caso di errore critico, prova a caricare i progetti locali
        try {
          const localProjects = ProjectService.getLocalProjects();
          const localProject = localProjects.find(p => p.slug === params.slug);
          if (localProject) {
            console.log('🔄 Fallback a progetto locale:', localProject.name);
            setProject(localProject);
          }
        } catch (localError) {
          console.error('❌ Errore anche nel fallback locale:', localError);
        }
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
          <p className="text-sm text-gray-500 mt-2">Slug: {params.slug}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h2 className="font-bold text-lg mb-2">Progetto non trovato</h2>
            <p className="text-sm">
              Il progetto con slug <code className="bg-red-200 px-1 rounded">{params.slug}</code> non è stato trovato.
            </p>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Possibili cause:</p>
            <ul className="list-disc list-inside space-y-1 text-left">
              <li>Il progetto è stato eliminato</li>
              <li>Lo slug non è corretto</li>
              <li>Problemi di connessione al database</li>
            </ul>
          </div>
          <button 
            onClick={() => window.location.href = '/admin/users'}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Torna alla Dashboard Admin
          </button>
        </div>
      </div>
    );
  }

  // Controllo admin più permissivo (solo client-side)
  const adminSession = typeof window !== 'undefined' ? localStorage.getItem('admin_session') : null;
  const isAdminSession = adminSession && adminSession.includes('admin@hostonhome.it');
  
  if (!isAdmin && !isAdminSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accesso Negato</h1>
          <p className="text-gray-600 mb-6">Solo gli amministratori possono accedere a questa anteprima.</p>
          <div className="text-sm text-gray-500 mb-4">
            <p>Debug info:</p>
            <p>isAdmin: {isAdmin ? 'true' : 'false'}</p>
            <p>isAdminSession: {isAdminSession ? 'true' : 'false'}</p>
            <p>adminSession: {adminSession ? 'presente' : 'assente'}</p>
          </div>
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

  // Crea un sito mock dal progetto con fallback per tema mancante
  const mockSite = {
    id: project.id,
    name: project.name,
    slug: project.slug,
    subdomain: `${project.slug}.tuodominio.it`,
    layoutType: (project.layout_type as LayoutType) || 'ELEGANTE',
    theme: {
      accent: (project.theme?.accent as ThemeAccent) || 'BLUE',
      font: (project.theme?.font as ThemeFont) || 'INTER'
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
        sections: (project.sections as Section[]) || []
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
        layoutType={mockSite.layoutType}
        theme={mockSite.theme}
        sections={mockSite.pages[0].sections}
        onSectionUpdate={() => {}}
        onSectionDelete={() => {}}
        onSectionPublish={() => {}}
        onSectionUnpublish={() => {}}
        onSectionReorder={() => {}}
        deviceType="desktop"
        readOnly={true}
      />
    </div>
  );
}
