'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ElementorStyleBuilder } from '@/components/builder/ElementorStyleBuilder';
import { Site, Section } from '@/types';
import { getDefaultSectionsForTemplate, getTemplatesByLayoutType } from '@/templates/layouts';
import { ProjectService } from '@/lib/projects';
import { useAuth } from '@/components/auth/AuthProvider';
import { isSubscriptionActive, getSubscriptionBlockReason } from '@/lib/subscription';

// Titolo e descrizione della pagina (non esportabili con 'use client')
const pageTitle = 'Builder Case Vacanze - HostonHome';
const pageDescription = 'Crea il tuo sito per hotel, B&B o case vacanze con il nostro builder professionale';

const mockSite: Site = {
  id: 'site-1',
  name: 'San Vito Suites',
  slug: 'san-vito-suites',
  subdomain: 'san-vito-suites.tuodominio.it',
  layoutType: 'ELEGANTE',
  theme: { accent: 'BLUE', font: 'INTER' },
  isPublished: true,
  plan: 'PLUS',
  pages: [
    {
      id: 'page-1',
      path: '/',
      isHome: true,
      seoTitle: 'San Vito Suites - Camere accoglienti nel cuore di Roma',
      seoDesc: 'Soggiorna nel cuore di Roma, a pochi passi dalla stazione Termini. Camere moderne con WiFi gratuito, aria condizionata e bagno privato.',
      sections: [
        {
          id: 'section-1',
          type: 'HERO',
          props: {
            isActive: true,
            order: 0,
            title: 'San Vito Suites',
            subtitle: 'Camere accoglienti e moderne',
            ctaText: 'Scopri',
            ctaUrl: '#alloggi'
          }
        },
        {
          id: 'section-2',
          type: 'ABOUT',
          props: {
            isActive: true,
            order: 1,
            title: 'Vivi Roma come un vero local',
            content: 'Nel cuore di Roma, a pochi passi dalla stazione Termini e a soli 350 metri dalla fermata metro Vittorio Emanuele, il San Vito Suites è il punto di partenza perfetto per vivere la Capitale in totale comodità.'
          }
        },
        {
          id: 'section-3',
          type: 'SERVICES',
          props: {
            isActive: true,
            order: 2,
            title: 'Alloggi',
            services: [
              {
                title: 'Camera Matrimoniale con Letto Supplementare',
                description: 'Spaziosa e ideale per famiglie, amici o chi desidera più spazio, questa camera dispone di un letto matrimoniale large e un letto singolo.',
                icon: '🛏️',
                guests: '3',
                size: '22m²',
                price: '120'
              },
              {
                title: 'Camera Matrimoniale con Balcone',
                description: 'Ideale per coppie in cerca di comfort e relax, questa camera offre un letto matrimoniale comodo e un balcone arredato.',
                icon: '🌅',
                guests: '2',
                size: '18m²',
                price: '100'
              },
              {
                title: 'Camera Matrimoniale',
                description: 'Accogliente e funzionale, questa camera matrimoniale è la scelta perfetta per chi desidera soggiornare nel cuore di Roma.',
                icon: '🏠',
                guests: '2',
                size: '22m²',
                price: '95'
              }
            ]
          }
        },
        {
          id: 'section-4',
          type: 'GALLERY',
          props: {
            isActive: true,
            order: 3,
            title: 'Scopri Roma',
            activities: [
              {
                title: 'Tour in golf cart: il meglio di Roma di notte',
                description: 'Roma di notte in golf cart – Tour privato tra luci e monumenti illuminati per scoprire la città da una prospettiva unica.',
                icon: '🌙',
                price: 'Gratis'
              },
              {
                title: 'Da Roma: Escursione di un giorno a Pompei, Costiera Amalfitana e Sorrento',
                description: 'Da Roma a Pompei & Costiera Amalfitana – Tour guidato indimenticabile tra storia e bellezza.',
                icon: '🌋',
                price: '€10'
              },
              {
                title: 'Roma: biglietti con ingresso prioritario al Pantheon + app interattiva',
                description: 'Visita il Pantheon, simbolo eterno di Roma. Entra in uno dei monumenti più imponenti della storia.',
                icon: '🏛️',
                price: 'Gratis'
              }
            ]
          }
        },
        {
          id: 'section-5',
          type: 'TESTIMONIALS',
          props: {
            isActive: true,
            order: 4,
            title: 'Recensioni',
            testimonials: [
              {
                name: 'Matteo',
                content: 'Camera davvero confortevole ed elegante, host super disponibile e gentile. Posizione strategica e centrale con vicino la fermata della metro e a pochissimi minuti a piedi dalla stazione di Roma Termini.',
                avatar: '👨‍💼'
              },
              {
                name: 'Gabriella',
                content: 'Posizione ottima per chi vuole andare al Brancaccio, ottima accoglienza e pulizia. Giusta grandezza di camera e bagno.',
                avatar: '👩‍💼'
              },
              {
                name: 'Francesca',
                content: 'Stanza spaziosa e confortevole, con affaccio caratteristico su chiesa e Arco di Gallieno. A due passi da piazza Vittorio e dalla metro.',
                avatar: '👩‍💼'
              }
            ]
          }
        },
        {
          id: 'section-6',
          type: 'CONTACT',
          props: {
            isActive: true,
            order: 5,
            title: 'Contattaci',
            email: 'info@sanvitosuites.it',
            phone: '+39 06 123 4567'
          }
        }
      ]
    },
  ],
};

