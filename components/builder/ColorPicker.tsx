'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { THEME_ACCENTS } from '@/lib/constants';
import { ThemeAccent } from '@/types';
import { Palette, Check, Eye } from 'lucide-react';

interface ColorPickerProps {
  selectedColor: ThemeAccent;
  onColorChange: (color: ThemeAccent) => void;
  className?: string;
  showPreview?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorChange,
  className,
  showPreview = true,
}) => {
  const [hoveredColor, setHoveredColor] = useState<ThemeAccent | null>(null);

  const getColorName = (color: ThemeAccent) => {
    return THEME_ACCENTS[color].name;
  };

  const getColorHex = (color: ThemeAccent) => {
    return THEME_ACCENTS[color].hex;
  };

  const getColorRgb = (color: ThemeAccent) => {
    return THEME_ACCENTS[color].rgb;
  };

  return (
    <div className={cn('flex flex-col space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Palette className="w-4 h-4 text-accent" />
        <label className="text-sm font-medium text-foreground">
          Colore Accent del Tema
        </label>
      </div>

      {/* Color Grid */}
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(THEME_ACCENTS).map(([key, color]) => {
          const isSelected = selectedColor === key;
          const isHovered = hoveredColor === key;
          
          return (
            <button
              key={key}
              type="button"
              onClick={() => onColorChange(key as ThemeAccent)}
              onMouseEnter={() => setHoveredColor(key as ThemeAccent)}
              onMouseLeave={() => setHoveredColor(null)}
              className={cn(
                'relative group transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent',
                isSelected 
                  ? 'ring-2 ring-accent ring-offset-2 scale-105' 
                  : 'hover:ring-2 hover:ring-accent/50 hover:ring-offset-1'
              )}
              style={{
                backgroundColor: color.hex,
              }}
              aria-label={`Seleziona colore ${color.name}`}
              title={`${color.name} (${color.hex})`}
            >
              {/* Color Circle */}
              <div className={cn(
                'w-12 h-12 rounded-full border-2 transition-all duration-200',
                isSelected 
                  ? 'border-white shadow-lg' 
                  : 'border-white/20 hover:border-white/40'
              )}>
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                  </div>
                )}
                
                {/* Hover Effect */}
                {isHovered && !isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white/80 rounded-full" />
                  </div>
                )}
              </div>

              {/* Color Label */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap">
                  {color.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Color Info */}
      <div className="pt-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Colore selezionato:</span>
          <span className="font-medium text-foreground">
            {getColorName(selectedColor)}
          </span>
        </div>
        
        {/* Color Details */}
        <div className="mt-2 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>HEX:</span>
            <span className="font-mono">{getColorHex(selectedColor)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <span>RGB:</span>
            <span className="font-mono">{getColorRgb(selectedColor)}</span>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center space-x-2 mb-3">
            <Eye className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">Anteprima</span>
          </div>
          
          <div className="space-y-2">
            {/* Button Preview */}
            <div className="flex items-center space-x-3">
              <button 
                className="px-4 py-2 rounded-md text-white font-medium transition-colors"
                style={{ backgroundColor: getColorHex(selectedColor) }}
              >
                Pulsante Primario
              </button>
              <button 
                className="px-4 py-2 rounded-md border-2 font-medium transition-colors"
                style={{ 
                  borderColor: getColorHex(selectedColor),
                  color: getColorHex(selectedColor)
                }}
              >
                Pulsante Secondario
              </button>
            </div>
            
            {/* Accent Elements */}
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: getColorHex(selectedColor) }}
              />
              <span className="text-xs text-muted-foreground">
                Elementi accent
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="pt-2">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Il colore accent viene utilizzato per pulsanti, link e elementi di evidenziazione 
          in tutto il sito. Scegli un colore che si abbini alla tua identità aziendale.
        </p>
      </div>
    </div>
  );
};
