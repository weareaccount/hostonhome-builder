import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { sendTrialEndingEmail, sendPaymentFailedEmail } from '@/lib/email'
import { createClient } from '@supabase/supabase-js'
import { syncUserSubscription, handlePaymentRetry } from '@/lib/subscription-sync'

// Webhook per gestire eventi Stripe
export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook signature mancante' }, { status: 400 })
  }

  let event: any

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('❌ Errore verifica webhook:', err.message)
    return NextResponse.json({ error: 'Webhook signature non valida' }, { status: 400 })
  }

  console.log('✅ Webhook ricevuto:', event.type)

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break

      case 'customer.subscription.trial_will_end':
        await handleTrialEnding(event.data.object)
        break

      default:
        console.log(`⚠️ Evento non gestito: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('❌ Errore gestione webhook:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Gestisce la creazione di un nuovo abbonamento
async function handleSubscriptionCreated(subscription: any) {
  console.log('📧 Nuovo abbonamento creato:', subscription.id)
  
  // Qui potresti inviare un'email di conferma aggiuntiva
  // Per ora l'email viene inviata direttamente nel LoginForm
}

// Gestisce l'aggiornamento di un abbonamento
async function handleSubscriptionUpdated(subscription: any) {
  console.log('📧 Abbonamento aggiornato:', subscription.id)
  
  // ✅ Se l'abbonamento è stato disdetto
  if (subscription.cancel_at_period_end) {
    console.log('📋 Abbonamento disdetto:', subscription.id)
    
    // Sincronizza lo stato dell'abbonamento
    const user = await getUserByCustomerId(subscription.customer)
    if (user) {
      await syncUserSubscription(user.id, subscription.customer)
      console.log('✅ Stato abbonamento disdetto sincronizzato per:', user.email)
    }
  }
  
  // Se l'abbonamento è diventato attivo (fine trial)
  if (subscription.status === 'active' && subscription.trial_end) {
    const customer = await stripe.customers.retrieve(subscription.customer)
    const email = customer.email
    
    if (email) {
      console.log('🎉 Trial completato per:', email)
      // Potresti inviare un'email di conferma che il trial è diventato pagante
    }
  }
}

// Gestisce il fallimento di un pagamento
async function handlePaymentFailed(invoice: any) {
  console.log('💳 Pagamento fallito per invoice:', invoice.id)
  
  const customer = await stripe.customers.retrieve(invoice.customer)
  const email = customer.email
  
  if (email && invoice.subscription) {
    // Ottieni i dettagli dell'abbonamento
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
    const planName = subscription.items.data[0]?.price?.nickname || 'Unknown'
    
    // Conta i tentativi di pagamento falliti
    const attempts = await getPaymentAttempts(invoice.subscription)
    
    // Gestisci i tentativi di pagamento
    await handlePaymentRetry(invoice.subscription, attempts)
    
    // Sincronizza lo stato dell'abbonamento
    const user = await getUserByCustomerId(invoice.customer)
    if (user) {
      await syncUserSubscription(user.id, invoice.customer)
    }
    
    console.log(`📧 Invio email pagamento fallito (tentativo ${attempts}) a:`, email)
    await sendPaymentFailedEmail(email, planName)
  }
}

// Conta i tentativi di pagamento falliti
async function getPaymentAttempts(subscriptionId: string): Promise<number> {
  try {
    const invoices = await stripe.invoices.list({
      subscription: subscriptionId,
      status: 'open'
    })
    
    return invoices.data.length
  } catch (error: any) {
    console.error('❌ Errore recupero tentativi pagamento:', error)
    return 0
  }
}

// Gestisce la fine imminente del trial
async function handleTrialEnding(subscription: any) {
  console.log('⏰ Trial in scadenza:', subscription.id)
  
  const customer = await stripe.customers.retrieve(subscription.customer)
  const email = customer.email
  
  if (email && subscription.trial_end) {
    const trialEndDate = new Date(subscription.trial_end * 1000)
    const now = new Date()
    const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysRemaining > 0 && daysRemaining <= 3) {
      const planName = subscription.items.data[0]?.price?.nickname || 'Unknown'
      
      console.log(`📧 Invio email fine trial (${daysRemaining} giorni) a:`, email)
      await sendTrialEndingEmail(email, planName, daysRemaining)
    }
  }
}

// Funzione helper per ottenere l'utente da Supabase
async function getUserByEmail(email: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data, error } = await supabaseAdmin.auth.admin.listUsers()
  
  if (error) {
    console.error('Errore recupero utenti:', error)
    return null
  }

  return data.users.find(user => user.email === email)
}
