'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LayoutType, ThemeAccent, ThemeFont, Section } from '@/types';

interface ThemePreviewProps {
  layoutType: LayoutType;
  theme: {
    accent: ThemeAccent;
    font: ThemeFont;
  };
  sections: Section[];
  className?: string;
}

// Layout Templates con stili specifici
const LAYOUT_STYLES = {
  ELEGANTE: {
    container: 'max-w-6xl mx-auto',
    hero: 'min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100',
    section: 'py-24 px-8',
    title: 'font-serif text-6xl md:text-7xl font-light leading-tight',
    subtitle: 'text-xl md:text-2xl text-slate-600 font-light',
    card: 'bg-white rounded-none shadow-lg border border-slate-200',
    spacing: 'space-y-16'
  },
  MEDIO: {
    container: 'max-w-5xl mx-auto',
    hero: 'min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white',
    section: 'py-20 px-6',
    title: 'text-5xl md:text-6xl font-semibold leading-tight',
    subtitle: 'text-lg md:text-xl text-gray-600',
    card: 'bg-white rounded-xl shadow-md border border-gray-100',
    spacing: 'space-y-12'
  },
  ESSENZIALE: {
    container: 'max-w-4xl mx-auto',
    hero: 'min-h-[70vh] flex items-center justify-center bg-white',
    section: 'py-16 px-4',
    title: 'text-4xl md:text-5xl font-bold leading-tight',
    subtitle: 'text-base md:text-lg text-gray-700',
    card: 'bg-white rounded-none border border-gray-300',
    spacing: 'space-y-8'
  }
};

// Accent Colors
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

// Font Classes
const FONT_CLASSES = {
  INTER: 'font-inter',
  POPPINS: 'font-poppins',
  MONTSERRAT: 'font-montserrat',
  WORKSANS: 'font-worksans',
  DMSANS: 'font-dmsans',
  NUNITO: 'font-nunito',
  ROBOTO: 'font-roboto',
  LATO: 'font-lato',
  LORA: 'font-lora',
  PLAYFAIR: 'font-playfair'
};

