'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { THEME_FONTS } from '@/lib/constants';
import { ThemeFont } from '@/types';

interface FontSelectorProps {
  selectedFont: ThemeFont;
  onFontChange: (font: ThemeFont) => void;
  className?: string;
}

export const FontSelector: React.FC<FontSelectorProps> = ({
  selectedFont,
  onFontChange,
  className,
}) => {
  return (
    <div className={cn('flex flex-col space-y-3', className)}>
      <label className="text-sm font-medium text-foreground">
        Tipografia
      </label>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(THEME_FONTS).map(([key, font]) => (
          <button
            key={key}
            type="button"
            onClick={() => onFontChange(key as ThemeFont)}
            className={cn(
              'relative p-3 rounded-lg border text-left transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
              selectedFont === key
                ? 'border-accent bg-accent text-accent-foreground ring-2 ring-accent ring-offset-2'
                : 'border-border hover:border-accent/50'
            )}
            aria-label={`Seleziona font ${font.name}`}
          >
            <div
              className={cn(
                'text-lg font-medium mb-1',
                `font-${key.toLowerCase()}`
              )}
              style={{ fontFamily: font.family }}
            >
              Aa
            </div>
            <div className="text-xs text-muted-foreground">
              {font.name}
            </div>
            {selectedFont === key && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-current rounded-full" />
              </div>
            )}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Font selezionato: {THEME_FONTS[selectedFont].name}
      </p>
    </div>
  );
};
