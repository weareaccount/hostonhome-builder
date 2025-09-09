# HostonHome - Site Builder

Un site builder moderno e intuitivo per creare siti web professionali senza competenze tecniche.

## 🚀 Caratteristiche

- **Builder Drag & Drop**: Interfaccia intuitiva per riordinare e personalizzare sezioni
- **3 Layout Predefiniti**: Elegante, Medio, Essenziale
- **Personalizzazione Limitata**: 5 colori accent, 10 font professionali
- **Template Responsive**: Design ottimizzato per tutti i dispositivi
- **Hosting Integrato**: Deploy automatico su Vercel con subdominio personalizzato
- **Abbonamenti Stripe**: Piani Base, Plus e Pro con limiti configurabili
- **Autenticazione Supabase**: Login sicuro con email/password e OAuth
- **Database PostgreSQL**: Architettura scalabile e performante

## 🛠️ Stack Tecnologico

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Drag & Drop**: dnd-kit
- **Database**: Supabase (PostgreSQL)
- **Autenticazione**: Supabase Auth
- **Storage**: Supabase Storage
- **Pagamenti**: Stripe
- **Deploy**: Vercel
- **Form Validation**: Zod, React Hook Form

## 📋 Requisiti

- Node.js 18+ 
- npm o yarn
- Account Supabase
- Account Stripe
- Account Vercel

## 🚀 Installazione

### 1. Clona il repository

```bash
git clone https://github.com/yourusername/hostonhome-builder.git
cd hostonhome-builder
```

### 2. Installa le dipendenze

```bash
npm install
# oppure
yarn install
```

### 3. Configura le variabili d'ambiente

Crea un file `.env.local` nella root del progetto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Stripe Product IDs
STRIPE_BASE_PRODUCT_ID=prod_xxx
STRIPE_PLUS_PRODUCT_ID=prod_xxx
STRIPE_PRO_PRODUCT_ID=prod_xxx

# Stripe Price IDs
STRIPE_BASE_MONTHLY_PRICE_ID=price_xxx
STRIPE_BASE_YEARLY_PRICE_ID=price_xxx
STRIPE_PLUS_MONTHLY_PRICE_ID=price_xxx
STRIPE_PLUS_YEARLY_PRICE_ID=price_xxx
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxx

# Database
DATABASE_URL=your_database_url

# App
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Configura il database

```bash
# Genera il client Prisma
npm run db:generate

# Applica le migrazioni
npm run db:push

# (Opzionale) Apri Prisma Studio
npm run db:studio
```

### 5. Avvia l'applicazione

```bash
npm run dev
# oppure
yarn dev
```

L'applicazione sarà disponibile su [http://localhost:3000](http://localhost:3000)

## 🏗️ Struttura del Progetto

```
hostonhome-builder/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard utente
│   ├── api/              # API routes
│   └── globals.css       # CSS globale
├── components/            # Componenti React
│   ├── ui/               # Componenti UI base (shadcn/ui)
│   ├── builder/          # Componenti del site builder
│   └── wizard/           # Wizard di creazione sito
├── lib/                  # Utility e configurazioni
│   ├── supabase.ts       # Client Supabase
│   ├── stripe.ts         # Configurazione Stripe
│   ├── constants.ts      # Costanti dell'app
│   └── utils.ts          # Funzioni utility
├── types/                # Definizioni TypeScript
├── themes/               # Temi e stili CSS
├── templates/            # Template predefiniti
├── prisma/               # Schema e migrazioni database
└── public/               # Asset statici
```

## 🎨 Personalizzazione

### Temi e Colori

L'applicazione supporta 5 colori accent predefiniti:

- **Blu**: `#2563eb` (37,99,235)
- **Verde**: `#16a34a` (22,163,74)
- **Rosso**: `#dc2626` (220,38,38)
- **Ambra**: `#f59e0b` (245,158,11)
- **Viola**: `#8b5cf6` (139,92,246)

### Font Disponibili

10 font professionali inclusi:

- Inter, Poppins, Montserrat
- Work Sans, DM Sans, Nunito
- Roboto, Lato, Lora, Playfair Display

### Layout Template

3 layout predefiniti con stili diversi:

- **Elegante**: Design raffinato con spaziature ampie
- **Medio**: Stile bilanciato con card e icone
- **Essenziale**: Design minimalista e compatto

## 🔧 Configurazione Avanzata

### Supabase

1. Crea un nuovo progetto su [supabase.com](https://supabase.com)
2. Copia le credenziali API
3. Configura le tabelle e le policy RLS
4. Abilita l'autenticazione email/password

### Stripe

1. Crea un account su [stripe.com](https://stripe.com)
2. Crea i prodotti e i prezzi per i piani
3. Configura i webhook per gestire gli abbonamenti
4. Copia le chiavi API

### Vercel

1. Collega il repository GitHub a Vercel
2. Configura le variabili d'ambiente
3. Abilita il deploy automatico

## 📱 Utilizzo

### 1. Creazione Sito

1. Registrati o accedi all'applicazione
2. Clicca su "Crea Nuovo Sito"
3. Segui il wizard a 3 step:
   - Scegli il layout
   - Personalizza tema (colori + font)
   - Inserisci nome e logo
4. Vai al builder per personalizzare

### 2. Site Builder

- **Sidebar Sinistra**: Lista sezioni e aggiunta nuove
- **Canvas Centrale**: Preview e drag & drop
- **Sidebar Destra**: Form per modificare le proprietà

### 3. Pubblicazione

1. Personalizza tutte le sezioni
2. Clicca su "Pubblica"
3. Il sito sarà disponibile sul subdominio scelto

## 🔒 Sicurezza

- Autenticazione JWT con Supabase
- Policy RLS per isolamento tenant
- Validazione input con Zod
- Rate limiting su API critiche
- Sanificazione stringhe e XSS protection

## 📊 Performance

- **Lighthouse Score**: Target ≥90
- **Core Web Vitals**: Ottimizzati
- **Bundle Size**: <500KB (gzipped)
- **Image Optimization**: WebP/AVIF con Next.js Image
- **ISR**: Revalidazione automatica

## 🚀 Deploy

### Vercel (Raccomandato)

```bash
# Build dell'applicazione
npm run build

# Deploy su Vercel
vercel --prod
```

### Altri Provider

L'applicazione può essere deployata su qualsiasi provider che supporti Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contribuire

1. Fork il repository
2. Crea un branch per la feature (`git checkout -b feature/amazing-feature`)
3. Commit le modifiche (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Apri una Pull Request

## 📝 Licenza

Questo progetto è sotto licenza MIT. Vedi il file [LICENSE](LICENSE) per i dettagli.

## 🆘 Supporto

- **Documentazione**: [docs.hostonhome.com](https://docs.hostonhome.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/hostonhome-builder/issues)
- **Email**: support@hostonhome.com

## 🔮 Roadmap

### V2 (Q2 2024)
- [ ] Domini personalizzati
- [ ] Analytics base integrate
- [ ] Modulo contatti avanzato
- [ ] Multi-lingua

### V3 (Q3 2024)
- [ ] E-commerce integrato
- [ ] Blog e CMS
- [ ] API pubblica
- [ ] Marketplace template

---

**HostonHome** - Trasforma le tue idee in siti web professionali 🚀
