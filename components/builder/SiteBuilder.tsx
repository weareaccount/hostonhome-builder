'use client';

import React, { useState, useCallback, useEffect, Fragment } from 'react';
import { DndContext, DragEndEvent, closestCenter, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { SectionType, Section, ThemeConfig } from '@/types';
import { SectionList } from './SectionList';
import { SectionForm } from './SectionForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Eye, Globe, Undo, Redo, Plus, Settings, Palette } from 'lucide-react';

interface SiteBuilderProps {
  site: {
    id: string;
    name: string;
    theme: ThemeConfig;
    layoutType: string;
  };
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
  onSave: () => void;
  onPublish: () => void;
  maxSections: number;
  className?: string;
}

// Sortable Section Component con migliore UX e controlli di spostamento
const SortableSection: React.FC<{
  section: Section;
  isSelected: boolean;
  onSelect: (sectionId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  children: React.ReactNode;
}> = ({ section, isSelected, onSelect, onMoveUp, onMoveDown, canMoveUp, canMoveDown, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getSectionIcon = (type: SectionType) => {
    switch (type) {
      case 'HERO': return '🏠';
      case 'ABOUT': return 'ℹ️';
      case 'SERVICES': return '⚡';
      case 'GALLERY': return '🖼️';
      case 'TESTIMONIALS': return '💬';
      case 'CONTACT': return '📞';
      default: return '📄';
    }
  };

  const getSectionName = (type: SectionType) => {
    switch (type) {
      case 'HERO': return 'Hero';
      case 'ABOUT': return 'Chi Siamo';
      case 'SERVICES': return 'Servizi';
      case 'GALLERY': return 'Galleria';
      case 'TESTIMONIALS': return 'Testimonianze';
      case 'CONTACT': return 'Contatti';
      default: return type;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group cursor-pointer transition-all duration-300 rounded-xl border-2 shadow-lg hover:shadow-2xl',
        isSelected 
          ? 'ring-4 ring-accent ring-offset-4 border-accent/60 bg-accent/5' 
          : 'border-transparent hover:border-accent/40 bg-background/80 hover:bg-background',
        isDragging && 'opacity-80 rotate-3 scale-110 shadow-3xl z-50 border-accent/80'
      )}
      onClick={() => onSelect(section.id)}
    >
      {/* Drag Handle Completamente Ridisegnato e Sempre Visibile */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-4 left-4 w-12 h-12 bg-gradient-to-br from-accent/90 to-accent/70 border-2 border-white rounded-xl opacity-100 transition-all duration-300 cursor-grab active:cursor-grabbing z-20 flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 group-hover:scale-125"
      >
        <div className="w-6 h-6 text-white font-bold text-lg">⋮⋮</div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full border border-accent/50 flex items-center justify-center">
          <span className="text-xs text-accent font-bold">↕️</span>
        </div>
      </div>

      {/* Section Header - CON HOVER INTUITIVO per SPOSTAMENTO */}
      <div className="absolute top-4 right-4 bg-gradient-to-r from-white/95 to-white/90 border-2 border-blue-200 rounded-xl px-4 py-2 opacity-100 transition-all duration-300 z-20 shadow-lg backdrop-blur-sm hover:shadow-xl hover:scale-105">
        <div className="flex items-center space-x-3">
          <span className="text-lg">{getSectionIcon(section.type)}</span>
          <span className="text-sm font-bold text-blue-800">
            {getSectionName(section.type)}
          </span>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
        
        {/* Quick Actions con HOVER INTUITIVO */}
        <div className="mt-2 flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            className="w-6 h-6 p-0 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold hover:scale-110 transition-transform duration-200"
            onClick={(e) => {
              e.stopPropagation();
              console.log('✏️ Quick Edit per sezione:', section.id);
              onSelect(section.id);
            }}
            title="Modifica Rapida"
          >
            ✏️
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            className="w-6 h-6 p-0 bg-green-500 hover:bg-green-600 text-white text-xs font-bold hover:scale-110 transition-transform duration-200"
            onClick={(e) => {
              e.stopPropagation();
              console.log('📝 Duplica sezione:', section.id);
              // Qui implementerò la duplicazione
            }}
            title="Duplica Sezione"
          >
            📋
          </Button>
        </div>
      </div>
      
      {/* HOVER ZONE per SPOSTAMENTO INTUITIVO - SEMPRE VISIBILE */}
      <div 
        className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-blue-100/50 to-transparent opacity-0 hover:opacity-100 transition-all duration-300 cursor-move z-10"
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.cursor = 'move';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0';
          e.currentTarget.style.cursor = 'default';
        }}
        title="Hover qui per spostare la sezione"
      >
        <div className="flex items-center justify-center h-full">
          <div className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
            🖱️ Hover per Spostare
          </div>
        </div>
      </div>
      
      {/* DRAG HANDLE INTUITIVO per SPOSTAMENTO */}
      <div 
        className="absolute top-2 left-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center cursor-move opacity-0 hover:opacity-100 transition-all duration-300 z-20 shadow-lg hover:shadow-xl hover:scale-110"
        title="Trascina per spostare la sezione"
        onMouseDown={(e) => {
          e.stopPropagation();
          console.log('🎯 Drag handle attivato per sezione:', section.id);
          // Qui implementerò il drag & drop per spostamento
        }}
      >
        <span className="text-white text-sm">↕️</span>
      </div>

      {/* Section Content */}
      <div className="relative">
        {children}
        
        {/* Section Overlay migliorato */}
        <div className={cn(
          "absolute inset-0 rounded-lg transition-all duration-200 pointer-events-none",
          isSelected 
            ? "bg-accent/10 ring-2 ring-accent/30" 
            : "bg-transparent group-hover:bg-accent/5"
        )} />
      </div>

      {/* Section Actions - Commentate per evitare conflitti */}
      {/* 
      <div className="absolute bottom-4 right-4 opacity-100 transition-all duration-300 z-20">
        <div className="flex space-x-2">
          Controlli di spostamento spostati nel contenuto principale
        </div>
      </div>
      */}

      {/* Section Content Preview */}
      <div className="p-8 pt-20">
        {/* Header della Sezione con Controlli SEMPLICI */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 mb-4 shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-xl font-bold">{getSectionIcon(section.type)}</span>
              </div>
              <div>
                <span className="font-bold text-gray-800 text-lg">{getSectionName(section.type)}</span>
                <p className="text-sm text-gray-600">Clicca per modificare • Usa i controlli per spostare</p>
              </div>
            </div>
            
            {/* Controlli di Spostamento SEMPLICI e INTUITIVI */}
            <div className="flex space-x-2">
              {/* Pulsante Sposta SU - SEMPLICE */}
              <button
                disabled={!canMoveUp}
                className={cn(
                  "w-10 h-10 rounded-lg border-2 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center text-lg font-bold",
                  canMoveUp 
                    ? "bg-green-500 hover:bg-green-600 text-white hover:scale-105 border-green-600" 
                    : "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('🚀 SPOSTA SU per sezione:', section.id);
                  if (onMoveUp) {
                    onMoveUp();
                  }
                }}
                title="⬆️ Sposta SU"
              >
                ⬆️
              </button>
              
              {/* Pulsante Sposta GIÙ - SEMPLICE */}
              <button
                disabled={!canMoveDown}
                className={cn(
                  "w-10 h-10 rounded-lg border-2 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center text-lg font-bold",
                  canMoveDown 
                    ? "bg-blue-500 hover:bg-blue-600 text-white hover:scale-105 border-blue-600" 
                    : "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('🚀 SPOSTA GIÙ per sezione:', section.id);
                  if (onMoveDown) {
                    onMoveDown();
                  }
                }}
                title="⬇️ Sposta GIÙ"
              >
                ⬇️
              </button>
              
              {/* Pulsante Modifica - SEMPLICE */}
              <button
                className="w-10 h-10 rounded-lg border-2 border-purple-500 bg-purple-500 hover:bg-purple-600 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center text-lg font-bold"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('✏️ MODIFICA sezione:', section.id);
                  onSelect(section.id);
                }}
                title="✏️ Modifica"
              >
                ✏️
              </button>
            </div>
          </div>
        </div>
        
        {children}
      </div>
    </div>
  );
};

