import { LayoutType, SectionType } from '@/types';

export interface LayoutTemplate {
  id: string;
  name: string;
  layoutType: LayoutType;
  description: string;
  thumbnailUrl: string;
  sectionsSchema: SectionType[];
  defaultSections: Array<{
    type: SectionType;
    order: number;
    props: any;
  }>;
}

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  {
    id: 'elegante-1',
    name: 'Elegante Luxury',
    layoutType: 'ELEGANTE',
    description: 'Design raffinato con spaziature ampie, tipografia serif e layout asimmetrico per hotel di lusso',
    thumbnailUrl: '/templates/elegante-luxury.jpg',
    sectionsSchema: ['HERO', 'ABOUT', 'SERVICES', 'GALLERY', 'TESTIMONIALS', 'CONTACT'],
    defaultSections: [
      {
        type: 'HERO',
        order: 0,
        props: {
          title: 'LUXURY HOTEL',
          subtitle: 'Benvenuto nel tuo soggiorno di lusso',
          ctaText: 'Prenota Ora',
          ctaUrl: '#booking',
          backgroundImage: null,
          showBookingForm: true,
          isActive: true,
          order: 0,
        },
      },
      {
        type: 'ABOUT',
        order: 1,
        props: {
          title: 'We have 17+ years of Experience',
          content: 'Consectetur adipisicing elit. Nihil, illum voluptate eveniet ex fugit ea delectus, sed voluptatem. Laborum accusantium libero commodi id officiis itaque esse adipisci, necessitatibus asperiores, illo odio.',
          image: null,
          imageAlt: 'Hotel experience',
          ctaText: 'MORE ABOUT US',
          ctaUrl: '#about',
          isActive: true,
          order: 1,
        },
      },
      {
        type: 'SERVICES',
        order: 2,
        props: {
          title: 'Our Best Rooms',
          subtitle: 'Laborum accusantium libero commodi id officiis itaque esse adipisci, necessitatibus asperiores, illo odio.',
          services: [
            {
              title: 'Deluxe room',
              description: 'Image for cattle earth. May one Which life divide sea. Optio veniam quibusdam fugit aspernatur ratione rerum necessitatibus ipsa eligendi? Laudantium beatae aut earum ab doloribus tempore veritatis repellat natus illo, veniam quibusdam fugit aspernatur cumque harum quos esse libero nesciunt, molestiae saepe, possimus a suscipit.',
              icon: '🛏️',
              guests: '4',
              size: '95ft²',
              price: '€49',
              category: 'Luxe',
              image: null
            },
            {
              title: 'Standard Room',
              description: 'Image for cattle earth. May one Which life divide sea. Optio veniam quibusdam fugit aspernatur ratione rerum necessitatibus ipsa eligendi? Laudantium beatae aut earum ab doloribus tempore veritatis repellat natus illo, veniam quibusdam fugit aspernatur cumque harum quos esse libero nesciunt, molestiae saepe, possimus a suscipit.',
              icon: '🏠',
              guests: '2',
              size: '50ft²',
              price: '€29',
              category: 'Economy',
              image: null
            },
            {
              title: 'Double Room',
              description: 'Image for cattle earth. May one Which life divide sea. Optio veniam quibusdam fugit aspernatur ratione rerum necessitatibus ipsa eligendi? Laudantium beatae aut earum ab doloribus tempore veritatis repellat natus illo, veniam quibusdam fugit aspernatur cumque harum quos esse libero nesciunt, molestiae saepe, possimus a suscipit.',
              icon: '🛌',
              guests: '2',
              size: '35ft²',
              price: '€39',
              category: 'Economy',
              image: null
            },
            {
              title: 'Classic Room',
              description: 'Image for cattle earth. May one Which life divide sea. Optio veniam quibusdam fugit aspernatur ratione rerum necessitatibus ipsa eligendi? Laudantium beatae aut earum ab doloribus tempore veritatis repellat natus illo, veniam quibusdam fugit aspernatur cumque harum quos esse libero nesciunt, molestiae saepe, possimus a suscipit.',
              icon: '🏛️',
              guests: '3',
              size: '42ft²',
              price: '€35',
              category: 'Standard',
              image: null
            }
          ],
          ctaText: 'All rooms',
          ctaUrl: '#rooms',
          isActive: true,
          order: 2,
        },
      },
      {
        type: 'GALLERY',
        order: 3,
        props: {
          title: 'Around The Hotel',
          subtitle: 'Laborum accusantium libero commodi id officiis itaque esse adipisci, necessitatibus asperiores, illo odio.',
          services: [
            {
              title: 'Gym',
              description: 'Commodi soluta minima nemo,…',
              icon: '💪',
              features: [
                'Attrezzature moderne',
                'Personal trainer disponibile',
                'Orari flessibili',
                'Sala cardio',
                'Area pesi'
              ],
              image: null
            },
            {
              title: 'Pool',
              description: 'Commodi soluta minima nemo,…',
              icon: '🏊',
              features: [
                'Piscina all\'aperto',
                'Vista panoramica',
                'Lettini disponibili',
                'Bar poolside',
                'Servizio asciugamani'
              ],
              image: null
            },
            {
              title: 'Lounge bar',
              description: 'Commodi soluta minima nemo,…',
              icon: '🍸',
              features: [
                'Cocktail di qualità',
                'Ambiente elegante',
                'Musica dal vivo',
                'Happy hour',
                'Servizio in camera'
              ],
              image: null
            }
          ],
          ctaText: 'All Services',
          ctaUrl: '#services',
          isActive: true,
          order: 3,
        },
      },
      {
        type: 'TESTIMONIALS',
        order: 4,
        props: {
          title: 'Feedback from our Guests',
          subtitle: 'Consectetur adipisicing elit. Nihil, illum voluptate eveniet ex fugit ea delectus, sed voluptatem. Laborum accusantium libero commodi id officiis itaque esse adipisci, necessitatibus asperiores, illo odio.',
          testimonials: [
            {
              name: 'Oscar Newman',
              location: 'From Poland',
              content: 'Dequi folores dolor sit amet, consectetur adipisicing elit. Nesciunt illo, delectus totam! Delectus illo magnam voluptatem a tempora id vitae dolor, quis natus iusto molestiae ab nam error vero possimus ullam facilis porro veritatis?',
              avatar: null,
              rating: 5
            },
            {
              name: 'Emma Trueman',
              location: 'From Poland',
              content: 'Dequi folores dolor sit amet, consectetur adipisicing elit. Nesciunt illo, delectus totam! Delectus illo magnam voluptatem a tempora id vitae dolor, quis natus iusto molestiae ab nam error vero possimus ullam facilis porro veritatis?',
              avatar: null,
              rating: 5
            },
            {
              name: 'Viktoria Freeman',
              location: 'From Ukraine',
              content: 'Dequi folores dolor sit amet, consectetur adipisicing elit. Nesciunt illo, delectus totam! Delectus illo magnam voluptatem a tempora id vitae dolor, quis natus iusto molestiae ab nam error vero possimus ullam facilis porro veritatis?',
              avatar: null,
              rating: 5
            }
          ],
          isActive: true,
          order: 4,
        },
      },
      {
        type: 'CONTACT',
        order: 5,
        props: {
          title: 'Contattaci',
          subtitle: 'Kinsley ti aspetta!',
          email: 'info@kinsleyhotel.com',
          phone: '+39 123 456 789',
          address: 'Via del Mare 123, Roma, Italia',
          showContactForm: true,
          isActive: true,
          order: 5,
        },
      },
    ],
  },
  {
    id: 'medio-1',
    name: 'Medio Luxury Hotel',
    layoutType: 'ELEGANTE',
    description: 'Stile bilanciato con card, icone moderne e layout a griglia per hotel di lusso',
    thumbnailUrl: '/templates/medio-luxury.jpg',
    sectionsSchema: ['HERO', 'ABOUT', 'SERVICES', 'GALLERY', 'TESTIMONIALS', 'CONTACT'],
    defaultSections: [
      {
        type: 'HERO',
        order: 0,
        props: {
          title: 'LUXURY HOTEL',
          subtitle: 'Benvenuto nel tuo soggiorno di lusso',
          ctaText: 'Prenota Ora',
          ctaUrl: '#booking',
          backgroundImage: null,
          showBookingForm: true,
          isActive: true,
          order: 0,
        },
      },
      {
        type: 'ABOUT',
        order: 1,
        props: {
          title: 'Abbiamo 17+ anni di Esperienza',
          content: 'Consectetur adipisicing elit. Nihil, illum voluptate eveniet ex fugit ea delectus, sed voluptatem. Laborum accusantium libero commodi id officiis itaque esse adipisci, necessitatibus asperiores, illo odio.',
          image: null,
          imageAlt: 'Hotel experience',
          ctaText: 'Scopri di più',
          ctaUrl: '#about',
          isActive: true,
          order: 1,
        },
      },
      {
        type: 'SERVICES',
        order: 2,
        props: {
          title: 'Le Nostre Migliori Camere',
          subtitle: 'Laborum accusantium libero commodi id officiis itaque esse adipisci, necessitatibus asperiores, illo odio.',
          services: [
            {
              title: 'Deluxe Room',
              description: 'Image for cattle earth. May one Which life divide sea. Optio veniam quibusdam fugit aspernatur ratione rerum necessitatibus ipsa eligendi?',
              icon: '🛏️',
              guests: '4',
              size: '95ft²',
              price: '€49',
              category: 'Luxe'
            },
            {
              title: 'Standard Room',
              description: 'Image for cattle earth. May one Which life divide sea. Optio veniam quibusdam fugit aspernatur ratione rerum necessitatibus ipsa eligendi?',
              icon: '🏠',
              guests: '2',
              size: '50ft²',
              price: '€29',
              category: 'Economy'
            },
            {
              title: 'Double Room',
              description: 'Image for cattle earth. May one Which life divide sea. Optio veniam quibusdam fugit aspernatur ratione rerum necessitatibus ipsa eligendi?',
              icon: '🛌',
              guests: '2',
              size: '35ft²',
              price: '€39',
              category: 'Economy'
            },
            {
              title: 'Classic Room',
              description: 'Image for cattle earth. May one Which life divide sea. Optio veniam quibusdam fugit aspernatur ratione rerum necessitatibus ipsa eligendi?',
              icon: '🏛️',
              guests: '3',
              size: '42ft²',
              price: '€35',
              category: 'Standard'
            }
          ],
          ctaText: 'Tutte le camere',
          ctaUrl: '#rooms',
          isActive: true,
          order: 2,
        },
      },
      {
        type: 'GALLERY',
        order: 3,
        props: {
          title: 'Intorno all\'Hotel',
          subtitle: 'Laborum accusantium libero commodi id officiis itaque esse adipisci, necessitatibus asperiores, illo odio.',
          services: [
            {
              title: 'Gym',
              description: 'Commodi soluta minima nemo,…',
              icon: '💪',
              price: 'Gratis',
              image: null
            },
            {
              title: 'Pool',
              description: 'Commodi soluta minima nemo,…',
              icon: '🏊',
              price: '€10 / Per Instance / Per Guest',
              image: null
            },
            {
              title: 'Lounge Bar',
              description: 'Commodi soluta minima nemo,…',
              icon: '🍸',
              price: 'Gratis',
              image: null
            }
          ],
          ctaText: 'Tutti i servizi',
          ctaUrl: '#services',
          isActive: true,
          order: 3,
        },
      },
      {
        type: 'TESTIMONIALS',
        order: 4,
        props: {
          title: 'Feedback dai nostri Ospiti',
          subtitle: 'Consectetur adipisicing elit. Nihil, illum voluptate eveniet ex fugit ea delectus, sed voluptatem. Laborum accusantium libero commodi id officiis itaque esse adipisci, necessitatibus asperiores, illo odio.',
          testimonials: [
            {
              name: 'Oscar Newman',
              location: 'Dalla Polonia',
              content: 'Dequi folores dolor sit amet, consectetur adipisicing elit. Nesciunt illo, delectus totam! Delectus illo magnam voluptatem a tempora id vitae dolor, quis natus iusto molestiae ab nam error vero possimus ullam facilis porro veritatis?',
              avatar: null,
              rating: 5
            },
            {
              name: 'Emma Trueman',
              location: 'Dalla Polonia',
              content: 'Dequi folores dolor sit amet, consectetur adipisicing elit. Nesciunt illo, delectus totam! Delectus illo magnam voluptatem a tempora id vitae dolor, quis natus iusto molestiae ab nam error vero possimus ullam facilis porro veritatis?',
              avatar: null,
              rating: 5
            },
            {
              name: 'Viktoria Freeman',
              location: 'Dall\'Ucraina',
              content: 'Dequi folores dolor sit amet, consectetur adipisicing elit. Nesciunt illo, delectus totam! Delectus illo magnam voluptatem a tempora id vitae dolor, quis natus iusto molestiae ab nam error vero possimus ullam facilis porro veritatis?',
              avatar: null,
              rating: 5
            }
          ],
          isActive: true,
          order: 4,
        },
      },
      {
        type: 'CONTACT',
        order: 5,
        props: {
          title: 'Contattaci',
          subtitle: 'Kinsley ti aspetta!',
          email: 'info@kinsleyhotel.com',
          phone: '+39 123 456 789',
          address: 'Via del Mare 123, Roma, Italia',
          showContactForm: true,
          isActive: true,
          order: 5,
        },
      },
    ],
  },
  {
    id: 'essenziale-1',
    name: 'Essenziale Minimal',
    layoutType: 'ELEGANTE',
    description: 'Design minimalista e compatto per massima leggibilità e performance',
    thumbnailUrl: '/templates/essenziale-minimal.jpg',
    sectionsSchema: ['HERO', 'ABOUT', 'SERVICES', 'GALLERY', 'CONTACT'],
    defaultSections: [
      {
        type: 'HERO',
        order: 0,
        props: {
          title: 'Semplicità & Efficienza',
          subtitle: 'Soluzioni digitali che funzionano',
          ctaText: 'Scopri',
          ctaUrl: '#services',
          backgroundImage: null,
          isActive: true,
          order: 0,
        },
      },
      {
        type: 'SERVICES',
        order: 1,
        props: {
          title: 'Cosa Offriamo',
          subtitle: 'Servizi essenziali per il tuo business',
          services: [
            {
              title: 'Web Design',
              description: 'Design pulito e funzionale',
              icon: '🎨',
            },
            {
              title: 'Sviluppo',
              description: 'Codice ottimizzato e veloce',
              icon: '⚡',
            },
            {
              title: 'Hosting',
              description: 'Server affidabili e sicuri',
              icon: '🔒',
            },
          ],
          isActive: true,
          order: 1,
        },
      },
      {
        type: 'ABOUT',
        order: 2,
        props: {
          title: 'Chi Siamo',
          content: 'Specialisti in soluzioni digitali semplici ed efficaci. Crediamo che la semplicità sia la forma più alta di sofisticazione.',
          image: null,
          imageAlt: 'Team essenziale',
          isActive: true,
          order: 2,
        },
      },
      {
        type: 'GALLERY',
        order: 3,
        props: {
          title: 'Lavori',
          images: [
            { url: null, alt: 'Sito minimal', caption: 'Clean design' },
            { url: null, alt: 'App semplice', caption: 'User-friendly' },
          ],
          isActive: true,
          order: 3,
        },
      },
      {
        type: 'CONTACT',
        order: 4,
        props: {
          title: 'Contatti',
          subtitle: 'Parliamo del tuo progetto',
          email: 'info@essenziale.it',
          phone: null,
          address: null,
          showContactForm: false,
          isActive: true,
          order: 4,
        },
      },
    ],
  },
];

