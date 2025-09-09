import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Site } from '@/types';
import { SiteViewer } from '@/components/site/SiteViewer';

// Funzione per recuperare i dati del sito
async function fetchSite(slug: string): Promise<Site | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/sites/by-slug/${slug}`, {
      cache: 'no-store' // Sempre dati freschi
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Errore nel recupero del sito:', error);
    return null;
  }
}

interface SitePageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const site = await fetchSite(params.slug);

  if (!site || !site.isPublished) {
    return {
      title: 'Sito non trovato',
      description: 'Il sito richiesto non esiste o non è pubblicato',
    };
  }

  return {
    title: site.pages[0]?.seoTitle || `${site.name} - Creato con HostonHome`,
    description: site.pages[0]?.seoDesc || `Sito web di ${site.name}`,
    openGraph: {
      title: site.pages[0]?.seoTitle || site.name,
      description: site.pages[0]?.seoDesc || `Sito web di ${site.name}`,
      url: `https://${site.subdomain}`,
      type: 'website',
    },
  };
}

export default async function SitePage({ params }: SitePageProps) {
  const site = await fetchSite(params.slug);

  if (!site || !site.isPublished) {
    notFound();
  }

  const homePage = site.pages.find(page => page.isHome);
  if (!homePage) {
    notFound();
  }

  return (
    <html 
      className={`theme-${site.theme.accent.toLowerCase()} font-${site.theme.font.toLowerCase()} layout-${site.layoutType.toLowerCase()}`}
      lang="it"
    >
      <body className="min-h-screen bg-background text-foreground">
        <SiteViewer
          layoutType={site.layoutType}
          theme={site.theme}
          sections={homePage.sections}
        />
      </body>
    </html>
  );
}
