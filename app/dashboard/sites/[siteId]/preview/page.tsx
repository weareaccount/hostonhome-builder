'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { InteractiveThemePreview } from '@/components/builder/InteractiveThemePreview';
import { ProjectService, Project } from '@/lib/projects';
import { useAuth } from '@/components/auth/AuthProvider';
import { useIsAdmin } from '@/components/auth/AdminGuard';
import { Section, LayoutType, ThemeAccent, ThemeFont } from '@/types';
import { isSubscriptionActive, getSubscriptionBlockReason } from '@/lib/subscription';

export default function PreviewPage() {
  const params = useParams();
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      if (!params.siteId) return;
      
      console.log('🔍 DEBUG PreviewPage:', {
        siteId: params.siteId,
        isAdmin,
        user: user ? { id: user.id, email: user.email } : null,
        adminSession: localStorage.getItem('admin_session')
      });
      
      try {
        let foundProject = null;
        
        if (isAdmin) {
          // Se è admin, carica il progetto direttamente tramite slug
          console.log('🔍 Admin: Caricamento progetto per anteprima:', params.siteId);
          foundProject = await ProjectService.getProjectBySlug(params.siteId as string);
          console.log('🔍 Admin: Risultato ricerca progetto:', foundProject);
        } else if (user) {
          // Se è utente normale, carica solo i suoi progetti
          console.log('🔍 Utente normale: Caricamento progetti utente:', user.id);
          const userProjects = await ProjectService.getUserProjects(user.id);
          console.log('🔍 Utente normale: Progetti trovati:', userProjects.length);
          foundProject = userProjects.find(p => p.slug === params.siteId);
          console.log('🔍 Utente normale: Progetto trovato per slug:', foundProject);
        } else {
          console.log('❌ Nessun utente autenticato e non è admin');
        }
        
        if (foundProject) {
          setProject(foundProject);
          console.log('✅ Progetto caricato per anteprima:', foundProject.name);
        } else {
          console.log('❌ Progetto non trovato per anteprima:', params.siteId);
        }
      } catch (error) {
        console.error('Errore nel caricamento del progetto:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [user, isAdmin, params.siteId]);

  // ✅ CONTROLLO DI ACCESSO RIGOROSO: Blocca completamente l'accesso ai non paganti (tranne admin)
  if (!isAdmin && !isSubscriptionActive(user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Accesso Bloccato</h1>
          <p className="text-gray-600 mb-6">{getSubscriptionBlockReason(user)}</p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">
              <strong>I servizi sono stati sospesi</strong> a causa di problemi di pagamento. 
              Completa il pagamento per riattivare l'accesso all'anteprima.
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Torna alla Dashboard
          </button>
        </div>
      </div>
    );
  }

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
      {/* Header pulito per anteprima */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">👁️</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Anteprima: {project.name}</h1>
              <p className="text-gray-500 text-sm">Solo visualizzazione • {project.sections.length} sezioni</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => (window.location.href = '/dashboard')}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              ← Dashboard
            </button>
            <button
              onClick={() => window.close()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              ✕ Chiudi
            </button>
          </div>
        </div>
      </div>

      {/* Contenuto del sito */}
      <div className="max-w-6xl mx-auto">
        <InteractiveThemePreview
          layoutType={mockSite.layoutType}
          theme={mockSite.theme}
          sections={mockSite.pages[0].sections}
          onSectionUpdate={() => {}} // Disabilitato in anteprima
          onSectionDelete={() => {}} // Disabilitato in anteprima
          onSectionPublish={() => {}} // Disabilitato in anteprima
          onSectionUnpublish={() => {}} // Disabilitato in anteprima
          onSectionReorder={() => {}} // Disabilitato in anteprima
          className="min-h-screen"
          deviceType="desktop"
          readOnly={true} // Modalità anteprima - solo visualizzazione
        />
      </div>

      {/* Footer pulito per anteprima */}
      <div className="bg-white border-t border-gray-200 p-6 text-center mt-12">
        <div className="text-sm text-gray-500">
          <span className="inline-flex items-center space-x-2">
            <span>🏗️</span>
            <span>Realizzato con HostonHome Builder</span>
            <span>•</span>
            <span>{project.sections.length} sezioni</span>
          </span>
        </div>
      </div>
    </div>
  );
}
