'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Section, SectionType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Upload, Plus, X, Edit3, Type, Image, Link, Mail, Phone, MapPin, Palette } from 'lucide-react';

interface SectionFormProps {
  section: Section;
  onUpdate: (props: any) => void;
  onDelete: () => void;
  className?: string;
}

export const SectionForm: React.FC<SectionFormProps> = ({ section, onUpdate, onDelete, className }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'theme'>('content');
  
  const handleInputChange = (field: string, value: string) => {
    onUpdate({ [field]: value });
  };

  const handleArrayChange = (field: string, value: any[]) => {
    onUpdate({ [field]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // TODO: Handle file upload
      console.log('Files selected:', files);
    }
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

  const renderFormFields = () => {
    switch (section.type) {
      case 'HERO':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Type className="w-4 h-4 text-accent" />
                <h4 className="font-medium text-sm">Contenuto Principale</h4>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Titolo Principale</label>
                <Input
                  value={(section.props as any).title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Il tuo titolo accattivante"
                  maxLength={60}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {((section.props as any).title || '').length}/60 caratteri
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Sottotitolo</label>
                <Input
                  value={(section.props as any).subtitle || ''}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  placeholder="Descrizione del tuo servizio o progetto"
                  maxLength={120}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {((section.props as any).subtitle || '').length}/120 caratteri
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Link className="w-4 h-4 text-accent" />
                <h4 className="font-medium text-sm">Call to Action</h4>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Testo del Pulsante</label>
                <Input
                  value={(section.props as any).ctaText || ''}
                  onChange={(e) => handleInputChange('ctaText', e.target.value)}
                  placeholder="Scopri di più"
                  maxLength={30}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">URL del Pulsante</label>
                <Input
                  value={(section.props as any).ctaUrl || ''}
                  onChange={(e) => handleInputChange('ctaUrl', e.target.value)}
                  placeholder="#section o https://..."
                  maxLength={100}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        );

      case 'ABOUT':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Type className="w-4 h-4 text-accent" />
                <h4 className="font-medium text-sm">Informazioni</h4>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Titolo della Sezione</label>
                <Input
                  value={(section.props as any).title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Chi Siamo"
                  maxLength={60}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Descrizione</label>
                <textarea
                  value={(section.props as any).content || ''}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Racconta la storia della tua azienda, il tuo progetto o la tua passione..."
                  maxLength={500}
                  rows={5}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {((section.props as any).content || '').length}/500 caratteri
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Image className="w-4 h-4 text-accent" />
                <h4 className="font-medium text-sm">Immagine (Opzionale)</h4>
              </div>
              
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Aggiungi un'immagine rappresentativa
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="about-image-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('about-image-upload')?.click()}
                >
                  Seleziona Immagine
                </Button>
              </div>
            </div>
          </div>
        );

      case 'SERVICES':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Type className="w-4 h-4 text-accent" />
                <h4 className="font-medium text-sm">Intestazione</h4>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Titolo della Sezione</label>
                <Input
                  value={(section.props as any).title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="I Nostri Servizi"
                  maxLength={60}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Descrizione</label>
                <Input
                  value={(section.props as any).subtitle || ''}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  placeholder="Cosa offriamo ai nostri clienti"
                  maxLength={120}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Plus className="w-4 h-4 text-accent" />
                <h4 className="font-medium text-sm">Gestione Alloggi</h4>
              </div>
              
              {((section.props as any).services || []).map((service: any, index: number) => (
                <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-sm">Alloggio {index + 1}</h5>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const services = [...(section.props as any).services];
                        services.splice(index, 1);
                        handleArrayChange('services', services);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Nome Camera</label>
                    <Input
                      value={service.title || ''}
                      onChange={(e) => {
                        const services = [...(section.props as any).services];
                        services[index] = { ...service, title: e.target.value };
                        handleArrayChange('services', services);
                      }}
                      placeholder="Camera Matrimoniale"
                      maxLength={80}
                      className="w-full text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Descrizione</label>
                    <textarea
                      value={service.description || ''}
                      onChange={(e) => {
                        const services = [...(section.props as any).services];
                        services[index] = { ...service, description: e.target.value };
                        handleArrayChange('services', services);
                      }}
                      placeholder="Descrizione della camera..."
                      maxLength={200}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Ospiti</label>
                      <Input
                        value={service.guests || ''}
                        onChange={(e) => {
                          const services = [...(section.props as any).services];
                          services[index] = { ...service, guests: e.target.value };
                          handleArrayChange('services', services);
                        }}
                        placeholder="2"
                        maxLength={2}
                        className="w-full text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Dimensioni</label>
                      <Input
                        value={service.size || ''}
                        onChange={(e) => {
                          const services = [...(section.props as any).services];
                          services[index] = { ...service, size: e.target.value };
                          handleArrayChange('services', services);
                        }}
                        placeholder="22m²"
                        maxLength={10}
                        className="w-full text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Prezzo €</label>
                      <Input
                        value={service.price || ''}
                        onChange={(e) => {
                          const services = [...(section.props as any).services];
                          services[index] = { ...service, price: e.target.value };
                          handleArrayChange('services', services);
                        }}
                        placeholder="95"
                        maxLength={6}
                        className="w-full text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Icona (emoji)</label>
                    <Input
                      value={service.icon || ''}
                      onChange={(e) => {
                        const services = [...(section.props as any).services];
                        services[index] = { ...service, icon: e.target.value };
                        handleArrayChange('services', services);
                      }}
                      placeholder="🏠"
                      maxLength={4}
                      className="w-full text-sm"
                    />
                  </div>
                </div>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const services = [...((section.props as any).services || [])];
                  services.push({
                    title: 'Nuova Camera',
                    description: 'Descrizione della camera...',
                    icon: '🏠',
                    guests: '2',
                    size: '20m²',
                    price: '80'
                  });
                  handleArrayChange('services', services);
                }}
                className="w-full"
              >
                <Plus className="w-3 h-3 mr-2" />
                Aggiungi Alloggio
              </Button>
            </div>
          </div>
        );

      case 'GALLERY':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Type className="w-4 h-4 text-accent" />
                <h4 className="font-medium text-sm">Intestazione</h4>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Titolo della Galleria</label>
                <Input
                  value={(section.props as any).title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Galleria Immagini"
                  maxLength={60}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Image className="w-4 h-4 text-accent" />
                <h4 className="font-medium text-sm">Carica Immagini</h4>
              </div>
              
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-4">
                  Aggiungi le tue immagini migliori
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="gallery-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('gallery-upload')?.click()}
                >
                  Seleziona Immagini
                </Button>
              </div>
            </div>
          </div>
        );

      case 'TESTIMONIALS':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Type className="w-4 h-4 text-accent" />
                <h4 className="font-medium text-sm">Intestazione</h4>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Titolo della Sezione</label>
                <Input
                  value={(section.props as any).title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Testimonianze"
                  maxLength={60}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Plus className="w-4 h-4 text-accent" />
                <h4 className="font-medium text-sm">Gestione Testimonianze</h4>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Le testimonianze vengono configurate automaticamente dal template selezionato
              </p>
            </div>
          </div>
        );

      case 'CONTACT':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Type className="w-4 h-4 text-accent" />
                <h4 className="font-medium text-sm">Intestazione</h4>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Titolo della Sezione</label>
                <Input
                  value={(section.props as any).title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Contattaci"
                  maxLength={60}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Sottotitolo</label>
                <Input
                  value={(section.props as any).subtitle || ''}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  placeholder="Come possiamo aiutarti"
                  maxLength={120}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Mail className="w-4 h-4 text-accent" />
                <h4 className="font-medium text-sm">Informazioni di Contatto</h4>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                <Input
                  value={(section.props as any).email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="info@example.com"
                  type="email"
                  maxLength={100}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Telefono</label>
                <Input
                  value={(section.props as any).phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+39 123 456 789"
                  maxLength={20}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Indirizzo</label>
                <Input
                  value={(section.props as any).address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Via Roma 123, Milano"
                  maxLength={200}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Sezione non supportata</p>
          </div>
        );
    }
  };

  return (
    <Card className={cn('w-full border-2 border-accent/30 bg-gradient-to-br from-background to-accent/5 shadow-2xl', className)}>
      <CardHeader className="pb-4 border-b border-accent/20 bg-gradient-to-r from-accent/10 to-accent/5">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/70 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">{getSectionIcon(section.type)}</span>
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-foreground">
              ✏️ Modifica {getSectionName(section.type)}
            </CardTitle>
            <p className="text-sm text-accent/70 mt-1">
              Personalizza contenuti e stile della sezione
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-muted/30 rounded-lg p-1">
          <Button
            variant={activeTab === 'content' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('content')}
            className="flex-1"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Contenuto
          </Button>
          <Button
            variant={activeTab === 'theme' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('theme')}
            className="flex-1"
          >
            <Palette className="w-4 h-4 mr-2" />
            Tema
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {renderFormFields()}
          </div>
        )}

        {activeTab === 'theme' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Colori Bottoni</h3>
              <div className="space-y-4">
                {/* Colore Bottoni Primari */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Colore Bottoni Primari</label>
                  <div className="flex items-center justify-center gap-4">
                    {[
                      { key: 'BLUE', name: 'Blu', color: '#3b82f6' },
                      { key: 'GREEN', name: 'Verde', color: '#16a34a' },
                      { key: 'RED', name: 'Rosso', color: '#dc2626' },
                      { key: 'VIOLET', name: 'Viola', color: '#8b5cf6' }
                    ].map(color => (
                      <button
                        key={color.key}
                        onClick={() => {
                          console.log('🎨 Cambio colore bottoni primari:', color.key);
                          onUpdate({
                            ...section.props,
                            primaryButtonColor: color.key
                          });
                        }}
                        className={cn(
                          "w-12 h-12 rounded-full border-3 transition-all duration-200 hover:scale-110",
                          section.props?.primaryButtonColor === color.key 
                            ? 'border-gray-900 shadow-lg scale-110' 
                            : 'border-gray-300 hover:border-gray-500'
                        )}
                        style={{ backgroundColor: color.color }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <div className="text-center mt-2 text-xs text-gray-500">
                    Tocca un colore per applicarlo ai bottoni primari
                  </div>
                </div>

                {/* Colore Bottoni Secondari */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Colore Bottoni Secondari</label>
                  <div className="flex items-center justify-center gap-4">
                    {[
                      { key: 'BLUE', name: 'Blu', color: '#3b82f6' },
                      { key: 'GREEN', name: 'Verde', color: '#16a34a' },
                      { key: 'RED', name: 'Rosso', color: '#dc2626' },
                      { key: 'VIOLET', name: 'Viola', color: '#8b5cf6' }
                    ].map(color => (
                      <button
                        key={color.key}
                        onClick={() => {
                          console.log('🎨 Cambio colore bottoni secondari:', color.key);
                          onUpdate({
                            ...section.props,
                            secondaryButtonColor: color.key
                          });
                        }}
                        className={cn(
                          "w-12 h-12 rounded-full border-3 transition-all duration-200 hover:scale-110",
                          section.props?.secondaryButtonColor === color.key 
                            ? 'border-gray-900 shadow-lg scale-110' 
                            : 'border-gray-300 hover:border-gray-500'
                        )}
                        style={{ backgroundColor: color.color }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <div className="text-center mt-2 text-xs text-gray-500">
                    Tocca un colore per applicarlo ai bottoni secondari
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="pt-6 border-t border-accent/20">
          <Button
            variant="destructive"
            size="lg"
            onClick={onDelete}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg border-2 border-red-300"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            🗑️ Elimina Sezione
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