export const SiteBuilder: React.FC<SiteBuilderProps> = ({
  site,
  sections,
  onSectionsChange,
  onSave,
  onPublish,
  maxSections,
  className,
}) => {
  // Helper functions per icone e nomi delle sezioni
  const getSectionIcon = (type: SectionType) => {
    switch (type) {
      case 'HERO': return '🏠';
      case 'ABOUT': return 'ℹ️';
      case 'SERVICES': return '⚡';
      case 'GALLERY': return '🖼️';
      case 'TESTIMONIALS': return '💬';
      case 'CONTACT': return '📞';
      default: return '📄';
    }
  };

  // Funzioni per Drag & Drop dalla Sidebar
  const handleDragStart = (e: React.DragEvent, sectionType: SectionType) => {
    console.log('🚀 DRAG START dalla sidebar per:', sectionType);
    setIsDraggingFromSidebar(true);
    setDraggedSectionType(sectionType);
    e.dataTransfer.setData('text/plain', sectionType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (isDraggingFromSidebar) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    if (isDraggingFromSidebar && draggedSectionType) {
      e.preventDefault();
      console.log('🎯 DROP dalla sidebar a posizione:', index, 'per sezione:', draggedSectionType);
      
      // Crea una nuova sezione
      const newSection: Section = {
        id: `${draggedSectionType.toLowerCase()}-${Date.now()}`,
        type: draggedSectionType,
        props: getDefaultPropsForSection(draggedSectionType),
        order: index
      };

      // Inserisci la sezione alla posizione specificata
      const newSections = [...sections];
      newSections.splice(index, 0, newSection);
      
      // Aggiorna l'ordine di tutte le sezioni
      const updatedSections = newSections.map((section, idx) => ({
        ...section,
        order: idx
      }));

      console.log('✅ Nuove sezioni dopo drop:', updatedSections);
      onSectionsChange(updatedSections);
      
      // Reset dello stato
      setIsDraggingFromSidebar(false);
      setDraggedSectionType(null);
      setDragOverIndex(null);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  // Funzione per ottenere le props di default per ogni tipo di sezione
  const getDefaultPropsForSection = (type: SectionType) => {
    switch (type) {
      case 'HERO':
        return {
          title: 'Benvenuto a San Vito Suites',
          subtitle: 'Il tuo soggiorno perfetto a Roma',
          ctaText: 'Prenota Ora',
          ctaLink: '#prenotazione',
          backgroundImage: '/images/hero-bg.jpg'
        };
      case 'ABOUT':
        return {
          title: 'Chi Siamo',
          description: 'San Vito Suites offre un\'esperienza unica nel cuore di Roma, combinando comfort moderno con il fascino storico della città eterna.',
          features: ['WiFi gratuito', 'Colazione inclusa', 'Posizione centrale', 'Servizio 24/7']
        };
      case 'SERVICES':
        return {
          title: 'I Nostri Servizi',
          services: [
            { name: 'Camere Eleganti', description: 'Camere moderne e confortevoli', icon: '🛏️' },
            { name: 'WiFi Gratuito', description: 'Connessione veloce in tutta la struttura', icon: '📶' },
            { name: 'Colazione', description: 'Colazione continentale inclusa', icon: '☕' }
          ]
        };
      case 'GALLERY':
        return {
          title: 'Galleria Foto',
          images: [
            '/images/room-1.jpg',
            '/images/room-2.jpg',
            '/images/room-3.jpg'
          ]
        };
      case 'TESTIMONIALS':
        return {
          title: 'Cosa Dicono i Nostri Ospiti',
          testimonials: [
            { name: 'Marco R.', text: 'Soggiorno perfetto, posizione ideale!', rating: 5 },
            { name: 'Anna S.', text: 'Personale gentilissimo e camere pulite', rating: 5 }
          ]
        };
      case 'CONTACT':
        return {
          title: 'Contattaci',
          email: 'info@sanvitosuites.it',
          phone: '+39 06 123 4567',
          address: 'Via San Vito, 123 - Roma'
        };
      default:
        return {};
    }
  };

  const getSectionName = (type: SectionType) => {
    switch (type) {
      case 'HERO': return 'Hero';
      case 'ABOUT': return 'Chi Siamo';
      case 'SERVICES': return 'Servizi';
      case 'GALLERY': return 'Galleria';
      case 'TESTIMONIALS': return 'Testimonianze';
      case 'CONTACT': return 'Contatti';
      default: return type;
    }
  };
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedSection, setDraggedSection] = useState<Section | null>(null);
  const [isDraggingFromSidebar, setIsDraggingFromSidebar] = useState(false);

  // Auto-save effect
  useEffect(() => {
    const interval = setInterval(() => {
      onSave();
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [onSave]);

  // Global drag listeners per tracciare drag dalla sidebar - MIGLIORATO
  useEffect(() => {
    const handleDragStart = (e: DragEvent) => {
      console.log('Drag start detected:', e.dataTransfer?.getData('text/plain'));
      if (e.dataTransfer?.getData('text/plain')) {
        setIsDraggingFromSidebar(true);
        console.log('Setting isDraggingFromSidebar to true');
      }
    };

    const handleDragEnd = () => {
      console.log('Drag end detected');
      setIsDraggingFromSidebar(false);
    };

    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);

    return () => {
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('dragend', handleDragEnd);
    };
  }, []);

  // Drag and Drop handlers migliorati
  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    const section = sections.find(s => s.id === event.active.id);
    setDraggedSection(section || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    setDraggedSection(null);
    
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newSections = arrayMove(sections, oldIndex, newIndex);
        onSectionsChange(newSections);
      }
    }
  };

  // Section management
  const handleSectionToggle = useCallback((sectionId: string, isActive: boolean) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId ? { ...section, isActive } : section
    );
    onSectionsChange(updatedSections);
  }, [sections, onSectionsChange]);

  const handleAddSection = (type: SectionType) => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      type,
      props: getDefaultPropsForSection(type) as any,
    };
    
    const updatedSections = [...sections, newSection];
    onSectionsChange(updatedSections);
    setSelectedSectionId(newSection.id); // Auto-select new section
  };

  const handleSectionUpdate = useCallback((sectionId: string, props: any) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId ? { ...section, props: { ...section.props, ...props } } : section
    );
    onSectionsChange(updatedSections);
  }, [sections, onSectionsChange]);

  const handleSectionDelete = useCallback((sectionId: string) => {
    const updatedSections = sections.filter(section => section.id !== sectionId);
    onSectionsChange(updatedSections);
    setSelectedSectionId(null);
  }, [sections, onSectionsChange]);

  const handleMoveSection = useCallback((sectionId: string, direction: 'up' | 'down') => {
    console.log('=== 🚀 HANDLE MOVE SECTION CHIAMATO ===');
    console.log('📋 Section ID:', sectionId);
    console.log('📋 Direction:', direction);
    console.log('📋 Sections attuali:', sections.map(s => ({ id: s.id, type: s.type, order: s.props?.order })));
    
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    console.log('📋 Indice corrente:', currentIndex);
    console.log('📋 Totale sezioni:', sections.length);
    
    if (currentIndex === -1) {
      console.log('❌ ERRORE: Sezione non trovata');
      return;
    }

    let newIndex: number;
    if (direction === 'up' && currentIndex > 0) {
      newIndex = currentIndex - 1;
      console.log('⬆️ Sposto SU da indice', currentIndex, 'a', newIndex);
    } else if (direction === 'down' && currentIndex < sections.length - 1) {
      newIndex = currentIndex + 1;
      console.log('⬇️ Sposto GIÙ da indice', currentIndex, 'a', newIndex);
    } else {
      console.log('❌ ERRORE: Non posso spostare in questa direzione');
      console.log('❌ Direction:', direction, 'Indice corrente:', currentIndex, 'Totale sezioni:', sections.length);
      return;
    }

    // Creo una copia profonda delle sezioni
    const newSections = sections.map(section => ({
      ...section,
      props: {
        ...section.props,
        order: section.props?.order || 0
      }
    }));
    
    // Sposto la sezione usando splice per maggiore affidabilità
    const [movedSection] = newSections.splice(currentIndex, 1);
    newSections.splice(newIndex, 0, movedSection);
    
    // Aggiorno l'ordine di tutte le sezioni
    newSections.forEach((section, index) => {
      section.props.order = index;
    });
    
    console.log('🔄 Nuove sezioni dopo spostamento:', newSections.map(s => ({ id: s.id, type: s.type, order: s.props.order })));
    console.log('📞 Chiamando onSectionsChange...');
    
    // Applico le modifiche
    onSectionsChange(newSections);
    
    // Forzo il re-render per assicurarmi che le modifiche siano visibili
    setTimeout(() => {
      console.log('🔄 Forzando re-render dopo spostamento');
      onSectionsChange([...newSections]);
    }, 100);
    
    console.log('✅ SUCCESSO: Spostamento completato!');
  }, [sections, onSectionsChange]);

  // Test diretto per verificare che la funzione funzioni
  const testMoveSection = () => {
    console.log('🧪 TEST: Chiamata diretta a handleMoveSection');
    if (sections.length > 1) {
      handleMoveSection(sections[0].id, 'down');
    }
  };

  const handleSectionReorder = useCallback((reorderedSections: Section[]) => {
    console.log('🔄 HANDLE SECTION REORDER chiamato');
    console.log('📋 Sezioni riordinate:', reorderedSections.map(s => ({ id: s.id, type: s.type })));
    onSectionsChange(reorderedSections);
  }, [onSectionsChange]);

  const selectedSection = sections.find(s => s.id === selectedSectionId);

  const availableSections: SectionType[] = ['HERO', 'ABOUT', 'SERVICES', 'GALLERY', 'TESTIMONIALS', 'CONTACT'];

  return (
    <div className={cn('flex h-screen bg-background', className)}>
      {/* Left Sidebar - Section List migliorata */}
      <SectionList
        sections={sections}
        onSectionToggle={handleSectionToggle}
        onSectionReorder={handleSectionReorder}
        onAddSection={handleAddSection}
        availableSections={availableSections}
        maxSections={maxSections}
        layoutType={layoutType}
      />

      {/* Center - Builder Canvas migliorato */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar Completamente Ridisegnata */}
        <div className="h-20 border-b border-border bg-gradient-to-r from-background via-background to-muted/10 px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/70 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🏠</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{site.name}</h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="px-3 py-1 bg-accent/20 text-accent text-sm font-semibold rounded-full border border-accent/30">
                    🎨 Builder Attivo
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">
                    ✅ {sections.length} sezioni attive
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                    🎯 {maxSections - sections.length} disponibili
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={onSave} className="border-green-300 text-green-700 hover:bg-green-50">
              <Save className="w-4 h-4 mr-2" />
              💾 Salva
            </Button>
            <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">
              <Eye className="w-4 h-4 mr-2" />
              👁️ Anteprima
            </Button>
            <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-50">
              <Undo className="w-4 h-4 mr-2" />
              ↩️ Annulla
            </Button>
            <Button variant="outline" size="sm" className="border-purple-300 text-purple-700 hover:bg-purple-50">
              <Redo className="w-4 h-4 mr-2" />
              ↪️ Ripeti
            </Button>
            <Button onClick={onPublish} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg">
              <Globe className="w-4 h-4 mr-2" />
              🚀 Pubblica
            </Button>
            
            {/* Pulsante di Test per Spostamento */}
            <Button 
              onClick={testMoveSection} 
              className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg"
            >
              🧪 Test Spostamento
            </Button>
            
            {/* Pulsante di Debug */}
            <Button 
              onClick={() => {
                console.log('🧪 DEBUG: Stato attuale delle sezioni');
                console.log('📋 Sections:', sections);
                console.log('📋 Selected ID:', selectedSectionId);
                console.log('📋 Available Sections:', availableSections);
              }}
              className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-lg"
            >
              🐛 Debug
            </Button>
          </div>
        </div>

        {/* Canvas con Drop Zone FUNZIONANTE e ROBUSTA */}
        <div 
          className="flex-1 overflow-auto p-6 bg-gradient-to-br from-muted/10 via-background to-muted/5"
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            console.log('🔄 Drag over sul canvas principale');
          }}
          onDrop={(e) => {
            e.preventDefault();
            const sectionType = e.dataTransfer.getData('text/plain') as SectionType;
            console.log('=== 🎯 DROP SUL CANVAS PRINCIPALE ===');
            console.log('📋 Section Type ricevuto:', sectionType);
            
            if (sectionType && availableSections.includes(sectionType)) {
              console.log('✅ SUCCESSO: Aggiungo sezione alla fine:', sectionType);
              handleDrop(e, sections.length);
            } else {
              console.log('❌ ERRORE: Drop non valido');
              console.log('❌ SectionType:', sectionType);
              console.log('❌ AvailableSections:', availableSections);
            }
          }}
        >
          <DndContext
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="max-w-full mx-auto space-y-8 px-4">
                {sections.length === 0 ? (
                  <Card className="border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 via-white to-purple-50 shadow-2xl">
                    <CardContent className="py-20 text-center">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl">
                        <span className="text-5xl">🎨</span>
                      </div>
                      <h3 className="text-3xl font-bold mb-4 text-gray-800">Inizia a Creare il Tuo Sito!</h3>
                      
                      {/* ISTRUZIONI SEMPLICI e CHIARE */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 max-w-lg mx-auto mb-8 shadow-lg">
                        <h4 className="font-bold text-blue-800 mb-3 text-lg">🚀 COME INIZIARE:</h4>
                        <div className="space-y-3 text-left">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                            <span className="text-blue-700"><strong>Clicca</strong> su un widget nella barra sinistra per aggiungerlo</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                            <span className="text-blue-700"><strong>Trascina</strong> i widget per posizionarli dove vuoi</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                            <span className="text-blue-700"><strong>Usa i controlli</strong> ⬆️⬇️ per spostare le sezioni</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Drop Zone FUNZIONANTE */}
                      <div 
                        className="p-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl border-2 border-dashed border-blue-400 mb-8 shadow-lg hover:bg-blue-200 transition-all duration-300 cursor-pointer"
                        onDragOver={(e) => handleDragOver(e, 0)}
                        onDrop={(e) => handleDrop(e, 0)}
                        onDragLeave={handleDragLeave}
                      >
                        <div className="flex items-center justify-center space-x-3 mb-3">
                          <span className="text-2xl">⬇️</span>
                          <span className="text-lg font-bold text-blue-800">Zona di Drop</span>
                          <span className="text-2xl">⬇️</span>
                        </div>
                        <p className="text-blue-700 font-medium">
                          Trascina qui le sezioni per aggiungerle al tuo sito
                        </p>
                      </div>
                      
                      {/* Bottoni Rapidi Semplificati */}
                      <div className="flex flex-wrap gap-4 justify-center">
                        <Button onClick={() => handleAddSection('HERO')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 px-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                          🏠 Hero
                        </Button>
                        <Button onClick={() => handleAddSection('ABOUT')} variant="outline" className="border-2 border-gray-300 hover:border-blue-400 h-12 px-6 text-base font-semibold hover:bg-blue-50 transition-all duration-300">
                          ℹ️ Chi Siamo
                        </Button>
                        <Button onClick={() => handleAddSection('SERVICES')} variant="outline" className="border-2 border-gray-300 hover:border-purple-400 h-12 px-6 text-base font-semibold hover:bg-purple-50 transition-all duration-300">
                          ⚡ Servizi
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Drop Zone Iniziale - FUNZIONANTE con nuovo sistema */}
                    <div
                      className="h-12 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all duration-300 mb-4 flex items-center justify-center cursor-pointer"
                      onDragOver={(e) => handleDragOver(e, 0)}
                      onDrop={(e) => handleDrop(e, 0)}
                      onDragLeave={handleDragLeave}
                    >
                      <div className="text-center">
                        <span className="text-blue-600 text-sm">⬇️</span>
                        <p className="text-blue-700 font-medium text-xs">Aggiungi all'inizio</p>
                      </div>
                    </div>

                    {/* Sezioni con Drop Zones Intermedie */}
                    {sections.map((section, index) => (
                      <React.Fragment key={section.id}>
                        <SortableSection
                          section={section}
                          isSelected={selectedSectionId === section.id}
                          onSelect={setSelectedSectionId}
                          onMoveUp={() => {
                            console.log('onMoveUp chiamato per sezione:', section.id, 'indice:', index);
                            handleMoveSection(section.id, 'up');
                          }}
                          onMoveDown={() => {
                            console.log('onMoveDown chiamato per sezione:', section.id, 'indice:', index);
                            handleMoveSection(section.id, 'down');
                          }}
                          canMoveUp={index > 0}
                          canMoveDown={index < sections.length - 1}
                        >
                          <SectionPreview
                            section={section}
                            theme={site.theme}
                            layoutType={site.layoutType}
                          />
                        </SortableSection>
                        
                        {/* Drop Zone Intermedia - FUNZIONANTE con nuovo sistema */}
                        <div
                          className={cn(
                            "h-10 border-2 border-dashed rounded-lg transition-all duration-300 my-3 flex items-center justify-center cursor-pointer group",
                            dragOverIndex === index 
                              ? "border-green-600 bg-green-200 scale-105" 
                              : "border-green-400 bg-green-50 hover:bg-green-100"
                          )}
                          onDragOver={(e) => handleDragOver(e, index + 1)}
                          onDrop={(e) => handleDrop(e, index + 1)}
                          onDragLeave={handleDragLeave}
                        >
                          <div className="text-center group-hover:scale-110 transition-transform duration-200">
                            <span className="text-green-600 text-sm">⬇️</span>
                            <p className="text-green-700 font-medium text-xs">Inserisci qui</p>
                          </div>
                        </div>
                      </React.Fragment>
                    ))}

                    {/* Drop Zone Finale - FUNZIONANTE con nuovo sistema */}
                    <div
                      className="h-12 border-2 border-dashed border-purple-400 rounded-lg bg-purple-50 hover:bg-purple-100 transition-all duration-300 mt-4 flex items-center justify-center cursor-pointer"
                      onDragOver={(e) => handleDragOver(e, sections.length)}
                      onDrop={(e) => handleDrop(e, sections.length)}
                      onDragLeave={handleDragLeave}
                    >
                      <div className="text-center">
                        <span className="text-purple-600 text-sm">⬇️</span>
                        <p className="text-purple-700 font-medium text-xs">Aggiungi alla fine</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </SortableContext>

            {/* Drag Overlay per migliore feedback visivo */}
            <DragOverlay>
              {draggedSection ? (
                <div className="w-full max-w-4xl">
                  <SectionPreview
                    section={draggedSection}
                    theme={site.theme}
                    layoutType={site.layoutType}
                  />
                </div>
              ) : null}
            </DragOverlay>

            {/* Overlay per drag dalla sidebar - MIGLIORATO */}
            {isDraggingFromSidebar && (
              <div className="fixed inset-0 bg-blue-500/10 pointer-events-none z-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-blue-400 animate-pulse">
                  <div className="text-center">
                    <span className="text-4xl mb-4 block">🎯</span>
                    <h3 className="text-xl font-bold text-blue-800 mb-2">Trascina la Sezione</h3>
                    <p className="text-blue-600 mb-3">Rilascia dove vuoi posizionarla nel canvas</p>
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-sm text-blue-700 font-medium">
                        💡 <strong>Prova a trascinare su:</strong>
                      </p>
                      <ul className="text-xs text-blue-600 mt-2 space-y-1">
                        <li>🔵 <strong>Zona Blu</strong> - All'inizio</li>
                        <li>🟢 <strong>Zone Verdi</strong> - Tra le sezioni</li>
                        <li>🟣 <strong>Zona Viola</strong> - Alla fine</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DndContext>
        </div>
      </div>

      {/* Right Sidebar - Solo Form di Modifica */}
      <div className="w-96 bg-gradient-to-b from-background via-background to-muted/10 border-l border-border overflow-hidden">
        {selectedSection ? (
          <div className="h-full flex flex-col">
            {/* Header della sezione selezionata */}
            <div className="p-6 bg-gradient-to-r from-accent/10 to-accent/5 border-b border-accent/20">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/70 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl">{getSectionIcon(selectedSection.type)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    ✏️ Modifica {getSectionName(selectedSection.type)}
                  </h3>
                  <p className="text-sm text-accent/70">
                    Personalizza contenuti e stile
                  </p>
                </div>
              </div>
            </div>
            
            {/* Form della sezione */}
            <div className="flex-1 overflow-auto">
              <SectionForm
                section={selectedSection}
                onUpdate={(props) => handleSectionUpdate(selectedSection.id, props)}
                onDelete={() => handleSectionDelete(selectedSection.id)}
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Seleziona una Sezione</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Clicca su una sezione nel canvas per modificarla o aggiungine una nuova dalla sidebar sinistra
              </p>
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700 font-medium">
                          💡 <strong>Drag & Drop:</strong> Trascina le sezioni per riordinarle nel canvas
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200 mt-3">
                        <p className="text-sm text-green-700 font-medium">
                          🎯 <strong>Modifica:</strong> Clicca su una sezione per aprirla nel modal di modifica
                        </p>
                      </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get default props for section types
function getDefaultPropsForSection(type: SectionType) {
  switch (type) {
    case 'HERO':
      return {
        title: 'Titolo Principale',
        subtitle: 'Sottotitolo descrittivo',
        ctaText: 'Scopri di più',
        ctaUrl: '#section',
        backgroundImage: undefined,
        isActive: true,
        order: 0,
      };
    case 'ABOUT':
      return {
        title: 'Chi Siamo',
        content: 'Descrizione della tua azienda o progetto',
        image: undefined,
        imageAlt: 'Immagine rappresentativa',
        isActive: true,
        order: 0,
      };
    case 'SERVICES':
      return {
        title: 'I Nostri Servizi',
        subtitle: 'Descrizione dei servizi offerti',
        services: [
          { title: 'Servizio 1', description: 'Descrizione servizio', icon: '🎯' },
          { title: 'Servizio 2', description: 'Descrizione servizio', icon: '✨' },
          { title: 'Servizio 3', description: 'Descrizione servizio', icon: '🚀' },
        ],
        isActive: true,
        order: 0,
      };
    case 'GALLERY':
      return {
        title: 'Galleria',
        images: [],
        isActive: true,
        order: 0,
      };
    case 'TESTIMONIALS':
      return {
        title: 'Testimonianze',
        testimonials: [
          { content: 'Testimonianza cliente', author: 'Nome Cliente', role: 'Ruolo' },
        ],
        isActive: true,
        order: 0,
      };
    case 'CONTACT':
      return {
        title: 'Contattaci',
        subtitle: 'Come possiamo aiutarti',
        email: 'info@example.com',
        phone: '+39 123 456 789',
        address: 'Via Roma 123, Milano',
        showContactForm: false,
        isActive: true,
        order: 0,
      };
    default:
      return {
        isActive: true,
        order: 0,
      };
  }
}

// Section Preview Component migliorato
const SectionPreview: React.FC<{ section: Section; theme: ThemeConfig; layoutType: string }> = ({ section, theme, layoutType }) => {
  const getSectionContent = () => {
    switch (section.type) {
      case 'HERO':
        return (section.props as any).subtitle || 'Sottotitolo hero';
      case 'ABOUT':
        return (section.props as any).content || 'Contenuto about';
      case 'SERVICES':
        return (section.props as any).subtitle || 'Descrizione servizi';
      case 'GALLERY':
        return 'Galleria immagini';
      case 'TESTIMONIALS':
        return 'Testimonianze clienti';
      case 'CONTACT':
        return (section.props as any).subtitle || 'Informazioni di contatto';
      default:
        return 'Contenuto della sezione';
    }
  };

  const getSectionTitle = () => {
    switch (section.type) {
      case 'HERO':
        return (section.props as any).title || 'Titolo Hero';
      case 'ABOUT':
        return (section.props as any).title || 'Chi Siamo';
      case 'SERVICES':
        return (section.props as any).title || 'I Nostri Servizi';
      case 'GALLERY':
        return (section.props as any).title || 'Galleria';
      case 'TESTIMONIALS':
        return (section.props as any).title || 'Testimonianze';
      case 'CONTACT':
        return (section.props as any).title || 'Contattaci';
      default:
        return 'Sezione';
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-4 h-4 rounded-full bg-accent"></div>
        <h3 className="text-lg font-semibold text-foreground">
          {getSectionTitle()}
        </h3>
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {getSectionContent()}
      </p>
      
      {/* Preview indicators */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Layout: {layoutType}</span>
          <span>Accent: {theme.accent}</span>
        </div>
      </div>
    </div>
  );
};
