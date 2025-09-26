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
  id: crypto.randomUUID(), // Genera UUID valido
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
          console.log('✅ Progetto caricato con successo:', {
            id: project.id,
            name: project.name,
            sections: project.sections,
            sectionsType: typeof project.sections,
            isArray: Array.isArray(project.sections),
            theme: project.theme,
            layoutType: project.layout_type
          });
          
          // Debug specifico per projectId
          console.log('🔍 DEBUG - projectId che verrà passato al builder:', project.id);
          
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
            console.log('📋 Sezioni caricate come array:', project.sections.length);
            sectionsToLoad = project.sections;
          } else if (project.sections && typeof project.sections === 'string') {
            try {
              console.log('📋 Parsing sezioni da stringa...');
              sectionsToLoad = JSON.parse(project.sections);
              console.log('✅ Sezioni parseate:', sectionsToLoad.length);
            } catch (e) {
              console.warn('❌ Errore nel parsing delle sezioni:', e);
              sectionsToLoad = [];
            }
          } else {
            console.log('⚠️ Nessuna sezione trovata nel progetto');
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
          
          console.log('📋 Impostando sezioni finali:', sectionsToLoad.length, sectionsToLoad);
          
                 // Debug specifico per sezioni DOMAIN_NAME
                 const domainSections = sectionsToLoad.filter(s => s.type === 'DOMAIN_NAME');
                 if (domainSections.length > 0) {
                   console.log('🔍 DEBUG - Sezioni DOMAIN_NAME trovate:', domainSections);
                   domainSections.forEach((section, index) => {
                     console.log(`🔍 DEBUG - Sezione DOMAIN_NAME ${index + 1}:`, {
                       id: section.id,
                       type: section.type,
                       props: section.props,
                       domainInputs: section.props?.domainInputs
                     });
                   });
                 } else {
                   console.log('⚠️ DEBUG - Nessuna sezione DOMAIN_NAME trovata nelle sezioni caricate');
                   
                   // Carica domini separatamente dal campo domain_names
                   try {
                     console.log('🔍 Caricamento domini separati dal campo domain_names...');
                     const domainNames = await ProjectService.getDomainNames(project.id);
                     if (domainNames.length > 0) {
                       console.log('✅ Domini trovati nel campo domain_names:', domainNames);
                       
                       // Crea una sezione DOMAIN_NAME con i domini caricati
                       const domainSection = {
                         id: 'domain-name-section',
                         type: 'DOMAIN_NAME' as const,
                         props: {
                           title: 'Scegli il tuo dominio',
                           subtitle: 'Inserisci 3 domini possibili per il tuo sito',
                           domainInputs: domainNames,
                           contactEmail: 'hostonhome@gmail.com',
                           isActive: true,
                           order: sectionsToLoad.length
                         }
                       };
                       
                       sectionsToLoad.push(domainSection);
                       console.log('✅ Sezione DOMAIN_NAME creata con domini caricati');
                     } else {
                       console.log('⚠️ Nessun dominio trovato nel campo domain_names');
                       
                       // Crea una sezione DOMAIN_NAME vuota per permettere all'utente di inserire domini
                       const domainSection = {
                         id: 'domain-name-section',
                         type: 'DOMAIN_NAME' as const,
                         props: {
                           title: 'Scegli il tuo dominio',
                           subtitle: 'Inserisci 3 domini possibili per il tuo sito',
                           domainInputs: [
                             { id: 'domain1', placeholder: 'es. ilmiobnb.it', value: '' },
                             { id: 'domain2', placeholder: 'es. ilmiobnb.com', value: '' },
                             { id: 'domain3', placeholder: 'es. ilmiobnb.eu', value: '' }
                           ],
                           contactEmail: 'hostonhome@gmail.com',
                           isActive: true,
                           order: sectionsToLoad.length
                         }
                       };
                       
                       sectionsToLoad.push(domainSection);
                       console.log('✅ Sezione DOMAIN_NAME vuota creata per inserimento domini');
                     }
                   } catch (error) {
                     console.error('❌ Errore nel caricamento domini separati:', error);
                   }
                 }
          
          setSections(sectionsToLoad);
          console.log('✅ Builder inizializzato con', sectionsToLoad.length, 'sezioni');
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
            console.log('Progetto non trovato; creo nuovo progetto nel database');
            // Crea un nuovo progetto nel database
            try {
              const newProject = await ProjectService.createProject(user?.id || 'anonymous', {
                name: 'Nuovo Progetto',
                slug: params.siteId as string,
                sections: [],
                theme: { accent: 'BLUE', font: 'INTER' },
                layout_type: 'ELEGANTE'
              });
              
              console.log('✅ Nuovo progetto creato nel database:', newProject.id);
              
              const tempSite: Site = {
                id: newProject.id,
                name: newProject.name,
                slug: newProject.slug,
                subdomain: `${newProject.slug}.hostonhome.it`,
                layoutType: 'ELEGANTE',
                theme: newProject.theme as any,
                isPublished: false,
                plan: 'PLUS',
                pages: []
              };
              
              setRealProject(newProject);
              setSite(tempSite);
              setSections([]);
            } catch (error) {
              console.error('❌ Errore nella creazione del progetto:', error);
              // Fallback a progetto temporaneo locale
              const tempId = crypto.randomUUID();
              const tempSite: Site = {
                id: tempId,
                name: 'Nuovo Progetto',
                slug: params.siteId as string,
                subdomain: `${params.siteId}.hostonhome.it`,
                layoutType: 'ELEGANTE',
                theme: { accent: 'BLUE', font: 'INTER' },
                isPublished: false,
                plan: 'PLUS',
                pages: []
              };
              console.log('🆕 Progetto temporaneo locale creato con ID:', tempId);
              setSite(tempSite);
              setSections([]);
            }
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
            // Prova a creare un nuovo progetto nel database
            try {
              const newProject = await ProjectService.createProject(user?.id || 'anonymous', {
                name: 'Nuovo Progetto',
                slug: params.siteId as string,
                sections: [],
                theme: { accent: 'BLUE', font: 'INTER' },
                layout_type: 'ELEGANTE'
              });
              
              console.log('✅ Nuovo progetto creato nel database (catch):', newProject.id);
              
              const tempSite: Site = {
                id: newProject.id,
                name: newProject.name,
                slug: newProject.slug,
                subdomain: `${newProject.slug}.hostonhome.it`,
                layoutType: 'ELEGANTE',
                theme: newProject.theme as any,
                isPublished: false,
                plan: 'PLUS',
                pages: []
              };
              
              setRealProject(newProject);
              setSite(tempSite);
              setSections([]);
            } catch (createError) {
              console.error('❌ Errore nella creazione del progetto (catch):', createError);
              setSite(mockSite);
              setSections([]);
            }
          }
        } catch {
          // Ultimo fallback
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
    }, 3000); // 3 secondi invece di 10

    fetchSite().finally(() => {
      clearTimeout(timeout);
    });

    return () => {
      clearTimeout(timeout);
    };
  }, [params.siteId]);

  const handleSectionsChange = async (newSections: Section[]) => {
    console.log('🔄 Cambio sezioni:', { 
      oldCount: sections.length, 
      newCount: newSections.length,
      newSections: newSections 
    });
    setSections(newSections);
    
    // Salvataggio automatico sempre permesso (anche in dev / piani base)
    if (realProject) {
      try {
        console.log('💾 Salvando sezioni automaticamente...', { 
          projectId: realProject.id,
          sectionsCount: newSections.length,
          sections: newSections,
          theme: site.theme
        });
        
        const result = await ProjectService.updateProject(realProject.id, {
          sections: newSections,
          theme: site.theme,
          layout_type: 'ELEGANTE'
        });
        
        console.log('✅ Sezioni salvate automaticamente!', result);
      } catch (error) {
        console.error('❌ Errore nel salvataggio automatico delle sezioni:', error);
        const errorMessage = error instanceof Error ? error.message : 
                            typeof error === 'object' ? JSON.stringify(error) : 
                            String(error);
        alert('❌ Errore nel salvataggio automatico: ' + errorMessage);
      }
    } else {
      console.log('⚠️ Nessun progetto reale per il salvataggio automatico');
    }
  };

  const handleSave = async () => {
    if (!realProject) {
      console.log('❌ Nessun progetto reale trovato per il salvataggio');
      alert('❌ Impossibile salvare: progetto non trovato');
      return;
    }
    
    try {
      // Debug specifico per sezioni DOMAIN_NAME prima del salvataggio
      const domainSections = sections.filter(s => s.type === 'DOMAIN_NAME');
      if (domainSections.length > 0) {
        console.log('🔍 DEBUG handleSave - Sezioni DOMAIN_NAME trovate:', domainSections);
        domainSections.forEach((section, index) => {
          console.log(`🔍 DEBUG handleSave - Sezione DOMAIN_NAME ${index + 1}:`, {
            id: section.id,
            domainInputs: section.props?.domainInputs
          });
        });
      } else {
        console.log('⚠️ DEBUG handleSave - Nessuna sezione DOMAIN_NAME trovata');
      }
      
      console.log('💾 Salvando manualmente...', { 
        projectId: realProject.id,
        sectionsCount: sections.length, 
        sections: sections,
        theme: site.theme,
        layoutType: 'ELEGANTE'
      });
      
      const result = await ProjectService.updateProject(realProject.id, {
        sections: sections,
        theme: site.theme,
        layout_type: 'ELEGANTE'
      });
      
      console.log('✅ Progetto salvato manualmente con successo!', result);
      
      // Feedback visivo migliorato
      const saveButton = document.querySelector('[data-save-button]') as HTMLElement;
      if (saveButton) {
        const originalText = saveButton.textContent;
        saveButton.textContent = '✅ Salvato!';
        saveButton.style.backgroundColor = '#10b981';
        saveButton.style.color = 'white';
        
        setTimeout(() => {
          saveButton.textContent = originalText;
          saveButton.style.backgroundColor = '';
          saveButton.style.color = '';
        }, 2000);
      } else {
        alert('✅ Progetto salvato con successo!');
      }
    } catch (error) {
      console.error('❌ Errore nel salvataggio manuale:', error);
      const errorMessage = error instanceof Error ? error.message : 
                          typeof error === 'object' ? JSON.stringify(error) : 
                          String(error);
      alert('❌ Errore nel salvataggio del progetto: ' + errorMessage);
    }
  };

  const handleThemeChange = (newTheme: { accent: string; font: string }) => {
    console.log('🎨 handleThemeChange nel componente padre:', newTheme);
    console.log('🎨 Tema precedente nel sito:', site.theme);
    
    // Aggiorna il tema nel sito
    setSite(prevSite => ({
      ...prevSite,
      theme: newTheme
    }));
    
    console.log('🎨 Tema aggiornato nel sito:', newTheme);
  };

  const handlePublish = async () => {
    try {
      // ✅ CONTROLLO RIGOROSO: Solo utenti con abbonamento attivo o in trial possono pubblicare
      if (!isSubscriptionActive(user)) {
        alert(`❌ PUBBLICAZIONE BLOCCATA\n\n${getSubscriptionBlockReason(user)}\n\nCompleta il pagamento per pubblicare il tuo sito.`);
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

  // ✅ CONTROLLO DI ACCESSO RIGOROSO: Blocca completamente l'accesso ai non paganti
  if (!isSubscriptionActive(user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Accesso Bloccato</h1>
          <p className="text-gray-600 mb-6">{getSubscriptionBlockReason(user)}</p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">
              <strong>I servizi sono stati sospesi</strong> a causa di problemi di pagamento. 
              Completa il pagamento per riattivare l'accesso al builder.
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
      {/* Builder full screen - UI semplificata */}
      <ElementorStyleBuilder
        site={site}
        sections={sections}
        onSectionsChange={handleSectionsChange}
        onThemeChange={handleThemeChange}
        onSave={handleSave}
        onPublish={handlePublish}
        maxSections={getPlanLimits().maxSections}
        projectId={realProject?.id}
      />
    </div>
  );
}
