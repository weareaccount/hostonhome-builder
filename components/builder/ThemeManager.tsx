'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ThemeConfig, ThemeAccent, ThemeFont, LayoutType } from '@/types';
import { THEME_ACCENTS, THEME_FONTS, LAYOUT_TYPES } from '@/lib/constants';
import { ColorPicker } from './ColorPicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Type, Layout, Eye, Check, Settings } from 'lucide-react';

interface ThemeManagerProps {
  theme: ThemeConfig;
  layoutType: LayoutType;
  onThemeChange: (theme: Partial<ThemeConfig>) => void;
  onLayoutChange: (layoutType: LayoutType) => void;
  className?: string;
}

export const ThemeManager: React.FC<ThemeManagerProps> = ({
  theme,
  layoutType,
  onThemeChange,
  onLayoutChange,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'fonts' | 'layout'>('colors');

  const handleColorChange = (accent: ThemeAccent) => {
    onThemeChange({ accent });
  };

  const handleFontChange = (font: ThemeFont) => {
    onThemeChange({ font });
  };

  const handleLayoutChange = (layout: LayoutType) => {
    onLayoutChange(layout);
  };

  const getFontPreviewStyle = (fontFamily: string) => {
    return { fontFamily };
  };

  const getLayoutPreview = (layout: LayoutType) => {
    switch (layout) {
      case 'ELEGANTE':
        return {
          name: 'Elegante',
          description: 'Design raffinato con spaziature ampie e tipografia serif',
          icon: '🎨',
          preview: 'Spaziature generose, tipografia elegante, design sofisticato'
        };
      case 'MEDIO':
        return {
          name: 'Medio',
          description: 'Stile bilanciato con card e icone moderne',
          icon: '⚖️',
          preview: 'Bilanciato, card moderne, icone e spaziature moderate'
        };
      case 'ESSENZIALE':
        return {
          name: 'Essenziale',
          description: 'Design minimalista e compatto per massima leggibilità',
          icon: '✨',
          preview: 'Minimalista, compatto, massima leggibilità e semplicità'
        };
      default:
        return {
          name: 'Sconosciuto',
          description: 'Layout non definito',
          icon: '❓',
          preview: 'Layout non disponibile'
        };
    }
  };

  return (
    <Card className={cn('w-full bg-background', className)}>
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-accent" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              Gestione Tema
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Personalizza colori, font e layout del tuo sito
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-muted/30 rounded-lg p-1">
          <Button
            variant={activeTab === 'colors' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('colors')}
            className="flex-1"
          >
            <Palette className="w-4 h-4 mr-2" />
            Colori
          </Button>
          <Button
            variant={activeTab === 'fonts' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('fonts')}
            className="flex-1"
          >
            <Type className="w-4 h-4 mr-2" />
            Font
          </Button>
          <Button
            variant={activeTab === 'layout' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('layout')}
            className="flex-1"
          >
            <Layout className="w-4 h-4 mr-2" />
            Layout
          </Button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-foreground">Colori del Tema</h3>
                <ColorPicker
                  selectedColor={theme.accent}
                  onColorChange={handleColorChange}
                  showPreview={true}
                />
              </div>
              
              <div className="pt-4 border-t border-border/50">
                <h4 className="text-sm font-medium mb-3 text-foreground">Colori Attuali</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: THEME_ACCENTS[theme.accent].hex }}
                      />
                      <span className="text-xs font-medium">Accent</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {THEME_ACCENTS[theme.accent].name} ({THEME_ACCENTS[theme.accent].hex})
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-4 h-4 rounded-full bg-foreground border border-border" />
                      <span className="text-xs font-medium">Testo</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Colore principale del testo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fonts Tab */}
          {activeTab === 'fonts' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-foreground">Tipografia</h3>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(THEME_FONTS).map(([key, font]) => (
                    <Button
                      key={key}
                      variant={theme.font === key ? 'default' : 'outline'}
                      onClick={() => handleFontChange(key as ThemeFont)}
                      className="w-full justify-start h-auto p-4"
                    >
                      <div className="flex items-center space-x-3 w-full">
                        {theme.font === key && (
                          <Check className="w-4 h-4 text-accent" />
                        )}
                        <div className="flex-1 text-left">
                          <div 
                            className="text-lg font-medium mb-1"
                            style={getFontPreviewStyle(font.family)}
                          >
                            {font.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {font.family} • {font.weight}
                          </div>
                        </div>
                        <div 
                          className="text-2xl text-muted-foreground"
                          style={getFontPreviewStyle(font.family)}
                        >
                          Aa
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <h4 className="text-sm font-medium mb-3 text-foreground">Font Selezionato</h4>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div 
                    className="text-2xl font-bold mb-2"
                    style={getFontPreviewStyle(THEME_FONTS[theme.font].family)}
                  >
                    {THEME_FONTS[theme.font].name}
                  </div>
                  <p 
                    className="text-sm leading-relaxed"
                    style={getFontPreviewStyle(THEME_FONTS[theme.font].family)}
                  >
                    Questo è un esempio di come apparirà il testo con il font {THEME_FONTS[theme.font].name}. 
                    La tipografia è fondamentale per la leggibilità e l'aspetto professionale del tuo sito.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Layout Tab */}
          {activeTab === 'layout' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-foreground">Stile del Layout</h3>
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(LAYOUT_TYPES).map(([key, layout]) => {
                    const layoutInfo = getLayoutPreview(key as LayoutType);
                    const isSelected = layoutType === key;
                    
                    return (
                      <Button
                        key={key}
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={() => handleLayoutChange(key as LayoutType)}
                        className="w-full justify-start h-auto p-4"
                      >
                        <div className="flex items-start space-x-4 w-full">
                          {isSelected && (
                            <Check className="w-5 h-5 text-accent mt-1" />
                          )}
                          <div className="flex-1 text-left">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-2xl">{layoutInfo.icon}</span>
                              <div>
                                <div className="text-lg font-semibold">
                                  {layoutInfo.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {layout.description}
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {layoutInfo.preview}
                            </p>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <h4 className="text-sm font-medium mb-3 text-foreground">Layout Attuale</h4>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{getLayoutPreview(layoutType).icon}</span>
                    <div>
                      <div className="font-semibold text-foreground">
                        {getLayoutPreview(layoutType).name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getLayoutPreview(layoutType).description}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {getLayoutPreview(layoutType).preview}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="pt-6 border-t border-border/50">
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Reset to default theme
                onThemeChange({ accent: 'BLUE', font: 'INTER' });
                onLayoutChange('MEDIO');
              }}
              className="flex-1"
            >
              Ripristina Predefiniti
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Preview theme
                console.log('Preview theme:', { theme, layoutType });
              }}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              Anteprima
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
