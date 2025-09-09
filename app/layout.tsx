import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../themes/globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { SupabaseWarning } from '@/components/auth/SupabaseWarning';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HostonHome - Crea il Tuo Sito Web in Minuti',
  description: 'Costruisci siti web professionali con il nostro builder drag-and-drop. Nessuna competenza tecnica richiesta, solo creatività e risultati.',
  keywords: ['site builder', 'website creator', 'drag and drop', 'web design', 'hosting'],
  authors: [{ name: 'HostonHome Team' }],
  creator: 'HostonHome',
  publisher: 'HostonHome',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://hostonhome.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'HostonHome - Crea il Tuo Sito Web in Minuti',
    description: 'Costruisci siti web professionali con il nostro builder drag-and-drop. Nessuna competenza tecnica richiesta, solo creatività e risultati.',
    url: 'https://hostonhome.com',
    siteName: 'HostonHome',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'HostonHome - Site Builder',
      },
    ],
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HostonHome - Crea il Tuo Sito Web in Minuti',
    description: 'Costruisci siti web professionali con il nostro builder drag-and-drop. Nessuna competenza tecnica richiesta, solo creatività e risultati.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="antialiased">
      <head>
        <link rel="icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2" />
        <link rel="manifest" href="/site.webmanifest?v=2" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={cn(
        'min-h-screen bg-background font-sans antialiased',
        inter.className
      )}>
        <AuthProvider>
          <SupabaseWarning />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
