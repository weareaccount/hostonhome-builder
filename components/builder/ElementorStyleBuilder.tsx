'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SectionType, Section, ThemeConfig, LayoutType, ThemeAccent, ThemeFont } from '@/types';
import { InteractiveThemePreview } from './InteractiveThemePreview';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { ProjectService } from '@/lib/projects';
import { 
  Save, 
  Eye, 
  Globe, 
  Undo, 
  Redo, 
  Settings, 
  Layers, 
  Palette,
  Type,
  Layout,
  Smartphone,
  Tablet,
  Monitor,
  Plus,
  Grid3X3,
  Rows,
  Columns,
  Palette as PaletteIcon,
  Type as TypeIcon,
  GripVertical,
  Target,
  FileText,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';

// Costanti per font e colori
const AVAILABLE_FONTS: { key: ThemeFont; name: string }[] = [
  { key: 'INTER', name: 'Inter' },
  { key: 'POPPINS', name: 'Poppins' },
  { key: 'MONTSERRAT', name: 'Montserrat' },
  { key: 'WORKSANS', name: 'Work Sans' }
];

const AVAILABLE_COLORS: { key: ThemeAccent; name: string; color: string }[] = [
  {
     key: 'BLUE', name: 'Blu', color: '#2563eb' },
  { key: 'GREEN', name: 'Verde', color: '#16a34a' },
  { key: 'RED', name: 'Rosso', color: '#dc2626' },
  { key: 'VIOLET', name: 'Viola', color: '#8b5cf6' }
];

interface ElementorStyleBuilderProps {
  site: any;
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
  onThemeChange: (theme: { accent: ThemeAccent; font: ThemeFont }) => void;
  onSave: () => void;
  onPublish: () => void;
  maxSections: number;
  className?: string;
}

// Header semplificato e pulito
const BuilderHeader = ({ 
  layoutType, 
  theme, 
  onThemeChange,
  onSave,
  onPublish,
  deviceType,
  onDeviceChange,
  saving,
  showThemePanel,
  setShowThemePanel
}: {
  layoutType: LayoutType;
  theme: { accent: ThemeAccent; font: ThemeFont };
  onThemeChange: (theme: { accent: ThemeAccent; font: ThemeFont }) => void;
  onSave: () => void;
  onPublish: () => void;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  saving: boolean;
  showThemePanel: boolean;
  setShowThemePanel: (show: boolean) => void;
}) => {
  return (
    <div className="h-auto bg-white border-b border-gray-200 px-3 sm:px-6 shadow-sm">
      {/* Mobile Layout */}
      <div className="sm:hidden flex items-center justify-center py-2">
        {/* Mobile: Logo centrato */}
        <img 
          src="/logo-hostonhome.png" 
          alt="HostonHome" 
          className="h-8 w-auto"
        />
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex items-center justify-between py-2">
        {/* Left - Controls */}
        <div className="flex items-center space-x-4">
          {/* Dashboard Button */}
          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm text-sm font-medium"
            title="Torna alla Dashboard"
          >
            ← Dashboard
          </button>
          {/* Responsive Controls */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
          <Button 
            variant={deviceType === 'desktop' ? 'default' : 'ghost'} 
            size="sm" 
            className="h-7 w-7 p-0"
            onClick={() => onDeviceChange('desktop')}
            title="Desktop"
          >
            <Monitor className="w-4 h-4" />
          </Button>
          <Button 
            variant={deviceType === 'tablet' ? 'default' : 'ghost'} 
            size="sm" 
            className="h-7 w-7 p-0"
            onClick={() => onDeviceChange('tablet')}
            title="Tablet"
          >
            <Tablet className="w-4 h-4" />
          </Button>
          <Button 
            variant={deviceType === 'mobile' ? 'default' : 'ghost'} 
            size="sm" 
            className="h-7 w-7 p-0"
            onClick={() => onDeviceChange('mobile')}
            title="Mobile"
          >
            <Smartphone className="w-4 h-4" />
          </Button>
          </div>
          {/* Tema */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Tema:</span>
            <div className="bg-gray-100 rounded-md px-3 py-1">
              <span className="text-sm font-medium text-gray-900">Host On Home</span>
            </div>
          </div>
        </div>

        {/* Center - Logo */}
        <div className="flex items-center space-x-3">
          <img 
            src="/logo-hostonhome.png" 
            alt="HostonHome" 
            className="h-8 w-auto"
          />
          {saving && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Salvando...</span>
            </div>
          )}
        </div>

        {/* Right - Theme Controls */}
        <div className="flex items-center space-x-4">
          {/* Desktop: selettori visibili */}
          <div className="flex items-center space-x-2">
            <Type className="w-4 h-4 text-gray-600" />
            <select
              value={theme.font}
              onChange={(e) => onThemeChange({ ...theme, font: e.target.value as ThemeFont })}
              className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {AVAILABLE_FONTS.map(font => (
                <option key={font.key} value={font.key}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          {/* PULSANTE SALVA */}
          <Button
            onClick={onSave}
            className="inline-flex bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
            size="sm"
            data-save-button
          >
            <Save className="w-4 h-4 mr-2" />
            Salva Progetto
          </Button>
        </div>
      </div>

      {/* Theme panel (mobile) */}
      {showThemePanel && (
        <div className="sm:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setShowThemePanel(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-semibold text-gray-900">Personalizza Tema</span>
              <button 
                onClick={() => setShowThemePanel(false)} 
                className="text-gray-600 text-sm hover:text-gray-800"
              >
                ✕ Chiudi
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Font</label>
                <select
                  value={theme.font}
                  onChange={(e) => {
                    console.log('📝 Cambio font:', e.target.value);
                    onThemeChange({ ...theme, font: e.target.value as ThemeFont });
                  }}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {AVAILABLE_FONTS.map(font => (
                    <option key={font.key} value={font.key}>{font.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-center text-sm text-gray-500 mb-4">
                  I colori vengono gestiti direttamente nelle singole sezioni
                </div>
              </div>
              
              {/* Pulsanti di azione */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowThemePanel(false)}
                  className="flex items-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  Sezioni
                </Button>
                <Button 
                  onClick={onSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  size="sm"
                >
                  <Save className="w-4 h-4" />
                  Salva
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// SIDEBAR COMPLETAMENTE RIDISEGNATA - SUPER INTUITIVA E FUNZIONALE
const WidgetLibrary = ({ onAddSection, onSectionsChange, availableSections, maxSections, currentSections, plan, compact = false, showRemove = true, fullPage = false }: { 
  onAddSection: (type: SectionType) => void;
  onSectionsChange: (sections: Section[]) => void;
  availableSections: SectionType[];
  maxSections: number;
  currentSections: Section[];
  plan?: 'BASE' | 'PLUS' | 'PRO';
  compact?: boolean;
  showRemove?: boolean;
  fullPage?: boolean;
}) => {
  const canAddSection = currentSections.length < maxSections;

  const allWidgets = [
    { type: 'HERO', name: 'Hero', icon: '🏠', description: 'Titolo principale e CTA' },
    { type: 'ABOUT', name: 'Chi Siamo', icon: 'ℹ️', description: 'Presenta la tua struttura' },
    { type: 'SERVICES', name: 'Servizi', icon: '⚡', description: 'Lista servizi offerti' },
    { type: 'GALLERY', name: 'Galleria', icon: '🖼️', description: 'Raccolta immagini' },
    { type: 'TESTIMONIALS', name: 'Recensioni', icon: '💬', description: 'Feedback clienti' },
    { type: 'CONTACT', name: 'Contatti', icon: '📞', description: 'Dati di contatto' },
    // Widget premium - sempre visibili, bloccati su BASE
    { type: 'PHOTO_GALLERY', name: 'Galleria Foto', icon: '📷', description: 'Griglia fotografica' },
    { type: 'AMENITIES', name: 'Dotazioni', icon: '🧰', description: 'Lista dotazioni/servizi' },
    { type: 'GET_YOUR_GUIDE', name: 'GetYourGuide', icon: '🧭', description: 'Attività e tour con link GetYourGuide (solo Pro)' },
  ];

  const handleWidgetClick = (widgetType: SectionType) => {
    console.log('🎯 Widget cliccato:', widgetType);
    alert(`✅ Aggiungendo sezione ${widgetType}!`);
    onAddSection(widgetType);
  };

  const handleDeleteSection = (widgetType: SectionType) => {
    console.log('🗑️ Eliminando sezione:', widgetType);
    const updatedSections = currentSections.filter(s => s.type !== widgetType);
    onSectionsChange(updatedSections);
    alert(`🗑️ Sezione ${widgetType} rimossa con successo!`);
  };

  const handleClearAll = () => {
    if (confirm('🚨 Vuoi davvero rimuovere TUTTE le sezioni? Questa azione non può essere annullata!')) {
      console.log('🗑️ Rimuovendo tutte le sezioni');
      onSectionsChange([]);
      alert('🧹 Tutte le sezioni sono state rimosse!');
    }
  };

  return (
    <div className={cn(
      "w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex-shrink-0 flex flex-col md:static z-10",
      compact && "border-t rounded-t-2xl",
      fullPage ? "h-full" : "h-auto sticky top-14"
    ) }>
      {/* HEADER MIGLIORATO CON ANIMAZIONI */}
      {!compact ? (
      <div className="p-4 sm:p-5 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          {/* TITOLO CON ANIMAZIONE */}
          <div className="flex items-center justify-center space-x-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-200">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 tracking-wide">Costruisci il tuo Sito</h3>
          </div>
          
          {/* PROGRESS BAR ANIMATA */}
          <div className="relative mb-3 sm:mb-4">
            <div className="bg-gray-200 rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-700 ease-out shadow-sm relative overflow-hidden"
                style={{ width: `${Math.max((currentSections.length / maxSections) * 100, 8)}%` }}
              >
                {/* Effetto shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
            <div className="absolute -top-1 -right-1">
              <div className="w-5 h-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg animate-bounce">
                <div className="w-full h-full bg-white/30 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
          
          {/* STATISTICHE CON ANIMAZIONI */}
          <div className="flex items-center justify-center space-x-6">
            {/* Sezioni Attive */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 shadow-md border border-blue-200 transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  <span className="text-lg font-bold text-green-600 animate-pulse">{currentSections.length}</span>
                  <span className="text-gray-600 ml-1">/ {maxSections}</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Sezioni Attive</p>
            </div>
            
            {/* Disponibili */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 shadow-md border border-gray-200 transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  <span className="text-lg font-bold text-blue-600">{Math.max(0, maxSections - currentSections.length)}</span>
                  <span className="text-gray-600 ml-1">rimaste</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Disponibili</p>
            </div>
          </div>
          
          {/* INDICATORE COMPLETAMENTO */}
          {currentSections.length === maxSections && (
            <div className="mt-3">
              <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium border border-green-300">
                <span className="text-lg">🎉</span>
                <span>Sito Completo!</span>
              </div>
            </div>
          )}
        </div>
      </div>
      ) : (
        <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
          <div className="h-1 w-10 bg-gray-300 rounded mx-auto mb-2"></div>
          <div className="text-center text-sm font-semibold text-gray-700">Aggiungi sezione</div>
        </div>
      )}

      {/* LISTA WIDGET RIDISEGNATA */}
      <div className={cn("flex-1 overflow-y-auto", compact ? "p-2 space-y-2" : "p-3 sm:p-4 space-y-3") }>
        {allWidgets.map((widget) => {
          const isActive = currentSections.some(s => s.type === widget.type);
          const isPremium = widget.type === 'PHOTO_GALLERY' || widget.type === 'AMENITIES';
          const isLocked = isPremium && plan === 'BASE';
          
          return (
            <div key={widget.type} className="relative">
              {isActive ? (
                /* WIDGET ATTIVO - STILE COERENTE */
                <div className={cn("bg-green-50 border-2 border-green-200 rounded-lg shadow-sm", compact ? "p-2" : "p-4") }>
                  <div className="flex items-start space-x-3">
                    {/* ICONA WIDGET */}
                    <div className={cn("rounded-lg flex items-center justify-center text-white font-bold shadow-sm bg-green-600", compact ? "w-8 h-8 text-base" : "w-10 h-10 text-lg") }>
                      {widget.icon}
                    </div>
                    
                    {/* CONTENUTO PRINCIPALE */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={cn("text-gray-900 font-semibold", compact ? "text-sm" : "text-base")}>{widget.name}</h4>
                        <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          ✓ Attivo
                        </span>
                      </div>
                      {!compact && <p className="text-gray-600 text-sm mb-3 leading-relaxed">{widget.description}</p>}
                      
                      {/* PULSANTE RIMUOVI */}
                      {showRemove && (
                      <Button
                        onClick={() => handleDeleteSection(widget.type as SectionType)}
                        variant="outline"
                        size="sm"
                        className={cn("border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 text-xs", compact && "h-7 px-2 py-1")}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Rimuovi
                      </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* WIDGET NON ATTIVO - STILE COERENTE */
                <button
                  onClick={() => {
                    if (isLocked) {
                      const go = confirm('🔒 Questo widget è disponibile solo con i piani Avanzato e Pro.\n\nVuoi aprire la sezione Pagamenti per effettuare l\'upgrade?');
                      if (go) {
                        window.location.href = '/dashboard?billing=1';
                      }
                      return;
                    }
                    handleWidgetClick(widget.type as SectionType)
                  }}
                  disabled={!canAddSection}
                  className={cn(
                    "w-full rounded-lg border-2 border-dashed transition-all duration-200 group text-left",
                    compact ? "p-2" : "p-4",
                    !isLocked && canAddSection 
                      ? "border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 cursor-pointer shadow-sm hover:shadow-md"
                      : "border-gray-300 bg-gray-50 opacity-60 cursor-pointer"
                  )}
                >
                  <div className="flex items-start space-x-3">
                    {/* ICONA WIDGET */}
                    <div className={cn("bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform", compact ? "w-8 h-8 text-base" : "w-10 h-10 text-lg") }>
                      {widget.icon}
                    </div>
                    
                    {/* CONTENUTO */}
                    <div className="flex-1">
                      <h4 className={cn("text-gray-900 font-semibold mb-1", compact ? "text-sm" : "text-base")}>{widget.name}</h4>
                      {!compact && <p className="text-gray-600 text-sm mb-3 leading-relaxed">{widget.description}</p>}
                      
                      {/* CALL TO ACTION */}
                      <div className={cn("flex items-center space-x-2", compact && "mt-1") }>
                        {!isLocked ? (
                          <span className={cn("inline-flex items-center bg-blue-600 text-white rounded-md text-xs font-medium", compact ? "px-2 py-1" : "px-3 py-1.5") }>
                            <Plus className="w-3 h-3 mr-1" />
                            Aggiungi Sezione
                          </span>
                        ) : (
                          <span className={cn("inline-flex items-center bg-gray-300 text-gray-700 rounded-md text-xs font-medium", compact ? "px-2 py-1" : "px-3 py-1.5") }>
                            🔒 Richiede Upgrade
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )}
            </div>
          );
        })}
        
        {/* MESSAGGIO LIMITE RAGGIUNTO */}
        {!canAddSection && (
          <div className="text-center py-6 px-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-gray-900 font-semibold mb-2">
              Limite Raggiunto
            </h3>
            <p className="text-gray-600 text-sm">
              Hai utilizzato tutte le {maxSections} sezioni disponibili.<br/>
              Rimuovi una sezione o aggiorna il piano.
            </p>
          </div>
        )}
      </div>

      {/* FOOTER PULITO */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-center">
          <Button 
            onClick={handleClearAll}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Pulisci Tutto
          </Button>
        </div>
        
        {/* INFO AGGIUNTIVE */}
        <div className="mt-3 text-center">
          <p className="text-gray-500 text-xs">
            Trascina le sezioni nel canvas per riordinarle
          </p>
        </div>
      </div>
    </div>
  );
};

// Canvas Area semplificata
const CanvasArea = ({ 
  sections, 
  onSectionsChange, 
  layoutType,
  theme,
  onThemeChange,
  onSectionSelect,
  selectedSectionId,
  onSectionUpdate,
  onSectionDelete,
  onSectionPublish,
  onSectionUnpublish,
  deviceType
}: {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
  layoutType: LayoutType;
  theme: { accent: ThemeAccent; font: ThemeFont };
  onThemeChange: (theme: { accent: ThemeAccent; font: ThemeFont }) => void;
  onSectionSelect: (sectionId: string | null) => void;
  selectedSectionId: string | null;
  onSectionUpdate: (sectionId: string, props: any) => void;
  onSectionDelete: (sectionId: string) => void;
  onSectionPublish: (sectionId: string) => void;
  onSectionUnpublish: (sectionId: string) => void;
  deviceType: 'desktop' | 'tablet' | 'mobile';
}) => {


  return (
    <div className="flex-1 bg-gray-50 overflow-auto min-h-full">
      <InteractiveThemePreview
        layoutType={layoutType}
        theme={theme}
        sections={sections}
        onSectionUpdate={onSectionUpdate}
        onSectionDelete={onSectionDelete}
        onSectionPublish={onSectionPublish}
        onSectionUnpublish={onSectionUnpublish}
        onSectionReorder={onSectionsChange}
        className="min-h-full"
        deviceType={deviceType}
      />
    </div>
  );
};

// Main Builder Component
export function ElementorStyleBuilder({
  site,
  sections,
  onSectionsChange,
  onThemeChange,
  onSave,
  onPublish,
  maxSections
}: ElementorStyleBuilderProps) {
  // Nothing to change here for gating; gating is handled in parent (builder page)
  const { user } = useAuth();
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const layoutType: LayoutType = 'ELEGANTE';
  const [theme, setTheme] = useState(site.theme);
  const [deviceType, setDeviceType] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);
  const [showThemePanel, setShowThemePanel] = useState(false);
  // Navigazione mobile: Libreria / Anteprima / (Modifica tramite inline editor della preview)
  const [mobileTab, setMobileTab] = useState<'widgets' | 'preview'>('widgets');

  // Imposta automaticamente il device su mobile quando lo schermo è piccolo
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const setInitial = () => {
        if (window.innerWidth < 768) setDeviceType('mobile');
      };
      setInitial();
      window.addEventListener('resize', setInitial);
      return () => window.removeEventListener('resize', setInitial);
    }
  }, []);

  const handleThemeChangeInternal = (newTheme: { accent: ThemeAccent; font: ThemeFont }) => {
    console.log('🎨 handleThemeChangeInternal chiamato:', newTheme);
    console.log('🎨 Tema precedente:', theme);
    console.log('🎨 User e site.id:', { user: !!user, siteId: site.id });
    
    // Aggiorna lo stato locale
    setTheme(newTheme);
    
    // Comunica il cambio al componente padre
    console.log('🎨 Chiamando onThemeChange del componente padre...');
    onThemeChange(newTheme);
    
    // Salvataggio automatico quando cambia il tema
    if (user && site.id) {
      console.log('💾 Avviando salvataggio automatico per cambio tema...');
      setTimeout(() => {
        console.log('💾 Eseguendo saveProject dopo timeout...');
        saveProject();
      }, 500); // Piccolo delay per assicurarsi che lo state sia aggiornato
    } else {
      console.log('❌ Impossibile salvare: user o site.id mancanti', { user: !!user, siteId: site.id });
    }
  };

  // Salvataggio automatico del progetto
  const saveProject = async () => {
    if (!user || !site.id) {
      console.log('❌ Impossibile salvare: user o site.id mancanti', { user: !!user, siteId: site.id });
      return;
    }
    
    try {
      setSaving(true);
      console.log('💾 Salvando progetto automaticamente...', { 
        siteId: site.id, 
        sectionsCount: sections.length,
        theme: theme,
        layoutType: layoutType,
        sections: sections,
        user: user
      });
      
      // Verifica che i dati siano validi
      if (!theme || !theme.accent || !theme.font) {
        throw new Error('Tema non valido: ' + JSON.stringify(theme));
      }
      
      if (!sections || !Array.isArray(sections)) {
        throw new Error('Sezioni non valide: ' + JSON.stringify(sections));
      }
      
      // Prima prova a verificare se il progetto esiste
      let existingProject = null;
      try {
        console.log('🔍 Cercando progetto con ID:', site.id);
        existingProject = await ProjectService.getProject(site.id);
        console.log('🔍 Progetto esistente trovato:', existingProject?.id);
      } catch (error) {
        console.log('🔍 Progetto non trovato, errore:', error);
        console.log('🔍 Creo nuovo progetto...');
      }
      
      let result;
      if (existingProject) {
        // Aggiorna progetto esistente
        console.log('🔄 Aggiornando progetto esistente:', existingProject.id);
        try {
          result = await ProjectService.updateProject(site.id, {
            sections,
            theme,
            layout_type: layoutType
          });
          console.log('✅ Progetto aggiornato con successo!', result);
        } catch (updateError) {
          console.error('❌ Errore nell\'aggiornamento, provo a creare nuovo progetto:', updateError);
          // Se l'aggiornamento fallisce, crea un nuovo progetto
          result = await ProjectService.createProject(user.id, {
            name: site.name || 'Nuovo Progetto',
            slug: site.slug || site.id,
            sections,
            theme,
            layout_type: layoutType
          });
          console.log('✅ Nuovo progetto creato dopo errore aggiornamento!', result);
          site.id = result.id;
        }
      } else {
        // Crea nuovo progetto
        console.log('🆕 Creando nuovo progetto nel database...');
        console.log('🆕 Dati progetto:', {
          userId: user.id,
          name: site.name || 'Nuovo Progetto',
          slug: site.slug || site.id,
          sectionsCount: sections.length,
          theme: theme,
          layoutType: layoutType
        });
        
        result = await ProjectService.createProject(user.id, {
          name: site.name || 'Nuovo Progetto',
          slug: site.slug || site.id,
          sections,
          theme,
          layout_type: layoutType
        });
        
        console.log('✅ Nuovo progetto creato con successo!', result);
        console.log('✅ Nuovo ID progetto:', result.id);
        
        // Aggiorna l'ID del sito con quello del progetto creato
        const oldId = site.id;
        site.id = result.id;
        console.log('🔄 Aggiornato site.id da', oldId, 'a', site.id);
      }
      
      console.log('✅ Progetto salvato automaticamente con successo!', result);
    } catch (error) {
      console.error('❌ Errore nel salvataggio automatico:', error);
      console.error('❌ Dettagli errore:', {
        error: error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      const errorMessage = error instanceof Error ? error.message : 
                          typeof error === 'object' ? JSON.stringify(error) : 
                          String(error);
      alert('❌ Errore nel salvataggio: ' + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Salvataggio automatico quando cambiano le sezioni
  useEffect(() => {
    if (user && site.id && sections.length > 0) {
      const timeoutId = setTimeout(() => {
        saveProject();
      }, 2000); // Salva dopo 2 secondi di inattività

      return () => clearTimeout(timeoutId);
    }
  }, [sections, user, site.id]);

  // Salvataggio automatico quando cambia il tema
  useEffect(() => {
    if (user && site.id && theme) {
      const timeoutId = setTimeout(() => {
        saveProject();
      }, 1000); // Salva dopo 1 secondo quando cambia il tema

      return () => clearTimeout(timeoutId);
    }
  }, [theme, user, site.id]);

  const handleAddSection = (type: SectionType) => {
    console.log('🎯 Aggiungendo sezione:', type);
    console.log('🎯 Stato attuale:', { 
      sectionsCount: sections.length, 
      user: !!user, 
      siteId: site.id,
      sections: sections 
    });
    
    // Gating: PHOTO_GALLERY e AMENITIES solo per PLUS/PRO; GET_YOUR_GUIDE solo PRO
    const plan = (user as any)?.plan
    if ((type === 'PHOTO_GALLERY' || type === 'AMENITIES') && !(plan === 'PLUS' || plan === 'PRO')) {
      alert('Questo widget è disponibile solo con i piani Avanzato e Pro.');
      return;
    }
    if (type === 'GET_YOUR_GUIDE' && plan !== 'PRO') {
      alert('Questo widget è disponibile solo con il piano Pro.');
      return;
    }
    
    try {
    
    const newSection: Section = {
      id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      props: {
        isActive: true,
        order: sections.length,
        isPublished: false, // Nuovo campo per tracciare se la sezione è pubblicata
        title: `Sezione ${type}`,
        subtitle: `Descrizione per ${type}`,
        ...(type === 'HERO' && { 
          title: 'Benvenuti al San Vito Suites',
          subtitle: 'Camere accoglienti e moderne nel cuore di Roma',
          ctaText: 'Scopri',
          ctaUrl: '#alloggi',
          backgroundImage: '/images/hero-bg.jpg'
        }),
        ...(type === 'ABOUT' && { 
          title: 'Vivi Roma come un vero local',
          content: 'Nel cuore di Roma, a pochi passi dalla stazione Termini e a soli 350 metri dalla fermata metro Vittorio Emanuele, il San Vito Suites è il punto di partenza perfetto per vivere la Capitale in totale comodità.',
          image: '/images/about-image.jpg',
          imageAlt: 'San Vito Suites'
        }),
        ...(type === 'SERVICES' && { 
          title: 'Alloggi',
          subtitle: 'Le nostre camere confortevoli',
          services: [
            {
              title: 'Camera Matrimoniale con Letto Supplementare',
              description: 'Spaziosa e ideale per famiglie, amici o chi desidera più spazio, questa camera dispone di un letto matrimoniale large e un letto singolo.',
              icon: '🛏️',
              guests: '3',
              size: '22m²',
              price: '120',
              isAvailable: true
            },
            {
              title: 'Camera Matrimoniale con Balcone',
              description: 'Ideale per coppie in cerca di comfort e relax, questa camera offre un letto matrimoniale comodo e un balcone arredato.',
              icon: '🌅',
              guests: '2',
              size: '18m²',
              price: '100',
              isAvailable: true
            },
            {
              title: 'Camera Matrimoniale',
              description: 'Accogliente e funzionale, questa camera matrimoniale è la scelta perfetta per chi desidera soggiornare nel cuore di Roma.',
              icon: '🏠',
              guests: '2',
              size: '22m²',
              price: '95',
              isAvailable: true
            }
          ]
        }),
        ...(type === 'GALLERY' && { 
          title: 'Scopri Roma',
          subtitle: 'Attività e tour disponibili',
          activities: [
            {
              title: 'Tour in golf cart: il meglio di Roma di notte',
              description: 'Roma di notte in golf cart – Tour privato tra luci e monumenti illuminati per scoprire la città da una prospettiva unica.',
              icon: '🌙',
              price: 'Gratis',
              duration: '2 ore',
              isAvailable: true
            },
            {
              title: 'Da Roma: Escursione di un giorno a Pompei, Costiera Amalfitana e Sorrento',
              description: 'Da Roma a Pompei & Costiera Amalfitana – Tour guidato indimenticabile tra storia e bellezza.',
              icon: '🌋',
              price: '€10',
              duration: '1 giorno',
              isAvailable: true
            },
            {
              title: 'Roma: biglietti con ingresso prioritario al Pantheon + app interattiva',
              description: 'Visita il Pantheon, simbolo eterno di Roma. Entra in uno dei monumenti più imponenti della storia.',
              icon: '🏛️',
              price: 'Gratis',
              duration: '1 ora',
              isAvailable: true
            }
          ]
        }),
        ...(type === 'TESTIMONIALS' && { 
          title: 'Recensioni',
          subtitle: 'Cosa dicono i nostri ospiti',
          testimonials: [
            {
              name: 'Matteo',
              content: 'Camera davvero confortevole ed elegante, host super disponibile e gentile. Posizione strategica e centrale con vicino la fermata della metro e a pochissimi minuti a piedi dalla stazione di Roma Termini.',
              avatar: '👨‍💼',
              rating: 5,
              date: '2024-01-15'
            },
            {
              name: 'Gabriella',
              content: 'Posizione ottima per chi vuole andare al Brancaccio, ottima accoglienza e pulizia. Giusta grandezza di camera e bagno.',
              avatar: '👩‍💼',
              rating: 5,
              date: '2024-01-10'
            },
            {
              name: 'Francesca',
              content: 'Stanza spaziosa e confortevole, con affaccio caratteristico su chiesa e Arco di Gallieno. A due passi da piazza Vittorio e dalla metro.',
              avatar: '👩‍💼',
              rating: 5,
              date: '2024-01-05'
            }
          ]
        }),
        ...(type === 'CONTACT' && { 
          title: 'Contattaci',
          subtitle: 'Come possiamo aiutarti',
          email: 'info@sanvitosuites.it',
          phone: '+39 06 123 4567',
          address: 'Via San Vito, 123 - Roma',
          showContactForm: true,
          businessHours: 'Check-in: 14:00 - Check-out: 11:00'
        }),
        ...(type === 'PHOTO_GALLERY' && {
          title: 'Galleria Fotografica',
          photos: [
            { url: '/images/photo1.jpg', alt: 'Foto 1' },
            { url: '/images/photo2.jpg', alt: 'Foto 2' },
            { url: '/images/photo3.jpg', alt: 'Foto 3' },
          ]
        }),
        ...(type === 'AMENITIES' && {
          title: 'Dotazioni',
          items: [
            { icon: '📶', label: 'Wi‑Fi Gratuito' },
            { icon: '❄️', label: 'Aria Condizionata' },
            { icon: '🧹', label: 'Pulizia Giornaliera' },
          ]
        }),
        ...(type === 'GET_YOUR_GUIDE' && {
          title: 'GetYourGuide – Attività consigliate',
          activities: [
            { title: 'Colosseo: tour guidato', description: 'Accesso rapido con guida', imageUrl: '', link: 'https://www.getyourguide.it/' },
            { title: 'Vaticano: Musei & Cappella Sistina', description: 'Ingresso prioritario', imageUrl: '', link: 'https://www.getyourguide.it/' },
          ]
        }),
      } as any,
    };

      console.log('✅ Nuova sezione creata:', newSection);
      const updatedSections = [...sections, newSection];
      console.log('📋 Aggiornando sezioni:', { 
        oldCount: sections.length, 
        newCount: updatedSections.length,
        updatedSections: updatedSections 
      });
      
      onSectionsChange(updatedSections);
      
      // Auto-save dopo aver aggiunto una sezione
      setTimeout(() => {
        if (user && site.id) {
          console.log('💾 Avviando salvataggio automatico dopo aggiunta sezione...');
          saveProject();
        } else {
          console.log('❌ Impossibile salvare: user o site.id mancanti', { user: !!user, siteId: site.id });
        }
      }, 1000);
    } catch (error) {
      console.error('❌ Errore durante la creazione della sezione:', error);
      const errorMessage = error instanceof Error ? error.message : 
                          typeof error === 'object' ? JSON.stringify(error) : 
                          String(error);
      alert('❌ Errore durante la creazione della sezione: ' + errorMessage);
    }
  };

  const handleSectionUpdate = (sectionId: string, props: any) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId ? { ...section, props: { ...section.props, ...props } } : section
    );
    onSectionsChange(updatedSections);
  };

  const handleSectionDelete = (sectionId: string) => {
    const updatedSections = sections.filter(section => section.id !== sectionId);
    onSectionsChange(updatedSections);
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
    }
  };

  // Nuova funzione per pubblicare una sezione
  const handlePublishSection = (sectionId: string) => {
    console.log('🚀 Pubblicando sezione:', sectionId);
    const updatedSections = sections.map(section =>
      section.id === sectionId 
        ? { ...section, props: { ...section.props, isPublished: true, publishedAt: new Date().toISOString() } }
        : section
    );
    onSectionsChange(updatedSections);
    
    // Auto-save dopo la pubblicazione
    setTimeout(() => {
      if (user && site.id) {
        saveProject();
      }
    }, 1000);
  };

  // Nuova funzione per annullare la pubblicazione di una sezione
  const handleUnpublishSection = (sectionId: string) => {
    console.log('📝 Annullando pubblicazione sezione:', sectionId);
    const updatedSections = sections.map(section =>
      section.id === sectionId 
        ? { ...section, props: { ...section.props, isPublished: false, publishedAt: undefined } }
        : section
    );
    onSectionsChange(updatedSections);
    
    // Auto-save dopo l'annullamento
    setTimeout(() => {
      if (user && site.id) {
        saveProject();
      }
    }, 1000);
  };

  const availableSections: SectionType[] = ['HERO', 'ABOUT', 'SERVICES', 'GALLERY', 'TESTIMONIALS', 'CONTACT', 'PHOTO_GALLERY', 'AMENITIES', 'GET_YOUR_GUIDE'];

  return (
    <div className="h-full w-full flex flex-col relative">
      {/* Header semplificato */}
      <BuilderHeader
        layoutType={layoutType}
        theme={theme}
        onThemeChange={handleThemeChangeInternal}
        onSave={onSave}
        onPublish={onPublish}
        deviceType={deviceType}
        onDeviceChange={setDeviceType}
        saving={saving}
        showThemePanel={showThemePanel}
        setShowThemePanel={setShowThemePanel}
      />

      {/* Navigazione mobile (segment control) */}
      <div className="md:hidden sticky top-14 z-40 bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex justify-center">
          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setMobileTab('widgets')}
              className={cn(
                'px-3 py-2 text-sm font-medium flex items-center gap-1',
                mobileTab === 'widgets' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              )}
            >
              <Layers className="w-4 h-4" />
              Sezioni
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('preview')}
              className={cn(
                'px-3 py-2 text-sm font-medium border-l border-gray-200 flex items-center gap-1',
                mobileTab === 'preview' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              )}
            >
              <Eye className="w-4 h-4" />
              Anteprima
            </button>
            <button
              type="button"
              onClick={() => setShowThemePanel(true)}
              className={cn(
                'px-3 py-2 text-sm font-medium border-l border-gray-200 flex items-center gap-1',
                'bg-white text-gray-700 hover:bg-gray-50'
              )}
            >
              <Palette className="w-4 h-4" />
              Tema
            </button>
          </div>
        </div>
      </div>

      {/* Area mobile: una vista alla volta per evitare sovrapposizioni */}
      <div className={cn(
        "md:hidden flex-1 min-h-0 overflow-hidden",
        mobileTab === 'preview' ? "pb-20" : ""
      )}>
        {mobileTab === 'widgets' ? (
          <WidgetLibrary
            onAddSection={handleAddSection}
            onSectionsChange={onSectionsChange}
            availableSections={availableSections}
            maxSections={maxSections}
            currentSections={sections}
            plan={(user as any)?.plan}
            compact={false}
            showRemove
            fullPage
          />
        ) : (
          <div className="h-full overflow-y-auto">
            <CanvasArea
              sections={sections}
              onSectionsChange={onSectionsChange}
              layoutType={layoutType}
              theme={theme}
              onThemeChange={handleThemeChangeInternal}
              onSectionSelect={setSelectedSectionId}
              selectedSectionId={selectedSectionId}
              onSectionUpdate={handleSectionUpdate}
              onSectionDelete={handleSectionDelete}
              onSectionPublish={handlePublishSection}
              onSectionUnpublish={handleUnpublishSection}
              deviceType={deviceType}
            />
          </div>
        )}
      </div>

      {/* Layout desktop/tablet: 3 colonne */}
      <div className="hidden md:flex flex-1 min-h-0">
        {/* Left Sidebar - Semplificata */}
        <WidgetLibrary
          onAddSection={handleAddSection}
          onSectionsChange={onSectionsChange}
          availableSections={availableSections}
          maxSections={maxSections}
          currentSections={sections}
          plan={(user as any)?.plan}
        />

        {/* Center Canvas Area */}
        <CanvasArea
          sections={sections}
          onSectionsChange={onSectionsChange}
          layoutType={layoutType}
          theme={theme}
          onThemeChange={handleThemeChangeInternal}
          onSectionSelect={setSelectedSectionId}
          selectedSectionId={selectedSectionId}
          onSectionUpdate={handleSectionUpdate}
          onSectionDelete={handleSectionDelete}
          onSectionPublish={handlePublishSection}
          onSectionUnpublish={handleUnpublishSection}
          deviceType={deviceType}
        />
      </div>

      {/* Floating Save button su mobile solo in anteprima */}
      {mobileTab === 'preview' && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
          <div className="flex justify-end items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setMobileTab('widgets')} 
              className="bg-white border-gray-300 px-3 py-2 min-w-0"
            >
              <Layers className="w-4 h-4" />
            </Button>
            <Button 
              onClick={onSave} 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-4 py-2 min-w-0"
              data-save-button
            >
              <Save className="w-4 h-4 mr-1" />
              Salva
            </Button>
          </div>
        </div>
      )}



      {/* Notifica stato progetto integrata */}
      {saving && (
        <div className="fixed top-20 right-4 z-40">
          <div className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg shadow-md flex items-center space-x-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            <span className="text-sm">Salvando...</span>
          </div>
        </div>
      )}
    </div>
  );
}