export default function BuilderPage() {
  const params = useParams();
  const { user } = useAuth();
  const [site, setSite] = useState<Site>(mockSite);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [realProject, setRealProject] = useState<any>(null);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        console.log('Caricando progetto con ID:', params.siteId);
        // Carica il progetto reale dal database tramite ID
        let project = await ProjectService.getProject(params.siteId as string);
        
        if (project) {
          console.log('Progetto caricato:', project);
          console.log('Dettagli progetto - sections:', project.sections);
          console.log('Tipo sections:', typeof project.sections);
          console.log('Array sections?', Array.isArray(project.sections));
          
          setRealProject(project);
          
          // Converte il progetto nel formato Site
          const siteData: Site = {
            id: project.id,
            name: project.name,
            slug: project.slug,
            subdomain: `${project.slug}.tuodominio.it`,
            layoutType: 'ELEGANTE',
            theme: project.theme as any,
            isPublished: true,
            plan: 'PLUS',
            pages: []
          };
          
          setSite(siteData);
          
          // Gestione delle sezioni con fallback
          let sectionsToLoad = [];
          if (project.sections && Array.isArray(project.sections)) {
            sectionsToLoad = project.sections;
          } else if (project.sections && typeof project.sections === 'string') {
            try {
              sectionsToLoad = JSON.parse(project.sections);
            } catch (e) {
              console.warn('Errore nel parsing delle sezioni:', e);
              sectionsToLoad = [];
            }
          }
          
          // Se non ci sono sezioni, aggiungi delle sezioni di base per aiutare l'utente
          if (sectionsToLoad.length === 0) {
            console.log('Nessuna sezione trovata, aggiungendo sezioni di base...');
            sectionsToLoad = [
              {
                id: 'hero-default',
                type: 'HERO',
                props: {
                  title: project.name || 'Benvenuto',
                  subtitle: 'Inizia a personalizzare il tuo sito aggiungendo contenuti',
                  ctaText: 'Scopri di più',
                  isActive: true,
                  order: 0
                }
              },
              {
                id: 'about-default', 
                type: 'ABOUT',
                props: {
                  title: 'Chi Siamo',
                  content: 'Aggiungi qui la descrizione della tua struttura...',
                  isActive: true,
                  order: 1
                }
              }
            ];
          }
          
          setSections(sectionsToLoad);
          console.log('Sezioni caricate nel builder:', sectionsToLoad.length);
          console.log('Prima sezione (se esiste):', sectionsToLoad[0]);
        } else {
          // Se non trovato per ID, prova per slug (molti link storici usano lo slug)
          const bySlug = await ProjectService.getProjectBySlug(params.siteId as string);
          if (bySlug) {
            setRealProject(bySlug as any);
            const siteData: Site = {
              id: bySlug.id,
              name: bySlug.name,
              slug: bySlug.slug,
              subdomain: `${bySlug.slug}.tuodominio.it`,
              layoutType: 'ELEGANTE',
              theme: bySlug.theme as any,
              isPublished: true,
              plan: 'PLUS',
              pages: []
            };
            setSite(siteData);
            const sectionsToLoad = Array.isArray(bySlug.sections) ? bySlug.sections : [];
            setSections(sectionsToLoad);
          } else {
            console.log('Progetto non trovato; inizializzo progetto temporaneo');
            const tempSite: Site = {
              id: params.siteId as string,
              name: 'Nuovo Progetto',
              slug: params.siteId as string,
              subdomain: `${params.siteId}.hostonhome.it`,
              layoutType: 'ELEGANTE',
              theme: { accent: 'BLUE', font: 'INTER' },
              isPublished: false,
              plan: 'PLUS',
              pages: []
            };
            setSite(tempSite);
            setSections([]);
          }
        }
        
      } catch (error) {
        console.error('Error fetching project:', error);
        // Prova anche per slug (nel caso l'URL avesse slug per errore)
        try {
          const bySlug = await ProjectService.getProjectBySlug(params.siteId as string);
          if (bySlug) {
            const siteData: Site = {
              id: bySlug.id,
              name: bySlug.name,
              slug: bySlug.slug,
              subdomain: `${bySlug.slug}.tuodominio.it`,
              layoutType: 'ELEGANTE',
              theme: bySlug.theme as any,
              isPublished: true,
              plan: 'PLUS',
              pages: []
            };
            setSite(siteData);
            const sectionsToLoad = Array.isArray(bySlug.sections) ? bySlug.sections : [];
            setSections(sectionsToLoad);
          } else {
            setSite(mockSite);
            setSections([]);
          }
        } catch {
          setSite(mockSite);
          setSections([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Timeout per evitare caricamenti infiniti
    const timeout = setTimeout(() => {
      console.warn('Timeout nel caricamento, procedendo con fallback');
      setIsLoading(false);
    }, 10000); // 10 secondi

    fetchSite().finally(() => {
      clearTimeout(timeout);
    });

    return () => {
      clearTimeout(timeout);
    };
  }, [params.siteId]);

  const handleSectionsChange = async (newSections: Section[]) => {
    setSections(newSections);
    
    // Salvataggio automatico sempre permesso (anche in dev / piani base)
    if (realProject) {
      try {
        console.log('Salvando sezioni automaticamente...', newSections.length);
        await ProjectService.updateProject(realProject.id, {
          sections: newSections,
          theme: site.theme,
          layout_type: 'ELEGANTE'
        });
        console.log('✅ Sezioni salvate automaticamente!');
      } catch (error) {
        console.error('❌ Errore nel salvataggio automatico:', error);
      }
    }
  };

  const handleSave = async () => {
    if (!realProject) {
      console.log('Nessun progetto reale trovato per il salvataggio');
      return;
    }
    
    try {
      console.log('Salvando manualmente...', sections.length, 'sezioni');
      await ProjectService.updateProject(realProject.id, {
        sections: sections,
        theme: site.theme,
        layout_type: 'ELEGANTE'
      });
      console.log('✅ Progetto salvato con successo!');
      alert('✅ Progetto salvato con successo!');
    } catch (error) {
      console.error('❌ Errore nel salvataggio:', error);
      alert('❌ Errore nel salvataggio del progetto');
    }
  };

  const handlePublish = async () => {
    try {
      if (!isSubscriptionActive(user)) {
        alert(getSubscriptionBlockReason(user));
        return;
      }
      // TODO: Publish site via API
      console.log('Publishing site:', site.id);
      // await fetch(`/api/sites/${params.siteId}/publish`, { method: 'POST' });
    } catch (error) {
      console.error('Error publishing site:', error);
    }
  };

  const getPlanLimits = () => {
    switch (site.plan) {
      case 'BASE':
        return { maxSections: 5, maxImages: 5, maxPages: 1 };
      case 'PLUS':
        return { maxSections: 12, maxImages: 24, maxPages: 3 };
      case 'PRO':
        return { maxSections: 999, maxImages: 999, maxPages: 999 };
      default:
        return { maxSections: 5, maxImages: 5, maxPages: 1 };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-50 overflow-hidden">
      {/* Barra rapida: Torna alla Dashboard - Solo desktop */}
      <div className="hidden md:block fixed top-5 left-5 z-40">
        <button
          onClick={() => (window.location.href = '/dashboard')}
          className="px-3 py-2 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-md text-sm"
          title="Torna alla Dashboard"
        >
          ← Dashboard
        </button>
      </div>
      {/* Builder full screen - UI semplificata */}
      <ElementorStyleBuilder
        site={site}
        sections={sections}
        onSectionsChange={handleSectionsChange}
        onSave={handleSave}
        onPublish={handlePublish}
        maxSections={getPlanLimits().maxSections}
      />
    </div>
  );
}
