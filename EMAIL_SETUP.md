# 📧 Setup Sistema Email per HostonHome Builder

## 🎯 Panoramica

Il sistema di email automatiche informa gli utenti su:
- ✅ **Registrazione completata** e inizio trial
- ⏰ **Fine trial imminente** (3 giorni prima)
- ⚠️ **Pagamenti falliti** e sospensione servizi
- 🎉 **Trial diventato pagante** (opzionale)

## 🔧 Configurazione Resend

### 1. Creazione Account Resend
1. Vai su [resend.com](https://resend.com)
2. Crea un account gratuito
3. Verifica il tuo dominio (opzionale, puoi usare il dominio di Resend)

### 2. Ottenere API Key
1. Nel dashboard Resend, vai su **API Keys**
2. Clicca **Create API Key**
3. Copia la chiave (inizia con `re_`)

### 3. Configurazione Variabili d'Ambiente
Aggiungi al file `.env.local`:

```bash
# Email Configuration (Resend)
RESEND_API_KEY=re_your_api_key_here
```

## 🎨 Template Email

### Email di Benvenuto
- **Trigger**: Registrazione completata
- **Contenuto**: 
  - Conferma registrazione
  - Informazioni trial (7 giorni)
  - Link alla dashboard
  - Istruzioni per iniziare

### Email Fine Trial
- **Trigger**: 3 giorni prima della fine trial
- **Contenuto**:
  - Avviso scadenza imminente
  - Link per continuare
  - Rassicurazione su continuità servizio

### Email Pagamento Fallito
- **Trigger**: Pagamento non riuscito
- **Contenuto**:
  - Spiegazione problema
  - Link per aggiornare pagamento
  - Istruzioni per riattivare servizi

## 🔗 Configurazione Webhook Stripe

### 1. Creare Webhook in Stripe
1. Vai su [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Developers** → **Webhooks**
3. Clicca **Add endpoint**
4. URL: `https://tuodominio.com/api/stripe/webhook`
5. Eventi da ascoltare:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`

### 2. Ottenere Webhook Secret
1. Dopo aver creato il webhook, clicca su di esso
2. Copia il **Signing secret** (inizia con `whsec_`)
3. Aggiungi al `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 🚀 Test del Sistema

### Test Email di Benvenuto
1. Registra un nuovo utente
2. Completa il checkout Stripe
3. Verifica che l'email arrivi nella casella di posta

### Test Webhook
1. Usa [ngrok](https://ngrok.com) per esporre localhost
2. Configura il webhook con l'URL ngrok
3. Simula eventi Stripe per testare

## 📊 Monitoraggio

### Log Email
Le email inviate vengono loggate nella console:
```
✅ Email di benvenuto inviata a: user@example.com
✅ Email fine trial inviata a: user@example.com
✅ Email pagamento fallito inviata a: user@example.com
```

### Dashboard Resend
- Monitora email inviate
- Tassi di apertura e click
- Email bounce e spam

## 🛠️ Personalizzazione

### Modificare Template
I template sono in `lib/email.ts`:
- `sendWelcomeEmail()` - Email di benvenuto
- `sendTrialEndingEmail()` - Email fine trial
- `sendPaymentFailedEmail()` - Email pagamento fallito

### Aggiungere Nuove Email
1. Crea nuova funzione in `lib/email.ts`
2. Aggiungi trigger nel webhook
3. Testa l'invio

## 🔒 Sicurezza

### Verifica Webhook
- Stripe firma tutti i webhook
- Il sistema verifica la signature automaticamente
- Webhook non verificati vengono rifiutati

### Rate Limiting
- Resend ha limiti di invio
- Account gratuito: 3.000 email/mese
- Account a pagamento: limiti più alti

## 📈 Metriche

### Email Tracking
- Aperture email
- Click sui link
- Conversioni da email

### Business Impact
- Riduzione abbandono trial
- Miglior supporto clienti
- Comunicazione proattiva

## 🆘 Troubleshooting

### Email Non Arrivano
1. Verifica API key Resend
2. Controlla spam/promozioni
3. Verifica dominio sender

### Webhook Non Funzionano
1. Verifica URL webhook
2. Controlla webhook secret
3. Verifica eventi selezionati

### Errori Console
```
❌ Errore invio email: Invalid API key
❌ Webhook signature non valida
```

## 💡 Best Practices

1. **Test sempre** prima di andare in produzione
2. **Monitora** le metriche email
3. **Personalizza** i template per il tuo brand
4. **Backup** dei template email
5. **Documenta** eventuali modifiche

---

**🎉 Con questo setup, i tuoi utenti riceveranno sempre comunicazioni chiare e tempestive!**
