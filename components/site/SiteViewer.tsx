'use client';

import React from 'react';
import { InteractiveThemePreview } from '@/components/builder/InteractiveThemePreview';
import { Section, ThemeConfig } from '@/types';

interface SiteViewerProps {
  layoutType: string;
  theme: ThemeConfig;
  sections: Section[];
}

export function SiteViewer({ layoutType, theme, sections }: SiteViewerProps) {
  return (
    <InteractiveThemePreview
      layoutType={layoutType}
      theme={theme}
      sections={sections}
      onSectionUpdate={() => {}} // Funzioni vuote per modalità visualizzazione
      onSectionDelete={() => {}}
      onSectionPublish={() => {}}
      onSectionUnpublish={() => {}}
      onSectionReorder={() => {}}
      deviceType="desktop"
      readOnly={true}
    />
  );
}