// Helper function to get template by ID
export const getTemplateById = (id: string): LayoutTemplate | undefined => {
  return LAYOUT_TEMPLATES.find(template => template.id === id);
};

// Helper function to get templates by layout type
export const getTemplatesByLayoutType = (layoutType: LayoutType): LayoutTemplate[] => {
  return LAYOUT_TEMPLATES.filter(template => template.layoutType === layoutType);
};

// Helper function to get default sections for a template
export const getDefaultSectionsForTemplate = (templateId: string) => {
  const template = getTemplateById(templateId);
  return template?.defaultSections || [];
};

// Configurazione template per layout predefiniti
export const LAYOUT_CONFIG = {
  ELEGANTE: {
    name: 'Host On Home',
    description: 'Design raffinato con spaziature ampie e tipografia serif per hotel di lusso',
    icon: '🏡',
    defaultTheme: {
      accent: 'VIOLET',
      font: 'MONTSERRAT'
    },
    templateId: 'elegante-1'
  }
};

// Helper per ottenere configurazione layout
export const getLayoutConfig = (layoutType: string) => {
  return LAYOUT_CONFIG[layoutType as keyof typeof LAYOUT_CONFIG] || LAYOUT_CONFIG.ELEGANTE;
};

// Helper per ottenere template predefinito per layout
export const getDefaultTemplateForLayout = (layoutType: string) => {
  const config = getLayoutConfig(layoutType);
  return getTemplateById(config.templateId);
};
