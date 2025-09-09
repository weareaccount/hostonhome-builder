#!/bin/bash

echo "🚀 HostonHome Site Builder - Setup Script"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js non è installato. Installa Node.js 18+ e riprova."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ è richiesto. Versione attuale: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) rilevato"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm non è installato."
    exit 1
fi

echo "✅ npm $(npm -v) rilevato"

# Install dependencies
echo "📦 Installazione dipendenze..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Errore durante l'installazione delle dipendenze"
    exit 1
fi

echo "✅ Dipendenze installate con successo"

# Create environment file
if [ ! -f .env.local ]; then
    echo "🔧 Creazione file .env.local..."
    cp env.example .env.local
    echo "✅ File .env.local creato"
    echo "⚠️  Ricordati di configurare le variabili d'ambiente in .env.local"
else
    echo "✅ File .env.local già esistente"
fi

# Generate Prisma client
echo "🗄️  Generazione client Prisma..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Errore durante la generazione del client Prisma"
    exit 1
fi

echo "✅ Client Prisma generato"

# Check if .env.local is configured
if grep -q "your_supabase_project_url" .env.local; then
    echo "⚠️  ATTENZIONE: Le variabili d'ambiente non sono ancora configurate"
    echo "   Configura .env.local con i tuoi valori prima di continuare"
    echo ""
    echo "📋 Variabili da configurare:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo "   - STRIPE_SECRET_KEY"
    echo "   - DATABASE_URL"
    echo ""
    echo "🔗 Link utili:"
    echo "   - Supabase: https://supabase.com"
    echo "   - Stripe: https://stripe.com"
    echo ""
    echo "📖 Consulta il README.md per istruzioni dettagliate"
else
    echo "✅ Variabili d'ambiente configurate"
fi

echo ""
echo "🎉 Setup completato!"
echo ""
echo "📋 Prossimi passi:"
echo "1. Configura le variabili d'ambiente in .env.local"
echo "2. Configura il database Supabase"
echo "3. Configura Stripe per i pagamenti"
echo "4. Avvia l'applicazione: npm run dev"
echo ""
echo "🌐 L'applicazione sarà disponibile su http://localhost:3000"
echo ""
echo "📚 Documentazione: README.md"
echo "🐛 Problemi? Controlla i log o apri un issue su GitHub"
