'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { SECTION_TYPES } from '@/lib/constants';
import { SectionType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Eye, EyeOff, GripVertical, Settings, Trash2, Info, ArrowUp, ArrowDown } from 'lucide-react';
import { Section } from '@/types';

interface SectionListProps {
  sections: Section[];
  onSectionToggle: (sectionId: string, isActive: boolean) => void;
  onSectionReorder: (sections: Section[]) => void;
  onAddSection: (type: SectionType) => void;
  availableSections: SectionType[];
  maxSections: number;
  layoutType?: string; // Aggiungo il layoutType per personalizzare le sezioni disponibili
  className?: string;
}

export const SectionList: React.FC<SectionListProps> = ({
  sections,
  onSectionToggle,
  onSectionReorder,
  onAddSection,
  availableSections,
  maxSections,
  layoutType,
  className,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const canAddSection = sections.length < maxSections;

  // Ottieni le sezioni disponibili specifiche per il layout
  const getLayoutSpecificSections = () => {
    if (!layoutType) return availableSections;
    
    const layoutSections: Record<string, SectionType[]> = {
      'ELEGANTE': ['HERO', 'ABOUT', 'SERVICES', 'GALLERY', 'TESTIMONIALS', 'CONTACT', 'DOMAIN_NAME'],
      'MEDIO': ['HERO', 'ABOUT', 'SERVICES', 'GALLERY', 'TESTIMONIALS', 'CONTACT', 'DOMAIN_NAME'],
      'ESSENZIALE': ['HERO', 'ABOUT', 'SERVICES', 'GALLERY', 'TESTIMONIALS', 'CONTACT', 'DOMAIN_NAME']
    };
    
    return layoutSections[layoutType] || availableSections;
  };

  const layoutSpecificSections = getLayoutSpecificSections();

  // Debug log per verificare che le modifiche siano applicate
  console.log('🎨 SectionList - LayoutType:', layoutType);
  console.log('🎨 SectionList - LayoutSpecificSections:', layoutSpecificSections);
  console.log('🎨 SectionList - AvailableSections:', availableSections);

  const getSectionIcon = (type: SectionType) => {
    switch (type) {
      case 'HERO': return '🏠';
      case 'ABOUT': return 'ℹ️';
      case 'SERVICES': return '⚡';
      case 'GALLERY': return '🖼️';
      case 'TESTIMONIALS': return '💬';
      case 'CONTACT': return '📞';
      case 'DOMAIN_NAME': return '🌐';
      default: return '📄';
    }
  };

  const getSectionColor = (type: SectionType) => {
    switch (type) {
      case 'HERO': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'ABOUT': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'SERVICES': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'GALLERY': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'TESTIMONIALS': return 'bg-pink-500/10 text-pink-600 border-pink-200';
      case 'CONTACT': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'DOMAIN_NAME': return 'bg-indigo-500/10 text-indigo-600 border-indigo-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    if (currentIndex === -1) return;

    let newIndex: number;
    if (direction === 'up' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < sections.length - 1) {
      newIndex = currentIndex + 1;
    } else {
      return;
    }

    const newSections = [...sections];
    [newSections[currentIndex], newSections[newIndex]] = [newSections[newIndex], newSections[currentIndex]];
    
    // Update order properties
    newSections.forEach((section, index) => {
      section.props.order = index;
    });
    
    onSectionReorder(newSections);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (confirm('Sei sicuro di voler eliminare questa sezione?')) {
      const updatedSections = sections.filter(section => section.id !== sectionId);
      onSectionReorder(updatedSections);
    }
  };

  return (
    <div className={cn('w-72 bg-background border-r border-border p-4 space-y-4 overflow-y-auto', className)}>
      {/* Debug Banner - Rimuovere dopo il test */}
      <div className="bg-red-500 text-white p-2 rounded-lg text-center font-bold text-lg">
        🎨 NUOVA VERSIONE APPLICATA - Layout: {layoutType || 'Generico'}
      </div>
      <div className="bg-yellow-500 text-black p-2 rounded-lg text-center font-bold">
        🔧 DEBUG: Sezioni disponibili: {layoutSpecificSections.length}
      </div>
      {/* Header Completamente Ridisegnato e Tradotto */}
      <div className="pb-6 border-b-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">🎨</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Gestione Sezioni</h3>
            <p className="text-base text-gray-600 font-medium">Organizza e personalizza il tuo sito web</p>
          </div>
        </div>

      </div>

      {/* Sezioni Attive - Completamente Ridisegnata */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-green-800 flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📋</span>
            </div>
            <span>Sezioni Attive ({sections.length}/{maxSections})</span>
          </CardTitle>
          <p className="text-base text-green-700 mb-3 font-medium">
            <strong>RIORDINA</strong> le sezioni trascinandole o usa i pulsanti freccia
          </p>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700 font-medium">
              💡 <strong>Come riordinare:</strong> Trascina il grip handle ↔️ o usa ↑↓ per spostare
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {sections.length === 0 ? (
            <div className="text-center py-8 px-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-xl">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">📝</span>
              </div>
              <p className="text-lg text-blue-800 font-bold mb-2">
                Nessuna Sezione Attiva
              </p>
              <p className="text-sm text-blue-600">
                Aggiungi la tua prima sezione dal pannello "Sezioni Disponibili"
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', section.id);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  className="group cursor-grab active:cursor-grabbing"
                >
                  <div className="bg-white border-2 border-green-200 rounded-xl p-4 hover:border-green-400 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg cursor-grab">
                          <GripVertical className="w-5 h-5 text-white" />
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-xl">{getSectionIcon(section.type)}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-800 text-lg">{SECTION_TYPES[section.type].name}</div>
                          <div className="text-sm text-gray-600">{SECTION_TYPES[section.type].description}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex flex-col space-y-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMoveSection(section.id, 'up')}
                            disabled={index === 0}
                            className="w-8 h-8 p-0 hover:bg-green-100 hover:border-green-400"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMoveSection(section.id, 'down')}
                            disabled={index === sections.length - 1}
                            className="w-8 h-8 p-0 hover:bg-green-100 hover:border-green-400"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSection(section.id)}
                          className="w-8 h-8 p-0 hover:bg-red-100 hover:border-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600 font-medium">ATTIVO</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">Posizione {index + 1}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs px-2 py-1 hover:bg-blue-50 hover:border-blue-300"
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Modifica
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>


      {/* Add Section Completamente Ridisegnata con Drag & Drop Chiaro */}
      <Card className="border-2 border-dashed border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-foreground flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span>🎯 Sezioni del Tema {layoutType || 'Generico'}</span>
          </CardTitle>
          <p className="text-base text-muted-foreground mb-3 font-medium">
            <strong>CLICCA</strong> su una sezione per aggiungerla al tuo sito
          </p>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 font-medium">
              💡 <strong>Come aggiungere:</strong> Clicca su una sezione → Appare nel canvas → Modifica il contenuto
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-4">
            {layoutSpecificSections.map((sectionType) => (
              <div
                key={sectionType}
                className="group cursor-pointer"
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    console.log('🎯 Click su sezione:', sectionType);
                    console.log('🎯 canAddSection:', canAddSection);
                    console.log('🎯 sections.length:', sections.length);
                    console.log('🎯 maxSections:', maxSections);
                    onAddSection(sectionType);
                  }}
                  disabled={!canAddSection}
                  className="w-full justify-start hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 hover:scale-[1.02] transition-all duration-300 h-20 border-2 group-hover:border-blue-400 group-hover:shadow-xl"
                >
                  <div className="flex items-center space-x-4 w-full">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <span className="text-3xl">{getSectionIcon(sectionType)}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-bold text-gray-800 text-lg mb-1">{SECTION_TYPES[sectionType].name}</div>
                      <div className="text-sm text-gray-600 font-medium">
                        {SECTION_TYPES[sectionType].description}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Plus className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                        <span className="text-sm text-white font-bold">+</span>
                      </div>
                      {!canAddSection && (
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-sm text-white font-bold">✕</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              </div>
            ))}
          </div>
          
          {!canAddSection && (
            <div className="text-center py-4 px-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl">
              <div className="w-12 h-12 mx-auto mb-3 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-sm text-amber-800 font-bold mb-2">
                Limite Sezioni Raggiunto
              </p>
              <p className="text-xs text-amber-700">
                Aggiorna il piano per aggiungere più sezioni e funzionalità
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggerimenti Rapidi - Migliorati e Tradotti */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold text-blue-800 flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Info className="w-4 h-4 text-white" />
            </div>
            <span>💡 Suggerimenti Rapidi</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-blue-200">
            <span className="text-blue-500 text-lg">🎯</span>
            <div>
              <span className="text-sm font-semibold text-blue-800 block">Trascina e Rilascia</span>
              <span className="text-xs text-blue-600">Trascina le sezioni nel canvas per aggiungerle</span>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-purple-200">
            <span className="text-purple-500 text-lg">🔄</span>
            <div>
              <span className="text-sm font-semibold text-purple-800 block">Riorganizza</span>
              <span className="text-xs text-purple-600">Usa il drag handle per riordinare le sezioni</span>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-green-200">
            <span className="text-green-500 text-lg">✏️</span>
            <div>
              <span className="text-sm font-semibold text-green-800 block">Modifica</span>
              <span className="text-xs text-green-600">Clicca su una sezione per aprirla nel modal</span>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <span className="text-amber-500 text-lg">📊</span>
            <div>
              <span className="text-sm font-semibold text-amber-800 block">Limite Sezioni</span>
              <span className="text-xs text-amber-600">Massimo {maxSections} sezioni disponibili</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
