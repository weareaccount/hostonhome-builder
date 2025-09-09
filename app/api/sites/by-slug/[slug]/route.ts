import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Verifica se Supabase è configurato
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Supabase non configurato - modalità demo'
      }, { status: 500 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Cerca il progetto tramite slug
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug);

    if (error) {
      console.error('Errore nel recupero progetto:', error);
      return NextResponse.json({
        success: false,
        error: 'Errore nel database'
      }, { status: 500 });
    }

    if (!projects || projects.length === 0) {
      // Se non ci sono progetti reali, restituisci un progetto demo
      return NextResponse.json({
        success: true,
        data: {
          id: 'demo-site',
          name: `Demo - ${slug}`,
          slug: slug,
          subdomain: `${slug}.hostonhome.it`,
          layoutType: 'ELEGANTE',
          theme: { accent: 'BLUE', font: 'INTER' },
          isPublished: true,
          plan: 'PLUS',
          pages: [
            {
              id: 'page-1',
              path: '/',
              isHome: true,
              seoTitle: `Demo ${slug} - Creato con HostonHome`,
              seoDesc: `Sito demo di ${slug}`,
              sections: [
                {
                  id: 'hero-demo',
                  type: 'HERO',
                  props: {
                    title: 'Sito Demo',
                    subtitle: 'Questo è un sito demo per mostrare le funzionalità di HostonHome',
                    ctaText: 'Scopri di più',
                    ctaUrl: '#about',
                    isActive: true,
                    order: 0
                  }
                },
                {
                  id: 'about-demo',
                  type: 'ABOUT',
                  props: {
                    title: 'Chi Siamo',
                    content: 'Questo è un contenuto demo per la sezione About.',
                    isActive: true,
                    order: 1
                  }
                }
              ]
            }
          ]
        }
      });
    }

    const project = projects[0];

    // Trasforma il progetto nel formato Site per la visualizzazione
    const site = {
      id: project.id,
      name: project.name,
      slug: project.slug,
      subdomain: `${project.slug}.hostonhome.it`,
      layoutType: project.layout_type || 'ELEGANTE',
      theme: project.theme || { accent: 'BLUE', font: 'INTER' },
      isPublished: true, // Per ora tutti i siti sono considerati pubblicati
      plan: 'PLUS', // Piano di default
      pages: [
        {
          id: 'page-1',
          path: '/',
          isHome: true,
          seoTitle: `${project.name} - Creato con HostonHome`,
          seoDesc: `Sito web di ${project.name}`,
          sections: Array.isArray(project.sections) ? project.sections : []
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: site
    });

  } catch (error) {
    console.error('Errore nella API by-slug:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server'
    }, { status: 500 });
  }
}
