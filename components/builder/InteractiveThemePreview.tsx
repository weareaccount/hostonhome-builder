'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LayoutType, ThemeAccent, ThemeFont, Section } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Edit3, 
  Move, 
  Trash2, 
  Plus, 
  X,
  Type,
  Image,
  Link,
  Settings
} from 'lucide-react';

interface InteractiveThemePreviewProps {
  layoutType: LayoutType;
  theme: {
    accent: ThemeAccent;
    font: ThemeFont;
  };
  sections: Section[];
  onSectionUpdate: (sectionId: string, props: any) => void;
  onSectionDelete: (sectionId: string) => void;
  onSectionPublish: (sectionId: string) => void;
  onSectionUnpublish: (sectionId: string) => void;
  onSectionReorder: (sections: Section[]) => void;
  className?: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  readOnly?: boolean; // Nuova prop per modalità anteprima
}

// Layout Templates ottimizzati per case vacanze
const LAYOUT_STYLES = {
  ELEGANTE: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    hero: 'min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 relative overflow-hidden',
    section: 'py-16 lg:py-24',
    title: 'font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight text-white drop-shadow-lg',
    subtitle: 'text-lg sm:text-xl lg:text-2xl text-blue-100 font-medium leading-relaxed',
    card: 'bg-white rounded-2xl shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2',
    spacing: 'space-y-16 lg:space-y-24',
    button: 'px-8 py-4 bg-white text-blue-700 font-bold rounded-full hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105',
    sectionTitle: 'text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-gray-800 mb-12 lg:mb-16',
    nav: 'bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm',
    // Layout ottimizzato per case vacanze
    twoColumn: 'flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-16 lg:items-center',
    imageColumn: 'lg:order-1',
    textColumn: 'lg:order-2',
    roomCard: 'bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1',
    roomImage: 'w-full h-64 sm:h-72 bg-gradient-to-br from-gray-200 to-gray-300 object-cover',
    roomDetails: 'p-6 lg:p-8',
    roomTitle: 'text-xl lg:text-2xl font-bold text-gray-800 mb-3',
    roomDescription: 'text-gray-600 text-sm lg:text-base leading-relaxed mb-6',
    roomPrice: 'text-2xl font-bold text-blue-600',
    roomButton: 'mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all duration-300 shadow-lg transform hover:scale-105',
    roomMeta: 'flex items-center gap-4 text-sm text-gray-500 mb-4',
    roomFeature: 'flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full text-xs font-medium',
    // Stili per recensioni moderne
    reviewCard: 'bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100 hover:shadow-xl transition-all duration-300',
    reviewContent: 'text-gray-700 italic leading-relaxed mb-6 text-sm lg:text-base',
    reviewAuthor: 'flex items-center gap-3',
    reviewAvatar: 'w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg',
    reviewName: 'font-semibold text-gray-800',
    reviewStars: 'flex gap-1 text-yellow-400',
    // Stili per galleria moderna
    galleryGrid: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6',
    galleryItem: 'relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105',
    galleryImage: 'w-full h-48 sm:h-56 object-cover',
    galleryOverlay: 'absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300',
    // Stili per dotazioni moderne
    amenitiesGrid: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6',
    amenityItem: 'bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1',
    amenityIcon: 'text-3xl lg:text-4xl mb-3',
    amenityLabel: 'text-sm lg:text-base font-semibold text-gray-700'
  },
  MEDIO: {
    container: 'max-w-6xl mx-auto px-4 sm:px-6',
    hero: 'min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white relative overflow-hidden',
    section: 'py-12 lg:py-16',
    title: 'text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-gray-800',
    subtitle: 'text-base sm:text-lg lg:text-xl text-gray-600',
    card: 'bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300',
    spacing: 'space-y-12 lg:space-y-16',
    button: 'px-5 py-3 text-white font-medium rounded-lg transition-colors',
    sectionTitle: 'text-2xl sm:text-3xl lg:text-4xl font-semibold text-center text-gray-800 mb-10 lg:mb-12',
    nav: 'bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50'
  },
  ESSENZIALE: {
    container: 'max-w-5xl mx-auto px-4',
    hero: 'min-h-[80vh] flex items-center justify-center bg-white relative overflow-hidden',
    section: 'py-10 lg:py-12',
    title: 'text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-gray-900',
    subtitle: 'text-sm sm:text-base lg:text-lg text-gray-700',
    card: 'bg-white rounded-none border border-gray-300 hover:border-gray-400 transition-colors',
    spacing: 'space-y-10 lg:space-y-12',
    button: 'px-5 py-3 bg-gray-900 text-white font-medium rounded-none hover:bg-gray-800 transition-colors',
    sectionTitle: 'text-xl sm:text-2xl lg:text-3xl font-bold text-center text-gray-900 mb-8 lg:mb-10',
    nav: 'bg-white border-b border-gray-300 sticky top-0 z-50'
  }
};

// Accent Colors semplificati
const ACCENT_COLORS = {
  BLUE: {
    primary: 'from-blue-600 to-blue-700',
    secondary: 'bg-blue-50 text-blue-900',
    accent: 'text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700'
  },
  GREEN: {
    primary: 'from-green-600 to-green-700',
    secondary: 'bg-green-50 text-green-900',
    accent: 'text-green-600',
    button: 'bg-green-600 hover:bg-green-700'
  },
  RED: {
    primary: 'from-red-600 to-red-700',
    secondary: 'bg-red-50 text-red-900',
    accent: 'text-red-600',
    button: 'bg-red-600 hover:bg-red-700'
  },
  AMBER: {
    primary: 'from-amber-600 to-amber-700',
    secondary: 'bg-amber-50 text-amber-900',
    accent: 'text-amber-600',
    button: 'bg-amber-600 hover:bg-amber-700'
  },
  VIOLET: {
    primary: 'from-violet-600 to-violet-700',
    secondary: 'bg-violet-50 text-violet-900',
    accent: 'text-violet-600',
    button: 'bg-violet-600 hover:bg-violet-700'
  }
};

// Font Classes semplificati
const FONT_CLASSES = {
  INTER: 'font-inter',
  POPPINS: 'font-poppins',
  MONTSERRAT: 'font-montserrat',
  WORKSANS: 'font-worksans',
  DMSANS: 'font-dmsans'
};

// Font families for inline styles fallback
const FONT_FAMILIES = {
  INTER: 'Inter, sans-serif',
  POPPINS: 'Poppins, sans-serif',
  MONTSERRAT: 'Montserrat, sans-serif',
  WORKSANS: 'Work Sans, sans-serif',
  DMSANS: 'DM Sans, sans-serif'
};

// Etichette leggibili per i tipi di sezione
const SECTION_LABELS: Record<string, string> = {
  HERO: 'HERO',
  ABOUT: 'ABOUT',
  SERVICES: 'ALLOGGI',
  GALLERY: 'SERVIZIO',
  TESTIMONIALS: 'RECENSIONI',
  CONTACT: 'CONTATTI',
  PHOTO_GALLERY: 'GALLERIA FOTO',
  AMENITIES: 'DOTAZIONI',
  GET_YOUR_GUIDE: 'GET_YOUR_GUIDE',
};
// Libreria di icone/emoji per Dotazioni (selezionabili dagli utenti)
const AMENITY_ICON_LIBRARY: string[] = [
  '📶','❄️','🚿','🧺','🍳','🅿️','🐶','🚭','🛜','🧯','🔒','🔌',
  '🧴','🧼','🧻','🛏️','🍼','🧊','☕','🍽️','📺','🎵','🛗','🏊','🏋️','🚴','🌡️','🧖','🧹','🧽'
];

