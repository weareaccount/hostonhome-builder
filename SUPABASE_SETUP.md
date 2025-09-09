# 🚀 Setup Supabase per HostonHome Builder

## 📋 Prerequisiti
- Account Supabase (gratuito su [supabase.com](https://supabase.com))
- Node.js e npm installati

## 🔧 Passi per il Setup

### 1. Creazione Progetto Supabase
1. Vai su [supabase.com](https://supabase.com)
2. Clicca "New Project"
3. Scegli il tuo organization
4. Inserisci:
   - **Name**: `hostonhome-builder`
   - **Database Password**: scegli una password sicura
   - **Region**: scegli la regione più vicina
5. Clicca "Create new project"

### 2. Ottenere le Credenziali
1. Nel dashboard del progetto, vai su **Settings** → **API**
2. Copia:
   - **Project URL** (es: `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key (inizia con `eyJ...`)

### 3. Configurazione Variabili d'Ambiente
Crea un file `.env.local` nella root del progetto:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tuo-progetto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Esecuzione Schema Database
1. Nel dashboard Supabase, vai su **SQL Editor**
2. Clicca "New query"
3. Copia e incolla il contenuto di `database/schema.sql`
4. Clicca "Run" per eseguire lo script

### 5. Configurazione Autenticazione
1. Nel dashboard, vai su **Authentication** → **Settings**
2. In **Site URL** inserisci: `http://localhost:3000`
3. In **Redirect URLs** aggiungi:
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/login`
4. Clicca "Save"

### 6. Test dell'Installazione
1. Riavvia il server di sviluppo: `npm run dev`
2. Vai su `http://localhost:3000/login`
3. Prova a registrare un nuovo account
4. Verifica che venga creato nella tabella `auth.users`

## 🗄️ Struttura Database

### Tabella `projects`
- `id`: UUID primario
- `user_id`: riferimento all'utente
- `name`: nome del progetto
- `slug`: URL univoco del progetto
- `sections`: array JSON delle sezioni del sito
- `theme`: oggetto JSON con accent e font
- `layout_type`: tipo di layout (ELEGANTE, MEDIO, ESSENZIALE)
- `created_at`: data di creazione
- `updated_at`: data di ultimo aggiornamento

## 🔒 Sicurezza

- **Row Level Security (RLS)** abilitato
- Ogni utente vede solo i propri progetti
- I progetti sono accessibili pubblicamente per preview
- Autenticazione gestita da Supabase Auth

## 🚀 Funzionalità Implementate

- ✅ **Autenticazione utenti** con email/password
- ✅ **Dashboard personale** per ogni utente
- ✅ **Salvataggio automatico** dei progetti
- ✅ **Gestione progetti** (crea, modifica, elimina)
- ✅ **Preview pubblica** dei siti
- ✅ **Responsive design** per mobile/tablet/desktop

## 🐛 Troubleshooting

### Errore "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### Errore di connessione a Supabase
- Verifica le credenziali in `.env.local`
- Controlla che il progetto sia attivo su Supabase
- Verifica che l'IP non sia bloccato

### Problemi di autenticazione
- Controlla le URL di redirect in Supabase
- Verifica che il dominio sia corretto
- Controlla i log di autenticazione in Supabase

## 📚 Risorse Utili

- [Documentazione Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

## 🎯 Prossimi Passi

1. **Personalizzazione temi**: aggiungere più opzioni di colori e font
2. **Template predefiniti**: creare siti di esempio
3. **Condivisione progetti**: permettere la condivisione tra utenti
4. **Analytics**: tracciare le visite ai siti
5. **Backup automatico**: salvataggio periodico dei progetti