export const ThemePreview: React.FC<ThemePreviewProps> = ({
  layoutType,
  theme,
  sections,
  className
}) => {
  const layoutStyle = LAYOUT_STYLES[layoutType];
  const accentStyle = ACCENT_COLORS[theme.accent];
  const fontClass = FONT_CLASSES[theme.font];

  const renderSection = (section: Section, index: number) => {
    const sectionProps = section.props as any;
    
    switch (section.type) {
      case 'HERO':
        return (
          <section className={cn(layoutStyle.hero, 'relative overflow-hidden')}>
            <div className={layoutStyle.container}>
              <div className="text-center">
                <h1 className={cn(layoutStyle.title, fontClass, 'mb-6')}>
                  {sectionProps.title || 'Il Tuo Sito Web'}
                </h1>
                <p className={cn(layoutStyle.subtitle, fontClass, 'mb-8 max-w-3xl mx-auto')}>
                  {sectionProps.subtitle || 'Crea il tuo sito web professionale in pochi minuti'}
                </p>
                {sectionProps.ctaText && (
                  <button className={cn(
                    'px-8 py-4 text-white font-semibold rounded-lg transition-colors',
                    accentStyle.button
                  )}>
                    {sectionProps.ctaText}
                  </button>
                )}
              </div>
            </div>
          </section>
        );

      case 'ABOUT':
        return (
          <section className={cn(layoutStyle.section, 'bg-white')}>
            <div className={layoutStyle.container}>
              <div className="text-center">
                <h2 className={cn(layoutStyle.title, fontClass, 'mb-6')}>
                  {sectionProps.title || 'Chi Siamo'}
                </h2>
                <p className={cn(layoutStyle.subtitle, fontClass, 'max-w-3xl mx-auto')}>
                  {sectionProps.content || 'Siamo un team di creativi appassionati che trasforma le idee in realtà digitali.'}
                </p>
              </div>
            </div>
          </section>
        );

      case 'SERVICES':
        return (
          <section className={cn(layoutStyle.section, 'bg-gray-50')}>
            <div className={layoutStyle.container}>
              <div className="text-center mb-16">
                <h2 className={cn(layoutStyle.title, fontClass, 'mb-6')}>
                  {sectionProps.title || 'I Nostri Servizi'}
                </h2>
                <p className={cn(layoutStyle.subtitle, fontClass, 'max-w-2xl mx-auto')}>
                  {sectionProps.subtitle || 'Soluzioni innovative per la tua presenza online'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {sectionProps.services?.map((service: any, idx: number) => (
                  <div key={idx} className={cn(layoutStyle.card, 'p-8 text-center')}>
                    <div className="text-4xl mb-4">{service.icon || '✨'}</div>
                    <h3 className={cn('text-2xl font-semibold mb-4', fontClass)}>
                      {service.title || 'Servizio'}
                    </h3>
                    <p className="text-gray-600">
                      {service.description || 'Descrizione del servizio offerto'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'GALLERY':
        return (
          <section className={cn(layoutStyle.section, 'bg-white')}>
            <div className={layoutStyle.container}>
              <div className="text-center mb-16">
                <h2 className={cn(layoutStyle.title, fontClass, 'mb-6')}>
                  {sectionProps.title || 'Galleria'}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sectionProps.images?.map((image: any, idx: number) => (
                  <div key={idx} className={cn(layoutStyle.card, 'overflow-hidden')}>
                    <div className="aspect-video bg-gray-200 flex items-center justify-center">
                      {image.url ? (
                        <img src={image.url} alt={image.alt} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400">Immagine {idx + 1}</span>
                      )}
                    </div>
                    {image.caption && (
                      <p className="p-4 text-sm text-gray-600">{image.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'TESTIMONIALS':
        return (
          <section className={cn(layoutStyle.section, 'bg-gray-50')}>
            <div className={layoutStyle.container}>
              <div className="text-center mb-16">
                <h2 className={cn(layoutStyle.title, fontClass, 'mb-6')}>
                  {sectionProps.title || 'Testimonianze'}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {sectionProps.testimonials?.map((testimonial: any, idx: number) => (
                  <div key={idx} className={cn(layoutStyle.card, 'p-8')}>
                    <p className="text-lg text-gray-600 mb-6 italic">
                      "{testimonial.content || 'Testimonianza del cliente'}"
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        {testimonial.avatar ? (
                          <img src={testimonial.avatar} alt={testimonial.author} className="rounded-full" />
                        ) : (
                          <span className="text-gray-600 font-semibold">
                            {testimonial.author?.charAt(0) || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.author || 'Cliente'}</p>
                        {testimonial.role && (
                          <p className="text-sm text-gray-500">{testimonial.role}</p>
                        )}
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
          <section className={cn(layoutStyle.section, 'bg-white')}>
            <div className={layoutStyle.container}>
              <div className="text-center">
                <h2 className={cn(layoutStyle.title, fontClass, 'mb-6')}>
                  {sectionProps.title || 'Contattaci'}
                </h2>
                <p className={cn(layoutStyle.subtitle, fontClass, 'mb-8 max-w-2xl mx-auto')}>
                  {sectionProps.subtitle || 'Come possiamo aiutarti'}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  {sectionProps.email && (
                    <div className="text-center">
                      <h3 className="font-semibold mb-2">Email</h3>
                      <a href={`mailto:${sectionProps.email}`} className={cn('hover:underline', accentStyle.accent)}>
                        {sectionProps.email}
                      </a>
                    </div>
                  )}
                  
                  {sectionProps.phone && (
                    <div className="text-center">
                      <h3 className="font-semibold mb-2">Telefono</h3>
                      <a href={`tel:${sectionProps.phone}`} className={cn('hover:underline', accentStyle.accent)}>
                        {sectionProps.phone}
                      </a>
                    </div>
                  )}
                  
                  {sectionProps.address && (
                    <div className="text-center">
                      <h3 className="font-semibold mb-2">Indirizzo</h3>
                      <p className="text-gray-600">{sectionProps.address}</p>
                    </div>
                  )}
                </div>
                
                {sectionProps.showContactForm && (
                  <div className="max-w-md mx-auto">
                    <p className="text-gray-600 mb-4">
                      Inviaci un messaggio e ti risponderemo al più presto.
                    </p>
                    <form className="space-y-4">
                      <input
                        type="text"
                        placeholder="Nome"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <textarea
                        placeholder="Il tuo messaggio..."
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      ></textarea>
                      <button
                        type="submit"
                        className={cn(
                          'w-full px-6 py-3 text-white font-semibold rounded-lg transition-colors',
                          accentStyle.button
                        )}
                      >
                        Invia Messaggio
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn(
      'min-h-screen bg-white',
      fontClass,
      `theme-${theme.accent.toLowerCase()}`,
      `layout-${layoutType.toLowerCase()}`,
      className
    )}>
      {/* Theme Info Bar */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 text-center text-sm text-gray-600">
        <span className="font-medium">Tema:</span> {layoutType} • {theme.accent} • {theme.font}
      </div>
      
      {/* Live Preview Content */}
      <div className={cn(layoutStyle.spacing)}>
        {sections.map((section, index) => (
          <div key={section.id}>
            {renderSection(section, index)}
          </div>
        ))}
      </div>
    </div>
  );
};