// Inline Editor semplificato
const InlineEditor = ({ 
  section, 
  onUpdate, 
  onClose,
  accentColor
}: { 
  section: Section; 
  onUpdate: (props: any) => void; 
  onClose: () => void;
  accentColor: any;
}) => {
  const sectionProps = section.props as any;
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  // Ricerca per la libreria icone delle Dotazioni
  const [amenityIconQuery, setAmenityIconQuery] = useState('');

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue || '');
  };

  const handleSave = (field: string) => {
    try {
      const updatedProps = {
        ...sectionProps,
        [field]: tempValue
      };
      
      if (onUpdate) {
        onUpdate(updatedProps);
      }
      
      Object.assign(sectionProps, updatedProps);
      setEditingField(null);
      
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
  };

  const renderEditableField = (field: string, label: string, currentValue: string, type: 'text' | 'textarea' = 'text') => {
    if (editingField === field) {
      return (
        <div className="space-y-3">
          {type === 'textarea' ? (
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full px-4 py-3 text-base border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 resize-none"
              rows={4}
              placeholder={label}
            />
          ) : (
            <Input
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full px-4 py-3 text-base border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              placeholder={label}
            />
          )}
          <div className="flex items-center space-x-3">
            <Button 
              size="sm" 
              onClick={() => handleSave(field)} 
              className={cn("text-white px-6", accentColor.button)}
            >
              💾 Salva
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCancel}
              className="px-6"
            >
              ✕ Annulla
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="group relative">
        <div className="cursor-pointer hover:bg-blue-50 p-3 rounded-lg transition-colors border-2 border-transparent hover:border-blue-200">
          {type === 'textarea' ? (
            <p className="text-base leading-relaxed">{currentValue || label}</p>
          ) : (
            <h2 className="text-2xl font-semibold">{currentValue || label}</h2>
          )}
        </div>
        <button
          onClick={() => handleEdit(field, currentValue)}
          className={cn("absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-white border-2 border-white rounded-lg p-2 transition-all shadow-lg", accentColor.button)}
          title={`Modifica ${label}`}
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <div className={cn("absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 text-white text-xs px-2 py-1 rounded-full transition-all", accentColor.button)}>
          ✏️ Modifica
        </div>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        // Chiudi solo se si clicca sul backdrop, non sul contenuto
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-4 border-blue-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header prominente */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Edit3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Modifica {SECTION_LABELS[section.type] || section.type}</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Personalizza il contenuto della tua sezione
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        
        {/* Contenuto del form */}
        <div className="p-8 space-y-6">
          {section.type === 'HERO' && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">🏷️ Titolo Principale</h3>
                {renderEditableField('title', 'Titolo principale', sectionProps.title)}
                <p className="text-sm text-blue-600 mt-2">Il titolo principale che apparirà in grande nella sezione hero</p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3">📝 Sottotitolo</h3>
                {renderEditableField('subtitle', 'Sottotitolo descrittivo', sectionProps.subtitle)}
                <p className="text-sm text-green-600 mt-2">Descrizione breve sotto il titolo principale</p>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">🔘 Call to Action</h3>
                {renderEditableField('ctaText', 'Scopri di più', sectionProps.ctaText)}
                <p className="text-sm text-purple-600 mt-2">Testo del pulsante principale per guidare i visitatori</p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-800 mb-3">🎨 Colore del Bottone Principale</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'BLUE', label: 'Blu', color: 'bg-blue-600' },
                    { key: 'GREEN', label: 'Verde', color: 'bg-green-600' },
                    { key: 'RED', label: 'Rosso', color: 'bg-red-600' },
                    { key: 'VIOLET', label: 'Viola', color: 'bg-violet-600' }
                  ].map((color) => (
                    <button
                      key={color.key}
                      onClick={() => onUpdate({ primaryButtonColor: color.key })}
                      className={cn(
                        "px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all",
                        sectionProps.primaryButtonColor === color.key
                          ? "border-gray-800 text-gray-800"
                          : "border-gray-300 text-gray-600 hover:border-gray-400"
                      )}
                    >
                      <div className={cn("w-4 h-4 rounded-full mx-auto mb-1", color.color)}></div>
                      {color.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-pink-800 mb-3">🎨 Colore del Bottone Secondario</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'BLUE', label: 'Blu', color: 'bg-blue-600' },
                    { key: 'GREEN', label: 'Verde', color: 'bg-green-600' },
                    { key: 'RED', label: 'Rosso', color: 'bg-red-600' },
                    { key: 'VIOLET', label: 'Viola', color: 'bg-violet-600' }
                  ].map((color) => (
                    <button
                      key={color.key}
                      onClick={() => onUpdate({ secondaryButtonColor: color.key })}
                      className={cn(
                        "px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all",
                        sectionProps.secondaryButtonColor === color.key
                          ? "border-gray-800 text-gray-800"
                          : "border-gray-300 text-gray-600 hover:border-gray-400"
                      )}
                    >
                      <div className={cn("w-4 h-4 rounded-full mx-auto mb-1", color.color)}></div>
                      {color.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-800 mb-3">🖼️ Immagine di Sfondo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL immagine di sfondo</label>
                    <input
                      type="text"
                      value={sectionProps.backgroundImage || ''}
                      onChange={(e) => onUpdate({ backgroundImage: e.target.value })}
                      placeholder="https://.../background.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        id="hero-background-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = (e.target.files || [])[0]
                          if (!file) return
                          const reader = new FileReader()
                          reader.onload = () => {
                            onUpdate({ backgroundImage: String(reader.result) })
                          }
                          reader.readAsDataURL(file)
                          e.currentTarget.value = ''
                        }}
                      />
                      <button
                        onClick={() => document.getElementById('hero-background-upload')?.click()}
                        className={cn('px-3 py-2 rounded-lg text-white text-sm', accentColor.button)}
                      >
                        ⬆️ Carica immagine dal PC
                      </button>
                      {sectionProps.backgroundImage && (
                        <button
                          onClick={() => onUpdate({ backgroundImage: '' })}
                          className="px-3 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600"
                        >
                          🗑️ Rimuovi
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg bg-white p-2 flex items-center justify-center min-h-[120px]">
                    {sectionProps.backgroundImage ? (
                      <img src={sectionProps.backgroundImage} alt="Background Hero" className="max-h-32 rounded object-cover" />
                    ) : (
                      <div className="text-gray-400 text-sm text-center">
                        <div className="text-2xl mb-2">🖼️</div>
                        <p>Nessuna immagine</p>
                        <p className="text-xs">Sarà usato il gradiente blu</p>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-orange-600 mt-2">Immagine di sfondo per la sezione hero (opzionale)</p>
              </div>
            </>
          )}
          
          {section.type === 'ABOUT' && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">🏷️ Titolo Sezione</h3>
                {renderEditableField('title', 'Chi Siamo', sectionProps.title)}
                <p className="text-sm text-blue-600 mt-2">Il titolo della sezione About</p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3">📝 Contenuto Principale</h3>
                {renderEditableField('content', 'Descrizione dell\'azienda', sectionProps.content, 'textarea')}
                <p className="text-sm text-green-600 mt-2">Racconta la storia della tua azienda o attività</p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">🖼️ Immagine</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL immagine</label>
                    <input
                      type="text"
                      value={sectionProps.image || ''}
                      onChange={(e) => onUpdate({ image: e.target.value })}
                      placeholder="https://.../about.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        id="about-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = (e.target.files || [])[0]
                          if (!file) return
                          const reader = new FileReader()
                          reader.onload = () => {
                            onUpdate({ image: String(reader.result) })
                          }
                          reader.readAsDataURL(file)
                          e.currentTarget.value = ''
                        }}
                      />
                      <button
                        onClick={() => document.getElementById('about-image-upload')?.click()}
                        className={cn('px-3 py-2 rounded-lg text-white text-sm', accentColor.button)}
                      >
                        ⬆️ Carica immagine dal PC
                      </button>
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mt-3 mb-1">Alt (facoltativo)</label>
                    <input
                      type="text"
                      value={sectionProps.imageAlt || ''}
                      onChange={(e) => onUpdate({ imageAlt: e.target.value })}
                      placeholder="Descrizione immagine"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="border border-gray-200 rounded-lg bg-white p-2 flex items-center justify-center min-h-[180px]">
                    {sectionProps.image ? (
                      <img src={sectionProps.image} alt={sectionProps.imageAlt || 'About'} className="max-h-56 rounded" />
                    ) : (
                      <div className="text-gray-400 text-sm">Nessuna immagine</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-800 mb-3">🔘 Bottone Call-to-Action</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Testo del bottone</label>
                    {renderEditableField('ctaText', 'MORE ABOUT US', sectionProps.ctaText)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Colore del bottone</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'BLUE', label: 'Blu', color: 'bg-blue-600' },
                        { key: 'GREEN', label: 'Verde', color: 'bg-green-600' },
                        { key: 'RED', label: 'Rosso', color: 'bg-red-600' },
                        { key: 'VIOLET', label: 'Viola', color: 'bg-violet-600' }
                      ].map((color) => (
                        <button
                          key={color.key}
                          onClick={() => onUpdate({ primaryButtonColor: color.key })}
                          className={cn(
                            "px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all",
                            sectionProps.primaryButtonColor === color.key
                              ? "border-gray-800 text-gray-800"
                              : "border-gray-300 text-gray-600 hover:border-gray-400"
                          )}
                        >
                          <div className={cn("w-4 h-4 rounded-full mx-auto mb-1", color.color)}></div>
                          {color.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {section.type === 'SERVICES' && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">🏷️ Titolo Servizi</h3>
                {renderEditableField('title', 'I Nostri Servizi', sectionProps.title)}
                <p className="text-sm text-blue-600 mt-2">Il titolo della sezione servizi</p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3">🏨 Gestione Alloggi</h3>
                <div className="space-y-4">
                  {(sectionProps.services || []).map((service: any, index: number) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-800">Alloggio {index + 1}</h4>
                        <button
                          onClick={() => {
                            const services = [...sectionProps.services];
                            services.splice(index, 1);
                            onUpdate({ services });
                          }}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          🗑️ Rimuovi
                        </button>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Camera</label>
                        <input
                          type="text"
                          value={service.title || ''}
                          onChange={(e) => {
                            const services = [...sectionProps.services];
                            services[index] = { ...service, title: e.target.value };
                            onUpdate({ services });
                          }}
                          placeholder="Camera Matrimoniale"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                        <textarea
                          value={service.description || ''}
                          onChange={(e) => {
                            const services = [...sectionProps.services];
                            services[index] = { ...service, description: e.target.value };
                            onUpdate({ services });
                          }}
                          placeholder="Descrizione della camera..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>

                      {/* Immagine alloggio con upload dal PC */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">URL immagine</label>
                          <input
                            type="text"
                            value={service.image || ''}
                            onChange={(e) => {
                              const services = [...sectionProps.services];
                              services[index] = { ...service, image: e.target.value };
                              onUpdate({ services });
                            }}
                            placeholder="https://.../camera.jpg"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              id={`services-image-upload-${index}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = (e.target.files || [])[0]
                                if (!file) return
                                const reader = new FileReader()
                                reader.onload = () => {
                                  const services = [...sectionProps.services];
                                  services[index] = { ...service, image: String(reader.result) };
                                  onUpdate({ services });
                                }
                                reader.readAsDataURL(file)
                                e.currentTarget.value = ''
                              }}
                            />
                            <button
                              onClick={() => document.getElementById(`services-image-upload-${index}`)?.click()}
                              className={cn('px-3 py-2 rounded-lg text-white text-sm', accentColor.button)}
                            >
                              ⬆️ Carica immagine dal PC
                            </button>
                          </div>
                          <label className="block text-sm font-medium text-gray-700 mt-3 mb-1">Alt (facoltativo)</label>
                          <input
                            type="text"
                            value={service.imageAlt || ''}
                            onChange={(e) => {
                              const services = [...sectionProps.services];
                              services[index] = { ...service, imageAlt: e.target.value };
                              onUpdate({ services });
                            }}
                            placeholder="Descrizione immagine"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="border border-gray-200 rounded-lg bg-white p-2 flex items-center justify-center min-h-[140px]">
                          {service?.image ? (
                            <img src={service.image} alt={service.imageAlt || service.title || 'Alloggio'} className="max-h-40 rounded" />
                          ) : (
                            <div className="text-gray-400 text-sm">Nessuna immagine</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Ospiti</label>
                          <input
                            type="text"
                            value={service.guests || ''}
                            onChange={(e) => {
                              const services = [...sectionProps.services];
                              services[index] = { ...service, guests: e.target.value };
                              onUpdate({ services });
                            }}
                            placeholder="2"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Dimensioni</label>
                          <input
                            type="text"
                            value={service.size || ''}
                            onChange={(e) => {
                              const services = [...sectionProps.services];
                              services[index] = { ...service, size: e.target.value };
                              onUpdate({ services });
                            }}
                            placeholder="22m²"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Prezzo €</label>
                          <input
                            type="text"
                            value={service.price || ''}
                            onChange={(e) => {
                              const services = [...sectionProps.services];
                              services[index] = { ...service, price: e.target.value };
                              onUpdate({ services });
                            }}
                            placeholder="95"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Icona</label>
                          <input
                            type="text"
                            value={service.icon || ''}
                            onChange={(e) => {
                              const services = [...sectionProps.services];
                              services[index] = { ...service, icon: e.target.value };
                              onUpdate({ services });
                            }}
                            placeholder="🏠"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => {
                      const services = [...(sectionProps.services || [])];
                      services.push({
                        title: 'Nuova Camera',
                        description: 'Descrizione della camera...',
                        icon: '🏠',
                        guests: '2',
                        size: '20m²',
                        price: '80'
                      });
                      onUpdate({ services });
                    }}
                    className={cn("w-full py-3 text-white rounded-lg font-medium", accentColor.button)}
                  >
                    ➕ Aggiungi Nuovo Alloggio
                  </button>
                </div>
                <p className="text-sm text-green-600 mt-2">Modifica i tuoi alloggi e camere disponibili</p>
              </div>
            </>
          )}
          
          {section.type === 'PHOTO_GALLERY' && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">🏷️ Titolo Galleria</h3>
                {renderEditableField('title', 'Galleria Fotografica', sectionProps.title)}
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3">🖼️ Foto</h3>
                <div className="space-y-4">
                  {(sectionProps.photos || []).map((photo: any, index: number) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL immagine</label>
                        <input
                          type="text"
                          value={photo.url || ''}
                          onChange={(e) => {
                            const photos = [...(sectionProps.photos || [])]
                            photos[index] = { ...photo, url: e.target.value }
                            onUpdate({ photos })
                          }}
                          placeholder="https://.../foto.jpg"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alt (facoltativo)</label>
                        <input
                          type="text"
                          value={photo.alt || ''}
                          onChange={(e) => {
                            const photos = [...(sectionProps.photos || [])]
                            photos[index] = { ...photo, alt: e.target.value }
                            onUpdate({ photos })
                          }}
                          placeholder="Descrizione immagine"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2 text-right">
                        <button
                          onClick={() => {
                            const photos = [...(sectionProps.photos || [])]
                            photos.splice(index, 1)
                            onUpdate({ photos })
                          }}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          🗑️ Rimuovi foto
                        </button>
                      </div>
                    </div>
                  ))}
                  {/* Upload da PC */}
                  <div className="flex items-center gap-3">
                    <input
                      id="photo-upload-input"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        if (files.length === 0) return
                        const readers = files.map(file => new Promise<string>((resolve) => {
                          const reader = new FileReader()
                          reader.onload = () => resolve(String(reader.result))
                          reader.readAsDataURL(file)
                        }))
                        Promise.all(readers).then(urls => {
                          const photos = [...(sectionProps.photos || [])]
                          urls.forEach(url => photos.push({ url }))
                          onUpdate({ photos })
                        })
                        // reset input
                        e.currentTarget.value = ''
                      }}
                    />
                    <button
                      onClick={() => document.getElementById('photo-upload-input')?.click()}
                      className={cn("px-4 py-2 rounded-lg text-white", accentColor.button)}
                    >
                      ⬆️ Aggiungi foto dal PC
                    </button>
                    <span className="text-xs text-gray-600">Suggerimento: puoi caricare più file insieme</span>
                  </div>
                  <button
                    onClick={() => {
                      const photos = [...(sectionProps.photos || []), { url: '', alt: '' }]
                      onUpdate({ photos })
                    }}
                    className={cn("w-full py-3 text-white rounded-lg font-medium", accentColor.button)}
                  >
                    ➕ Aggiungi Foto
                  </button>
                </div>
              </div>
            </>
          )}

          {section.type === 'AMENITIES' && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">🏷️ Titolo Dotazioni</h3>
                {renderEditableField('title', 'Dotazioni', sectionProps.title)}
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3">🧰 Elementi</h3>
                <div className="space-y-4">
                  {(sectionProps.items || []).map((item: any, index: number) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Icona (emoji)</label>
                        <input
                          type="text"
                          value={item.icon || ''}
                          onChange={(e) => {
                            const items = [...(sectionProps.items || [])]
                            items[index] = { ...item, icon: e.target.value }
                            onUpdate({ items })
                          }}
                          placeholder="📶"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {/* Libreria icone migliorata */}
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600 inline-flex items-center gap-1">
                              <span>🎛️</span>
                              <span>Libreria icone</span>
                            </span>
                            <input
                              value={amenityIconQuery}
                              onChange={(e) => setAmenityIconQuery(e.target.value)}
                              placeholder="Cerca..."
                              className="h-7 text-xs px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            />
                          </div>
                          <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                            <div className="flex flex-wrap gap-3">
                              {(AMENITY_ICON_LIBRARY.filter(e => e.includes(amenityIconQuery.trim()))).map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => {
                                    const items = [...(sectionProps.items || [])]
                                    items[index] = { ...item, icon: emoji }
                                    onUpdate({ items })
                                  }}
                                  className={cn(
                                    'h-11 w-11 rounded-xl border text-xl flex items-center justify-center bg-white transition-all',
                                    'hover:bg-blue-50 hover:border-blue-300',
                                    'hover:shadow-sm hover:scale-[1.03]',
                                    item.icon === emoji ? 'border-blue-500 ring-1 ring-blue-200' : 'border-gray-200'
                                  )}
                                  title={emoji}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Etichetta</label>
                        <input
                          type="text"
                          value={item.label || ''}
                          onChange={(e) => {
                            const items = [...(sectionProps.items || [])]
                            items[index] = { ...item, label: e.target.value }
                            onUpdate({ items })
                          }}
                          placeholder="Wi‑Fi Gratuito"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-2 text-right">
                        <button
                          onClick={() => {
                            const items = [...(sectionProps.items || [])]
                            items.splice(index, 1)
                            onUpdate({ items })
                          }}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          🗑️ Rimuovi
                        </button>
                      </div>
                    </div>
                  ))}
                  {/* Libreria per aggiungere nuovi elementi velocemente */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-blue-800 mb-2">Aggiungi dalla libreria</div>
                    <div className="flex flex-wrap gap-3">
                      {AMENITY_ICON_LIBRARY.map((emoji) => (
                        <button
                          key={`add-${emoji}`}
                          type="button"
                          onClick={() => {
                            const items = [...(sectionProps.items || []), { icon: emoji, label: 'Nuova dotazione' }]
                            onUpdate({ items })
                          }}
                          className="h-11 w-11 rounded-xl border border-blue-200 text-xl flex items-center justify-center bg-white hover:bg-blue-50 hover:border-blue-400 shadow-sm"
                          title={`Aggiungi ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const items = [...(sectionProps.items || []), { icon: '✔️', label: 'Nuova dotazione' }]
                      onUpdate({ items })
                    }}
                    className={cn("w-full py-3 text-white rounded-lg font-medium", accentColor.button)}
                  >
                    ➕ Aggiungi Dotazione
                  </button>
                </div>
              </div>
            </>
          )}
          
          {section.type === 'GET_YOUR_GUIDE' && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">🏷️ Titolo Widget</h3>
                {renderEditableField('title', 'GetYourGuide – Attività consigliate', sectionProps.title)}
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3">🧭 Attività</h3>
                <div className="space-y-4">
                  {(sectionProps.activities || []).map((act: any, index: number) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titolo</label>
                        <input
                          type="text"
                          value={act.title || ''}
                          onChange={(e) => {
                            const activities = [...(sectionProps.activities || [])]
                            activities[index] = { ...act, title: e.target.value }
                            onUpdate({ activities })
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Colosseo: tour guidato"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Link GetYourGuide</label>
                        <input
                          type="text"
                          value={act.link || ''}
                          onChange={(e) => {
                            const activities = [...(sectionProps.activities || [])]
                            activities[index] = { ...act, link: e.target.value }
                            onUpdate({ activities })
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://www.getyourguide.it/..."
                        />
                      </div>
                      {/* Immagine esperienza */}
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Immagine (URL)</label>
                          <input
                            type="text"
                            value={act.imageUrl || ''}
                            onChange={(e) => {
                              const activities = [...(sectionProps.activities || [])]
                              activities[index] = { ...act, imageUrl: e.target.value }
                              onUpdate({ activities })
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://.../foto.jpg"
                          />
                          <div className="mt-2">
                            <input
                              id={`gyg-upload-${index}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = (e.target.files || [])[0]
                                if (!file) return
                                const reader = new FileReader()
                                reader.onload = () => {
                                  const activities = [...(sectionProps.activities || [])]
                                  activities[index] = { ...act, imageUrl: String(reader.result) }
                                  onUpdate({ activities })
                                }
                                reader.readAsDataURL(file)
                                e.currentTarget.value = ''
                              }}
                            />
                            <button
                              onClick={() => document.getElementById(`gyg-upload-${index}`)?.click()}
                              className={cn("px-3 py-2 rounded-lg text-white text-sm", accentColor.button)}
                            >
                              ⬆️ Carica immagine dal PC
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-center border border-gray-200 rounded-lg p-2 bg-gray-50 min-h-[120px]">
                          {act?.imageUrl ? (
                            <img src={act.imageUrl} alt={act.title || 'Attività'} className="max-h-40 rounded" />
                          ) : (
                            <span className="text-gray-400 text-sm">Nessuna immagine</span>
                          )}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                        <textarea
                          value={act.description || ''}
                          onChange={(e) => {
                            const activities = [...(sectionProps.activities || [])]
                            activities[index] = { ...act, description: e.target.value }
                            onUpdate({ activities })
                          }}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2 text-right">
                        <button
                          onClick={() => {
                            const activities = [...(sectionProps.activities || [])]
                            activities.splice(index, 1)
                            onUpdate({ activities })
                          }}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          🗑️ Rimuovi attività
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const activities = [...(sectionProps.activities || []), { title: 'Nuova attività', link: 'https://www.getyourguide.it/' }]
                      onUpdate({ activities })
                    }}
                    className={cn("w-full py-3 text-white rounded-lg font-medium", accentColor.button)}
                  >
                    ➕ Aggiungi Attività
                  </button>
                </div>
              </div>
            </>
          )}
          
          {section.type === 'GALLERY' && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">🏷️ Titolo Servizio</h3>
                {renderEditableField('title', 'Around The Hotel', sectionProps.title)}
                <p className="text-sm text-blue-600 mt-2">Il titolo della sezione servizi</p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3">🎯 Gestione Servizi</h3>
                <div className="space-y-4">
                  {(sectionProps.services || []).map((service: any, index: number) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-800">Servizio {index + 1}</h4>
                        <button
                          onClick={() => {
                            const services = [...sectionProps.services];
                            services.splice(index, 1);
                            onUpdate({ services });
                          }}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          🗑️ Rimuovi
                        </button>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Servizio</label>
                        <input
                          type="text"
                          value={service.title || ''}
                          onChange={(e) => {
                            const services = [...sectionProps.services];
                            services[index] = { ...service, title: e.target.value };
                            onUpdate({ services });
                          }}
                          placeholder="Gym"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Icona</label>
                        <input
                          type="text"
                          value={service.icon || ''}
                          onChange={(e) => {
                            const services = [...sectionProps.services];
                            services[index] = { ...service, icon: e.target.value };
                            onUpdate({ services });
                          }}
                          placeholder="💪"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {/* Immagine servizio con upload */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">URL immagine</label>
                          <input
                            type="text"
                            value={service.image || ''}
                            onChange={(e) => {
                              const services = [...sectionProps.services];
                              services[index] = { ...service, image: e.target.value };
                              onUpdate({ services });
                            }}
                            placeholder="https://.../servizio.jpg"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              id={`gallery-image-upload-${index}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = (e.target.files || [])[0]
                                if (!file) return
                                const reader = new FileReader()
                                reader.onload = () => {
                                  const services = [...sectionProps.services];
                                  services[index] = { ...service, image: String(reader.result) };
                                  onUpdate({ services });
                                }
                                reader.readAsDataURL(file)
                                e.currentTarget.value = ''
                              }}
                            />
                            <button
                              onClick={() => document.getElementById(`gallery-image-upload-${index}`)?.click()}
                              className={cn('px-3 py-2 rounded-lg text-white text-sm', accentColor.button)}
                            >
                              ⬆️ Carica immagine dal PC
                            </button>
                          </div>
                          <label className="block text-sm font-medium text-gray-700 mt-3 mb-1">Alt (facoltativo)</label>
                          <input
                            type="text"
                            value={service.imageAlt || ''}
                            onChange={(e) => {
                              const services = [...sectionProps.services];
                              services[index] = { ...service, imageAlt: e.target.value };
                              onUpdate({ services });
                            }}
                            placeholder="Descrizione immagine"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="border border-gray-200 rounded-lg bg-white p-2 flex items-center justify-center min-h-[140px]">
                          {service?.image ? (
                            <img src={service.image} alt={service.imageAlt || service.title || 'Servizio'} className="max-h-40 rounded" />
                          ) : (
                            <div className="text-gray-400 text-sm">Nessuna immagine</div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Elementi (max 5)</label>
                        <div className="space-y-2">
                          {(service.features || []).map((feature: string, featureIndex: number) => (
                            <div key={featureIndex} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={feature}
                                onChange={(e) => {
                                  const services = [...sectionProps.services];
                                  const features = [...(services[index].features || [])];
                                  features[featureIndex] = e.target.value;
                                  services[index] = { ...service, features };
                                  onUpdate({ services });
                                }}
                                placeholder="Elemento"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                onClick={() => {
                                  const services = [...sectionProps.services];
                                  const features = [...(services[index].features || [])];
                                  features.splice(featureIndex, 1);
                                  services[index] = { ...service, features };
                                  onUpdate({ services });
                                }}
                                className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          {(service.features || []).length < 5 && (
                            <button
                              onClick={() => {
                                const services = [...sectionProps.services];
                                const features = [...(services[index].features || []), 'Nuovo elemento'];
                                services[index] = { ...service, features };
                                onUpdate({ services });
                              }}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              ➕ Aggiungi elemento
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => {
                      const services = [...(sectionProps.services || []), {
                        title: 'Nuovo Servizio',
                        icon: '🆕',
                        features: ['Elemento 1', 'Elemento 2', 'Elemento 3']
                      }];
                      onUpdate({ services });
                    }}
                    className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Aggiungi Nuova Attività
                  </button>
                </div>
                <p className="text-sm text-green-600 mt-2">Modifica le attività e i tour disponibili</p>
              </div>
            </>
          )}
          
          {section.type === 'TESTIMONIALS' && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">🏷️ Titolo Sezione</h3>
                {renderEditableField('title', 'Recensioni', sectionProps.title)}
                <p className="text-sm text-blue-600 mt-2">Il titolo della sezione recensioni</p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3">💬 Gestione Recensioni</h3>
                <div className="space-y-4">
                  {(sectionProps.testimonials || []).map((testimonial: any, index: number) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-800">Recensione {index + 1}</h4>
                        <button
                          onClick={() => {
                            const testimonials = [...sectionProps.testimonials];
                            testimonials.splice(index, 1);
                            onUpdate({ testimonials });
                          }}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          🗑️ Rimuovi
                        </button>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Cliente</label>
                        <input
                          type="text"
                          value={testimonial.name || ''}
                          onChange={(e) => {
                            const testimonials = [...sectionProps.testimonials];
                            testimonials[index] = { ...testimonial, name: e.target.value };
                            onUpdate({ testimonials });
                          }}
                          placeholder="Matteo"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Recensione</label>
                        <textarea
                          value={testimonial.content || ''}
                          onChange={(e) => {
                            const testimonials = [...sectionProps.testimonials];
                            testimonials[index] = { ...testimonial, content: e.target.value };
                            onUpdate({ testimonials });
                          }}
                          placeholder="Camera davvero confortevole ed elegante..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Avatar (emoji)</label>
                        <input
                          type="text"
                          value={testimonial.avatar || ''}
                          onChange={(e) => {
                            const testimonials = [...sectionProps.testimonials];
                            testimonials[index] = { ...testimonial, avatar: e.target.value };
                            onUpdate({ testimonials });
                          }}
                          placeholder="👨‍💼"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => {
                      const testimonials = [...(sectionProps.testimonials || [])];
                      testimonials.push({
                        name: 'Nuovo Cliente',
                        content: 'Ottima esperienza, consigliatissimo!',
                        avatar: '😊'
                      });
                      onUpdate({ testimonials });
                    }}
                    className={cn("w-full py-3 text-white rounded-lg font-medium", accentColor.button)}
                  >
                    ➕ Aggiungi Nuova Recensione
                  </button>
                </div>
                <p className="text-sm text-green-600 mt-2">Modifica le recensioni dei tuoi clienti</p>
              </div>
            </>
          )}
          
          {section.type === 'CONTACT' && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">🏷️ Titolo Contatti</h3>
                {renderEditableField('title', 'Contattaci', sectionProps.title)}
                <p className="text-sm text-blue-600 mt-2">Il titolo della sezione contatti</p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3">📧 Email</h3>
                {renderEditableField('email', 'info@example.com', sectionProps.email)}
                <p className="text-sm text-green-600 mt-2">Email principale per i contatti</p>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">📱 Telefono</h3>
                {renderEditableField('phone', '+39 123 456 789', sectionProps.phone)}
                <p className="text-sm text-purple-600 mt-2">Numero di telefono principale</p>
              </div>
            </>
          )}
        </div>

        {/* Footer con istruzioni */}
        <div className="bg-gray-50 p-6 rounded-b-xl border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 bg-blue-100 px-4 py-2 rounded-lg">
              <span className="text-blue-600">💡</span>
              <p className="text-sm text-blue-800 font-medium">
                <strong>Suggerimento:</strong> Clicca sui campi per modificarli
              </p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="px-6 py-2"
              >
                Chiudi
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Section Component semplificato
const SectionComponent = ({
  section, 
  layoutStyle, 
  accentColor, 
  onEdit, 
  onDelete,
  onPublish,
  onUnpublish,
  deviceType,
  layoutType,
  onSectionUpdate,
  readOnly = false
}: {
  section: Section; 
  layoutStyle: any; 
  accentColor: any; 
  onEdit: () => void; 
  onDelete: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  layoutType: LayoutType;
  onSectionUpdate: (sectionId: string, props: any) => void;
  readOnly?: boolean;
}) => {
  const sectionProps = section.props as any;
  const [editingService, setEditingService] = useState<number | null>(null);
  const [editingFeature, setEditingFeature] = useState<{serviceIndex: number, featureIndex: number} | null>(null);
  const [tempServiceTitle, setTempServiceTitle] = useState('');
  const [tempFeature, setTempFeature] = useState('');
  // Carousel state for photo gallery
  const [galleryIndex, setGalleryIndex] = useState(0);

  const handleEditService = (serviceIndex: number, currentTitle: string) => {
    setEditingService(serviceIndex);
    setTempServiceTitle(currentTitle);
  };

  const handleSaveService = (serviceIndex: number) => {
    const updatedServices = [...(sectionProps.services || [])];
    updatedServices[serviceIndex] = {
      ...updatedServices[serviceIndex],
      title: tempServiceTitle
    };
    
    onSectionUpdate(section.id, {
      ...sectionProps,
      services: updatedServices
    });
    
    setEditingService(null);
  };

  const handleEditFeature = (serviceIndex: number, featureIndex: number, currentFeature: string) => {
    setEditingFeature({ serviceIndex, featureIndex });
    setTempFeature(currentFeature);
  };

  const handleSaveFeature = (serviceIndex: number, featureIndex: number) => {
    const updatedServices = [...(sectionProps.services || [])];
    const updatedFeatures = [...(updatedServices[serviceIndex].features || [])];
    updatedFeatures[featureIndex] = tempFeature;
    
    updatedServices[serviceIndex] = {
      ...updatedServices[serviceIndex],
      features: updatedFeatures
    };
    
    onSectionUpdate(section.id, {
      ...sectionProps,
      services: updatedServices
    });
    
    setEditingFeature(null);
  };

  const renderSectionContent = () => {
    switch (section.type) {
      case 'HERO':
        return (
          <div className={cn(layoutStyle.hero, "relative overflow-hidden")}>
            {/* Sfondo con immagine personalizzabile o gradiente */}
            {sectionProps.backgroundImage ? (
              <>
                <div className="absolute inset-0">
                  <img 
                    src={sectionProps.backgroundImage} 
                    alt="Sfondo Hero" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/50"></div>
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800"></div>
            )}
            
            {/* Pattern decorativo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full opacity-20"></div>
              <div className="absolute bottom-20 right-20 w-24 h-24 bg-white rounded-full opacity-15"></div>
              <div className="absolute top-1/2 right-10 w-16 h-16 bg-white rounded-full opacity-10"></div>
            </div>
            
            {/* Contenuto principale */}
            <div className={cn("relative z-10 text-center text-white", deviceType === 'mobile' ? 'px-4' : 'px-6')}>
              <div className={cn("max-w-4xl mx-auto", deviceType === 'mobile' ? 'space-y-6' : 'space-y-8')}>
                {/* Badge superiore */}
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                  <span className="text-yellow-300">⭐</span>
                  <span className={cn("font-medium text-white", deviceType === 'mobile' ? 'text-sm' : 'text-base')}>
                    Case Vacanze nel Cuore di Roma
                  </span>
                </div>
                
                {/* Titolo principale */}
                <h1 className={cn(
                  "font-bold leading-tight text-white drop-shadow-2xl",
                  deviceType === 'mobile' ? 'text-3xl' : 
                  deviceType === 'tablet' ? 'text-4xl lg:text-5xl' : 
                  'text-4xl sm:text-5xl lg:text-6xl'
                )}>
                  {sectionProps.title || 'Benvenuti al San Vito Suites'}
                </h1>
                
                {/* Sottotitolo */}
                <p className={cn(
                  "text-white/90 font-medium leading-relaxed max-w-2xl mx-auto drop-shadow-lg",
                  deviceType === 'mobile' ? 'text-base' : 'text-lg sm:text-xl lg:text-2xl'
                )}>
                  {sectionProps.subtitle || 'Camere accoglienti e moderne nel cuore di Roma'}
                </p>
                
                {/* Call to action buttons */}
                <div className={cn(
                  "flex items-center justify-center gap-4 z-20 relative",
                  deviceType === 'mobile' ? 'flex-col space-y-4' : 'flex-row space-x-6'
                )}>
                  <button className={cn(
                    "px-8 py-4 font-bold rounded-full shadow-lg z-30 relative cursor-pointer",
                    deviceType === 'mobile' ? 'w-full text-lg' : 'text-lg',
                    sectionProps.primaryButtonColor === 'BLUE' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                    sectionProps.primaryButtonColor === 'GREEN' ? 'bg-green-600 text-white hover:bg-green-700' :
                    sectionProps.primaryButtonColor === 'RED' ? 'bg-red-600 text-white hover:bg-red-700' :
                    sectionProps.primaryButtonColor === 'VIOLET' ? 'bg-violet-600 text-white hover:bg-violet-700' :
                    'bg-white text-blue-700 hover:bg-blue-50'
                  )}>
                    {sectionProps.ctaText || 'Scopri le Camere'}
                  </button>
                  <button 
                    className={cn(
                      "border-2 font-semibold rounded-full px-8 py-4 z-30 relative cursor-pointer bg-transparent",
                      deviceType === 'mobile' ? 'w-full text-lg' : 'text-lg',
                      sectionProps.secondaryButtonColor === 'BLUE' ? 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white' :
                      sectionProps.secondaryButtonColor === 'GREEN' ? 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white' :
                      sectionProps.secondaryButtonColor === 'RED' ? 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white' :
                      sectionProps.secondaryButtonColor === 'VIOLET' ? 'border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white' :
                      'border-white text-white hover:bg-white hover:text-blue-700'
                    )}
                  >
                    📞 Prenota Ora
                  </button>
                </div>
                
                {/* Info aggiuntive */}
                <div className={cn(
                  "grid gap-4 text-white/90 mt-8",
                  deviceType === 'mobile' ? 'grid-cols-1 text-sm' : 
                  deviceType === 'tablet' ? 'grid-cols-2 text-sm' : 
                  'grid-cols-3 text-base'
                )}>
                  <div className="flex items-center justify-center gap-2 bg-white/10 px-3 py-2 rounded-full backdrop-blur-sm">
                    <span className="text-xl">🚇</span>
                    <span className="font-medium">350m dalla Metro</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 bg-white/10 px-3 py-2 rounded-full backdrop-blur-sm">
                    <span className="text-xl">🏛️</span>
                    <span className="font-medium">Centro Storico</span>
                  </div>
                  <div className={cn("flex items-center justify-center gap-2 bg-white/10 px-3 py-2 rounded-full backdrop-blur-sm", deviceType === 'tablet' ? 'col-span-2 md:col-span-1' : '')}>
                    <span className="text-xl">✨</span>
                    <span className="font-medium">WiFi Gratis</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Indicatore scroll */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="animate-bounce">
                <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center bg-white/10 backdrop-blur-sm">
                  <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ABOUT':
        return (
          <section className={cn(layoutStyle.section, "bg-white")}>
            <div className={deviceType === 'mobile' ? 'px-4' : deviceType === 'tablet' ? 'px-6' : layoutStyle.container}>
              {/* Layout a due colonne per layout Elegante */}
              {layoutType === 'ELEGANTE' ? (
                <div className={cn(layoutStyle.twoColumn)}>
                  {/* Colonna immagine */}
                  <div className={cn(layoutStyle.imageColumn)}>
                    {sectionProps.image ? (
                      <img 
                        src={sectionProps.image} 
                        alt={sectionProps.imageAlt || 'About'} 
                        className={cn(
                          "w-full object-cover rounded-lg",
                          deviceType === 'mobile' ? 'h-48' : 'h-96'
                        )} 
                      />
                    ) : (
                      <div className={cn(
                        "w-full bg-gray-200 rounded-lg flex items-center justify-center",
                        deviceType === 'mobile' ? 'h-48' : 'h-96'
                      )}>
                        <div className="text-center text-gray-500">
                          <Image className={cn("mx-auto mb-4", deviceType === 'mobile' ? 'w-12 h-12' : 'w-16 h-16')} />
                          <p className={cn(deviceType === 'mobile' ? 'text-xs' : 'text-sm')}>Immagine della sezione</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Colonna testo */}
                  <div className={cn(layoutStyle.textColumn)}>
                    <h2 className={cn(
                      "font-serif font-light text-gray-800 mb-6",
                      deviceType === 'mobile' ? 'text-2xl' : 'text-3xl'
                    )}>
                      {sectionProps.title || 'We have 17+ years of Experience'}
                    </h2>
                    <p className={cn(
                      "text-gray-600 leading-relaxed mb-8",
                      deviceType === 'mobile' ? 'text-base' : 'text-lg'
                    )}>
                      {sectionProps.content || 'Consectetur adipisicing elit. Nihil, illum voluptate eveniet ex fugit ea delectus, sed voluptatem. Laborum accusantium libero commodi id officiis itaque esse adipisci, necessitatibus asperiores, illo odio.'}
                    </p>
                    <Button className={cn(
                      "text-white font-medium rounded-lg transition-colors",
                      deviceType === 'mobile' ? 'px-4 py-2 text-sm' : 'px-6 py-3',
                      sectionProps.primaryButtonColor === 'BLUE' ? 'bg-blue-600 hover:bg-blue-700' :
                      sectionProps.primaryButtonColor === 'GREEN' ? 'bg-green-600 hover:bg-green-700' :
                      sectionProps.primaryButtonColor === 'RED' ? 'bg-red-600 hover:bg-red-700' :
                      sectionProps.primaryButtonColor === 'VIOLET' ? 'bg-violet-600 hover:bg-violet-700' :
                      'bg-gray-800 hover:bg-gray-700'
                    )}>
                      {sectionProps.ctaText || 'MORE ABOUT US'}
                    </Button>
                  </div>
                </div>
              ) : (
                /* Layout standard per altri layout */
                <>
                  <h2 className={cn(layoutStyle.sectionTitle, "text-left", deviceType === 'mobile' ? 'text-2xl' : '')}>
                    {sectionProps.title || 'Vivi Roma come un vero local'}
                  </h2>
                  <div className={cn("grid grid-cols-1 lg:grid-cols-2 items-start", deviceType === 'mobile' ? 'gap-4' : 'gap-8')}>
                    <div>
                      <p className={cn("text-gray-600 leading-relaxed", deviceType === 'mobile' ? 'text-base' : 'text-lg')}>
                        {sectionProps.content || 'Nel cuore di Roma, a pochi passi dalla stazione Termini e a soli 350 metri dalla fermata metro Vittorio Emanuele, il San Vito Suites è il punto di partenza perfetto per vivere la Capitale in totale comodità.'}
                      </p>
                    </div>
                    <div>
                      {sectionProps.image ? (
                        <img 
                          src={sectionProps.image} 
                          alt={sectionProps.imageAlt || 'About'} 
                          className={cn(
                            "w-full object-cover rounded-lg",
                            deviceType === 'mobile' ? 'h-48' : 'h-80'
                          )} 
                        />
                      ) : (
                        <div className={cn(
                          "w-full bg-gray-200 rounded-lg flex items-center justify-center",
                          deviceType === 'mobile' ? 'h-48' : 'h-80'
                        )}>
                          <div className="text-center text-gray-500">
                            <Image className={cn("mx-auto mb-2", deviceType === 'mobile' ? 'w-10 h-10' : 'w-12 h-12')} />
                            <p className={cn(deviceType === 'mobile' ? 'text-xs' : 'text-xs')}>Immagine della sezione</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        );

      case 'SERVICES':
        return (
          <section className={cn(layoutStyle.section, "bg-gray-50")}>
            <div className={deviceType === 'mobile' ? 'px-4' : deviceType === 'tablet' ? 'px-6' : layoutStyle.container}>
              {/* Header moderno */}
              <div className="text-center mb-16">
                <div className="group relative inline-block">
                  <h2 className={cn(
                    "font-bold text-gray-800 mb-6 cursor-pointer hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors",
                    deviceType === 'mobile' ? 'text-2xl' : 'text-3xl lg:text-4xl'
                  )}
                  onClick={readOnly ? undefined : () => onEdit()}>
                    {sectionProps.title || 'Alloggi'}
                  </h2>
                  {!readOnly && (
                    <button
                      onClick={onEdit}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-blue-600 text-white p-2 rounded-lg text-xs transition-all shadow-lg"
                      title="Modifica titolo sezione"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className={cn(
                  "text-gray-600 max-w-2xl mx-auto leading-relaxed",
                  deviceType === 'mobile' ? 'text-base' : 'text-lg'
                )}>
                  {sectionProps.subtitle || 'Le nostre camere confortevoli'}
                </p>
              </div>
              
              {/* Grid delle camere migliorata */}
              <div className={cn(
                "grid gap-8",
                deviceType === 'mobile' ? 'grid-cols-1' : 
                deviceType === 'tablet' ? 'grid-cols-2' : 
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              )}>
                {sectionProps.services?.map((service: any, index: number) => (
                  <div key={index} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
                    {/* Immagine della camera */}
                    <div className="relative w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                      {service?.image ? (
                        <img 
                          src={service.image} 
                          alt={service.imageAlt || service.title || 'Camera'} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                          <div className="text-center text-blue-400">
                            <div className="text-4xl mb-2">{service.icon || '🏠'}</div>
                            <p className="text-sm font-medium">Foto Camera</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Badge prezzo */}
                      {service.price && (
                        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-full font-bold text-sm shadow-lg">
                          €{service.price}/notte
                        </div>
                      )}
                      
                      {/* Overlay hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                    </div>
                    
                    {/* Contenuto della card */}
                    <div className="p-6 lg:p-8">
                      {/* Meta informazioni */}
                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                          <span>👥</span>
                          <span className="font-medium">{service.guests} ospiti</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                          <span>📐</span>
                          <span className="font-medium">{service.size}</span>
                        </div>
                      </div>
                      
                      {/* Titolo della camera */}
                      <h3 className={cn(
                        "font-bold text-gray-800 mb-3 leading-tight",
                        deviceType === 'mobile' ? 'text-lg' : 'text-xl lg:text-2xl'
                      )}>
                        {service.title}
                      </h3>
                      
                      {/* Descrizione */}
                      <p className={cn(
                        "text-gray-600 leading-relaxed mb-6",
                        deviceType === 'mobile' ? 'text-sm' : 'text-base'
                      )}>
                        {service.description && service.description.length > 100 
                          ? `${service.description.substring(0, 100)}...` 
                          : service.description || 'Camera confortevole nel cuore di Roma.'}
                      </p>
                      
                      {/* Footer con prezzo e bottone */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          {service.price && (
                            <div className="text-2xl font-bold text-blue-600">
                              €{service.price}
                              <span className="text-sm text-gray-500 font-normal">/notte</span>
                            </div>
                          )}
                          <div className="text-xs text-gray-500">
                            Tasse incluse
                          </div>
                        </div>
                        
                        <Button className={cn(
                          "px-6 py-3 text-white font-semibold rounded-full transition-all duration-300 shadow-lg transform hover:scale-105",
                          sectionProps.primaryButtonColor === 'BLUE' ? 'bg-blue-600 hover:bg-blue-700' :
                          sectionProps.primaryButtonColor === 'GREEN' ? 'bg-green-600 hover:bg-green-700' :
                          sectionProps.primaryButtonColor === 'RED' ? 'bg-red-600 hover:bg-red-700' :
                          sectionProps.primaryButtonColor === 'VIOLET' ? 'bg-violet-600 hover:bg-violet-700' :
                          'bg-blue-600 hover:bg-blue-700'
                        )}>
                          Prenota
                        </Button>
                      </div>
                      
                      {/* Caratteristiche aggiuntive */}
                      {service.features && service.features.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                          <div className="flex flex-wrap gap-2">
                            {service.features.slice(0, 3).map((feature: string, idx: number) => (
                              <span 
                                key={idx}
                                className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium"
                              >
                                {feature}
                              </span>
                            ))}
                            {service.features.length > 3 && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                                +{service.features.length - 3} altro
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
            </div>
          </section>
        );

      case 'GALLERY':
        return (
          <section className={cn(layoutStyle.section, "bg-white")}>
            <div className={deviceType === 'mobile' ? 'px-4' : deviceType === 'tablet' ? 'px-6' : layoutStyle.container}>
              {/* Titolo centrato */}
              <h2 className={cn("text-3xl font-serif font-light text-gray-800 mb-12 text-center")}>
                {sectionProps.title || 'Around The Hotel'}
              </h2>
              
              {/* Grid dei servizi come nelle foto */}
              <div className={cn(
                "grid gap-8",
                deviceType === 'mobile' ? 'grid-cols-1' : 
                deviceType === 'tablet' ? 'grid-cols-2' : 
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              )}>
                {sectionProps.services?.map((service: any, serviceIndex: number) => (
                  <div key={serviceIndex} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300">
                    {/* Immagine del servizio */}
                    <div className="w-full h-64 bg-gray-200 relative">
                      {service?.image ? (
                        <img src={service.image} alt={service.imageAlt || service.title || 'Servizio'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <div className="text-4xl mb-2">{service.icon}</div>
                            <p className="text-xs">Immagine servizio</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Contenuto del servizio */}
                    <div className="p-6">
                      {/* Titolo del servizio - modificabile solo se non readOnly */}
                      <div className="group relative mb-3">
                        {!readOnly && editingService === serviceIndex ? (
                          <div className="space-y-2">
                            <Input
                              value={tempServiceTitle}
                              onChange={(e) => setTempServiceTitle(e.target.value)}
                              className="text-xl font-serif font-semibold text-gray-800"
                              placeholder="Titolo servizio"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleSaveService(serviceIndex)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                💾 Salva
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setEditingService(null)}
                              >
                                ✕ Annulla
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h3 
                              className={cn(
                                "text-xl font-serif font-semibold text-gray-800 p-2 rounded transition-colors",
                                readOnly ? "" : "cursor-pointer hover:bg-blue-50"
                              )}
                              onClick={readOnly ? undefined : () => handleEditService(serviceIndex, service.title)}
                            >
                              {service.title}
                            </h3>
                            {!readOnly && (
                              <button
                                onClick={() => handleEditService(serviceIndex, service.title)}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-blue-600 text-white p-1 rounded text-xs transition-all"
                                title="Modifica servizio"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      
                      {/* Lista di massimo 5 elementi - modificabile */}
                      <ul className="space-y-2 mb-4">
                        {service.features?.slice(0, 5).map((feature: string, featureIndex: number) => (
                          <li key={featureIndex} className="text-gray-600 text-sm flex items-center group">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                            {!readOnly && editingFeature?.serviceIndex === serviceIndex && editingFeature?.featureIndex === featureIndex ? (
                              <div className="flex-1 flex items-center gap-2">
                                <Input
                                  value={tempFeature}
                                  onChange={(e) => setTempFeature(e.target.value)}
                                  className="text-sm flex-1"
                                  placeholder="Elemento"
                                  autoFocus
                                />
                                <Button 
                                  size="sm" 
                                  onClick={() => handleSaveFeature(serviceIndex, featureIndex)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1"
                                >
                                  💾
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setEditingFeature(null)}
                                  className="text-xs px-2 py-1"
                                >
                                  ✕
                                </Button>
                              </div>
                            ) : (
                              <>
                                <span 
                                  className={cn(
                                    "flex-1 p-1 rounded transition-colors",
                                    readOnly ? "" : "cursor-pointer hover:bg-blue-50"
                                  )}
                                  onClick={readOnly ? undefined : () => handleEditFeature(serviceIndex, featureIndex, feature)}
                                >
                                  {feature}
                                </span>
                                {!readOnly && (
                                  <button
                                    onClick={() => handleEditFeature(serviceIndex, featureIndex, feature)}
                                    className="opacity-0 group-hover:opacity-100 bg-blue-600 text-white p-1 rounded text-xs ml-2 transition-all"
                                    title="Modifica elemento"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                )}
                              </>
                            )}
                          </li>
                        )) || (
                          // Placeholder se non ci sono features - non modificabile in readOnly
                          <>
                            {!readOnly && [0, 1, 2, 3, 4].map((featureIndex) => (
                              <li key={featureIndex} className="text-gray-600 text-sm flex items-center group">
                                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                <span 
                                  className="flex-1 cursor-pointer hover:bg-blue-50 p-1 rounded transition-colors"
                                  onClick={() => handleEditFeature(serviceIndex, featureIndex, `Elemento ${featureIndex + 1}`)}
                                >
                                  Elemento {featureIndex + 1}
                                </span>
                                <button
                                  onClick={() => handleEditFeature(serviceIndex, featureIndex, `Elemento ${featureIndex + 1}`)}
                                  className="opacity-0 group-hover:opacity-100 bg-blue-600 text-white p-1 rounded text-xs ml-2 transition-all"
                                  title="Modifica elemento"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </li>
                            ))}
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'TESTIMONIALS':
        return (
          <section className={cn(layoutStyle.section, "bg-white")}>
            <div className={deviceType === 'mobile' ? 'px-4' : deviceType === 'tablet' ? 'px-6' : layoutStyle.container}>
              {/* Header della sezione recensioni */}
              <div className="text-center mb-16">
                <div className="group relative inline-block">
                  <h2 className={cn(
                    "font-bold text-gray-800 mb-6 cursor-pointer hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors",
                    deviceType === 'mobile' ? 'text-2xl' : 'text-3xl lg:text-4xl'
                  )}
                  onClick={readOnly ? undefined : () => onEdit()}>
                    {sectionProps.title || 'Recensioni'}
                  </h2>
                  {!readOnly && (
                    <button
                      onClick={onEdit}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-blue-600 text-white p-2 rounded-lg text-xs transition-all shadow-lg"
                      title="Modifica titolo sezione"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className={cn(
                  "text-gray-600 max-w-2xl mx-auto leading-relaxed",
                  deviceType === 'mobile' ? 'text-base' : 'text-lg'
                )}>
                  {sectionProps.subtitle || 'Cosa dicono i nostri ospiti'}
                </p>
              </div>
              
              {/* Grid delle recensioni migliorata */}
              <div className={cn(
                "grid gap-8",
                deviceType === 'mobile' ? 'grid-cols-1' : 
                deviceType === 'tablet' ? 'grid-cols-1 lg:grid-cols-2' : 
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              )}>
                {sectionProps.testimonials?.map((testimonial: any, index: number) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 relative">
                    {/* Quote icon */}
                    <div className="absolute top-4 right-4 text-4xl text-blue-100 font-serif">
                      "
                    </div>
                    
                    {/* Stelle di valutazione */}
                    <div className="flex gap-1 text-yellow-400 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-lg">⭐</span>
                      ))}
                    </div>
                    
                    {/* Contenuto della recensione */}
                    <p className={cn(
                      "text-gray-700 italic leading-relaxed mb-6 relative z-10",
                      deviceType === 'mobile' ? 'text-sm' : 'text-base'
                    )}>
                      "{testimonial.content}"
                    </p>
                    
                    {/* Informazioni dell'autore */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {testimonial.avatar || testimonial.name?.charAt(0).toUpperCase() || '👤'}
                      </div>
                      
                      {/* Nome e info */}
                      <div>
                        <div className="font-semibold text-gray-800">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {testimonial.date ? 
                            new Date(testimonial.date).toLocaleDateString('it-IT', { 
                              year: 'numeric', 
                              month: 'long' 
                            }) : 
                            'Ospite verificato'
                          }
                        </div>
                      </div>
                    </div>
                    
                    {/* Badge di verifica */}
                    <div className="absolute bottom-6 right-6">
                      <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <span>✓</span>
                        <span>Verificata</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
            </div>
          </section>
        );

      case 'CONTACT':
        return (
          <section className={cn(layoutStyle.section, "bg-white")}>
            <div className={deviceType === 'mobile' ? 'px-4' : deviceType === 'tablet' ? 'px-6' : layoutStyle.container}>
              <h2 className={cn(layoutStyle.sectionTitle, deviceType === 'mobile' ? 'text-2xl' : '')}>
                {sectionProps.title || 'Contattaci'}
              </h2>
              <div className={cn(
                "mx-auto text-center",
                deviceType === 'mobile' ? 'max-w-full' : 'max-w-2xl'
              )}>
                <div className="space-y-4">
                  <div>
                    <h3 className={cn("font-semibold mb-2", deviceType === 'mobile' ? 'text-base' : 'text-lg')}>Email</h3>
                    <p className={cn(accentColor.accent, deviceType === 'mobile' ? 'text-sm' : 'text-base')}>{sectionProps.email || 'info@sanvitosuites.it'}</p>
                  </div>
                  <div>
                    <h3 className={cn("font-semibold mb-2", deviceType === 'mobile' ? 'text-base' : 'text-lg')}>Telefono</h3>
                    <p className={cn(accentColor.accent, deviceType === 'mobile' ? 'text-sm' : 'text-base')}>{sectionProps.phone || '+39 06 123 4567'}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'PHOTO_GALLERY':
        {
          const photos = (sectionProps.photos || []) as Array<{url?: string; alt?: string}>;
          const visible = deviceType === 'mobile' ? 1 : deviceType === 'tablet' ? 2 : 3;
          const gapPx = 16;
          const maxIndex = Math.max(0, photos.length - visible);
          // Auto-advance
          useEffect(() => {
            if (section.type !== 'PHOTO_GALLERY') return;
            if (!photos || photos.length <= visible) return;
            const id = setInterval(() => {
              setGalleryIndex((i) => (i + 1) % (maxIndex + 1));
            }, 3500);
            return () => clearInterval(id);
          }, [section.type, photos?.length, visible, maxIndex]);

          return (
            <section className={cn(layoutStyle.section, "bg-white")}> 
              <div className={deviceType === 'mobile' ? 'px-4' : deviceType === 'tablet' ? 'px-6' : layoutStyle.container}>
                <h2 className={cn(layoutStyle.sectionTitle, 'text-center')}>{sectionProps.title || 'Galleria Fotografica'}</h2>
                <div className="relative w-full max-w-6xl mx-auto">
                  <div className="overflow-hidden rounded-xl bg-gray-100">
                    {photos.length === 0 ? (
                      <div className="aspect-[16/9] flex items-center justify-center text-gray-400">
                        <Image className="w-10 h-10" />
                      </div>
                    ) : (
                      <div
                        className="flex transition-transform duration-700"
                        style={{ transform: `translateX(-${(galleryIndex * 100) / visible}%)`, gap: `${gapPx}px` }}
                      >
                        {photos.map((photo, idx) => (
                          <div
                            key={idx}
                            className="relative"
                            style={{ width: `calc((100% - ${(visible - 1) * gapPx}px) / ${visible})` }}
                          >
                            <div className="aspect-[16/9]">
                              {photo?.url ? (
                                <img src={photo.url} alt={photo.alt || `Foto ${idx+1}`} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                  <Image className="w-10 h-10" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Prev/Next */}
                  {photos.length > visible && (
                    <>
                      <button
                        onClick={() => setGalleryIndex((i) => (i - 1 + (maxIndex + 1)) % (maxIndex + 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full h-9 w-9 flex items-center justify-center shadow"
                        aria-label="Prev"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => setGalleryIndex((i) => (i + 1) % (maxIndex + 1))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full h-9 w-9 flex items-center justify-center shadow"
                        aria-label="Next"
                      >
                        ›
                      </button>
                    </>
                  )}
                  {photos.length > visible && (
                    <div className="flex items-center justify-center gap-2 mt-3">
                      {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setGalleryIndex(idx)}
                          className={cn('h-2.5 w-2.5 rounded-full transition-colors', idx === galleryIndex ? 'bg-gray-800' : 'bg-gray-300 hover:bg-gray-400')}
                          aria-label={`Vai alla slide ${idx+1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )
        }

      case 'AMENITIES':
        return (
          <section className={cn(layoutStyle.section, 'bg-gray-50')}>
            <div className={deviceType === 'mobile' ? 'px-4' : deviceType === 'tablet' ? 'px-6' : layoutStyle.container}>
              {/* Header della sezione dotazioni */}
              <div className="text-center mb-16">
                <div className="group relative inline-block">
                  <h2 className={cn(
                    "font-bold text-gray-800 mb-6 cursor-pointer hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors",
                    deviceType === 'mobile' ? 'text-2xl' : 'text-3xl lg:text-4xl'
                  )}
                  onClick={readOnly ? undefined : () => onEdit()}>
                    {sectionProps.title || 'Dotazioni'}
                  </h2>
                  {!readOnly && (
                    <button
                      onClick={onEdit}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-blue-600 text-white p-2 rounded-lg text-xs transition-all shadow-lg"
                      title="Modifica titolo sezione"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className={cn(
                  "text-gray-600 max-w-2xl mx-auto leading-relaxed",
                  deviceType === 'mobile' ? 'text-base' : 'text-lg'
                )}>
                  Tutti i comfort per rendere perfetto il tuo soggiorno
                </p>
              </div>
              
              {/* Grid delle dotazioni migliorata */}
              <div className={cn(
                'grid gap-6',
                deviceType === 'mobile' ? 'grid-cols-2' : 
                deviceType === 'tablet' ? 'grid-cols-3' : 
                'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
              )}>
                {(sectionProps.items || []).map((item: any, index: number) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                    {/* Icona */}
                    <div className="mb-4">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300">
                        <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                          {item.icon || '✔️'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Label */}
                    <div className={cn(
                      "font-semibold text-gray-700 leading-tight",
                      deviceType === 'mobile' ? 'text-sm' : 'text-base'
                    )}>
                      {item.label}
                    </div>
                    
                    {/* Descrizione aggiuntiva se presente */}
                    {item.description && (
                      <div className="text-xs text-gray-500 mt-2 leading-relaxed">
                        {item.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
            </div>
          </section>
        )

      case 'GET_YOUR_GUIDE':
        return (
          <section className={cn(layoutStyle.section, 'bg-gradient-to-b from-white to-gray-50')}>
            <div className={deviceType === 'mobile' ? 'px-4' : deviceType === 'tablet' ? 'px-6' : layoutStyle.container}>
              {/* Header della sezione GetYourGuide */}
              <div className="text-center mb-16">
                <div className="group relative inline-block">
                  <h2 className={cn(
                    "font-bold text-gray-800 mb-6 cursor-pointer hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors",
                    deviceType === 'mobile' ? 'text-2xl' : 'text-3xl lg:text-4xl'
                  )}
                  onClick={readOnly ? undefined : () => onEdit()}>
                    {sectionProps.title || 'GetYourGuide – Attività consigliate'}
                  </h2>
                  {!readOnly && (
                    <button
                      onClick={onEdit}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-blue-600 text-white p-2 rounded-lg text-xs transition-all shadow-lg"
                      title="Modifica titolo sezione"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className={cn(
                  "text-gray-600 max-w-2xl mx-auto leading-relaxed",
                  deviceType === 'mobile' ? 'text-base' : 'text-lg'
                )}>
                  Scopri le migliori attività e tour di Roma con i nostri partner di fiducia
                </p>
              </div>
              
              {/* Grid delle attività migliorata */}
              <div className={cn(
                'grid gap-8',
                deviceType === 'mobile' ? 'grid-cols-1' : 
                deviceType === 'tablet' ? 'grid-cols-1 lg:grid-cols-2' : 
                'grid-cols-1 md:grid-cols-2'
              )}>
                {(sectionProps.activities || []).map((act: any, index: number) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 group">
                    {/* Immagine dell'attività */}
                    <div className="relative w-full h-64 bg-gradient-to-br from-orange-100 to-orange-200 overflow-hidden">
                      {act?.imageUrl ? (
                        <img 
                          src={act.imageUrl} 
                          alt={act.title || 'Attività'} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-orange-400">
                            <div className="text-4xl mb-2">🏛️</div>
                            <p className="text-sm font-medium">Tour & Attività</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Badge GetYourGuide */}
                      <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        GetYourGuide
                      </div>
                      
                      {/* Overlay hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                    </div>
                    
                    {/* Contenuto della card */}
                    <div className="p-6 lg:p-8">
                      {/* Titolo dell'attività */}
                      <h3 className={cn(
                        "font-bold text-gray-800 mb-4 leading-tight",
                        deviceType === 'mobile' ? 'text-lg' : 'text-xl'
                      )}>
                        {act.title || 'Attività'}
                      </h3>
                      
                      {/* Descrizione */}
                      {act.description && (
                        <p className={cn(
                          "text-gray-600 leading-relaxed mb-6",
                          deviceType === 'mobile' ? 'text-sm' : 'text-base'
                        )}>
                          {act.description}
                        </p>
                      )}
                      
                      {/* Informazioni aggiuntive */}
                      <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <span>⭐</span>
                          <span>Prenotazione sicura</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🎫</span>
                          <span>Biglietto mobile</span>
                        </div>
                      </div>
                      
                      {/* Call to action */}
                      <div className="flex items-center gap-4">
                        {act.link ? (
                          <a 
                            href={act.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button className={cn(
                              "w-full px-6 py-3 text-white font-semibold rounded-full transition-all duration-300 shadow-lg transform hover:scale-105",
                              sectionProps.primaryButtonColor === 'BLUE' ? 'bg-blue-600 hover:bg-blue-700' :
                              sectionProps.primaryButtonColor === 'GREEN' ? 'bg-green-600 hover:bg-green-700' :
                              sectionProps.primaryButtonColor === 'RED' ? 'bg-red-600 hover:bg-red-700' :
                              sectionProps.primaryButtonColor === 'VIOLET' ? 'bg-violet-600 hover:bg-violet-700' :
                              'bg-orange-500 hover:bg-orange-600'
                            )}>
                              🎫 Prenota su GetYourGuide
                            </Button>
                          </a>
                        ) : (
                          <Button 
                            disabled
                            className="flex-1 px-6 py-3 bg-gray-300 text-gray-500 font-semibold rounded-full cursor-not-allowed"
                          >
                            Link non disponibile
                          </Button>
                        )}
                      </div>
                      
                      {/* Trust badge */}
                      <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
                        <span>🛡️</span>
                        <span>Cancellazione gratuita · Assistenza 24/7</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
            </div>
          </section>
        )

      default:
        return (
          <section className={cn(layoutStyle.section, "bg-gray-100")}>
            <div className={deviceType === 'mobile' ? 'px-4' : deviceType === 'tablet' ? 'px-6' : layoutStyle.container}>
              <h2 className={cn(layoutStyle.sectionTitle, deviceType === 'mobile' ? 'text-2xl' : '')}>Sezione {section.type}</h2>
              <p className="text-center text-gray-600">Contenuto non disponibile</p>
            </div>
          </section>
        );
    }
  };

  return (
    <div className="relative group">
      {/* Section Controls - Solo in modalità modifica, non in anteprima */}
      {!readOnly && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={onEdit}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Modifica sezione"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Elimina sezione"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              {/* Pulsante Pubblica/Annulla Pubblicazione */}
              {sectionProps.isPublished ? (
                <button
                  onClick={onUnpublish}
                  className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                  title="Annulla pubblicazione"
                >
                  <span className="text-sm">📝</span>
                </button>
              ) : (
                <button
                  onClick={onPublish}
                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                  title="Pubblica sezione"
                >
                  <span className="text-sm">🚀</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section Content */}
      {renderSectionContent()}
    </div>
  );
};

// Main Component semplificato
export function InteractiveThemePreview({
  layoutType,
  theme,
  sections,
  onSectionUpdate,
  onSectionDelete,
  onSectionPublish,
  onSectionUnpublish,
  onSectionReorder,
  className,
  deviceType,
  readOnly = false
}: InteractiveThemePreviewProps) {
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const layoutStyle = LAYOUT_STYLES[layoutType];
  const accentColor = ACCENT_COLORS[theme.accent];
  const fontClass = FONT_CLASSES[theme.font];
  
  // Debug logging per tema
  console.log('🎨 Tema applicato:', {
    theme: theme,
    accentColor: accentColor,
    fontClass: fontClass,
    layoutStyle: layoutStyle
  });
  
  // Check if font is loaded
  useEffect(() => {
    if (theme.font === 'WORKSANS') {
      // Force load Work Sans font
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, [theme.font]);

  const handleEditSection = (section: Section) => {
    if (!readOnly) {
      setEditingSection(section);
    }
  };

  const handleCloseEditor = () => {
    setEditingSection(null);
  };

  const handleSectionUpdate = (sectionId: string, updatedProps: any) => {
    onSectionUpdate(sectionId, updatedProps);
    setEditingSection(null);
  };

  const handleSectionDelete = (sectionId: string) => {
    onSectionDelete(sectionId);
  };

  // Responsive container classes based on device type
  const getResponsiveContainer = () => {
    switch (deviceType) {
      case 'mobile':
        return 'max-w-sm mx-auto px-4';
      case 'tablet':
        return 'max-w-2xl mx-auto px-6';
      case 'desktop':
      default:
        return layoutStyle.container;
    }
  };


  return (
    <div 
      className={cn("min-h-screen w-full", fontClass, className)}
      style={{ fontFamily: FONT_FAMILIES[theme.font] }}
    >
      {/* Responsive Preview Indicator - Solo in modalità builder */}
      {!readOnly && (
        <div className="fixed top-20 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm font-medium text-gray-700">
          {deviceType === 'mobile' && '📱 Mobile'}
          {deviceType === 'tablet' && '📱 Tablet'}
          {deviceType === 'desktop' && '🖥️ Desktop'}
        </div>
      )}


      {/* Sections */}
      <div className={cn(getResponsiveContainer(), 'break-words')}
           style={{ wordBreak: 'break-word' }}>
        {sections.map((section, index) => (
            <div key={section.id} className={index > 0 ? 'mt-8' : ''}>
              <SectionComponent
                section={section}
                layoutStyle={layoutStyle}
                accentColor={accentColor}
                onEdit={() => handleEditSection(section)}
                onDelete={() => handleSectionDelete(section.id)}
                onPublish={() => onSectionPublish(section.id)}
                onUnpublish={() => onSectionUnpublish(section.id)}
                deviceType={deviceType}
                layoutType={layoutType}
                onSectionUpdate={handleSectionUpdate}
                readOnly={readOnly}
              />
            </div>
        ))}
      </div>

      {/* Inline Editor Modal - Solo se non readOnly */}
      {!readOnly && editingSection && (
        <InlineEditor
          section={editingSection}
          onUpdate={(updatedProps) => handleSectionUpdate(editingSection.id, updatedProps)}
          onClose={handleCloseEditor}
          accentColor={accentColor}
        />
      )}
    </div>
  );
}

