// Sistema di sincronizzazione abbonamenti Stripe
import { stripe } from './stripe'
import { createClient } from '@supabase/supabase-js'

// Inizializza Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Interfaccia per i dati dell'abbonamento
interface SubscriptionData {
  id: string
  status: string
  customerId: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  trialEnd?: Date
  cancelAtPeriodEnd: boolean
  plan: string
  interval: string
}

// Sincronizza lo stato dell'abbonamento per un utente
export async function syncUserSubscription(userId: string, customerId?: string, userEmail?: string) {
  try {
    console.log(`🔄 Sincronizzazione abbonamento per utente: ${userId}`)
    
    let customerIdToUse = customerId
    
    // ✅ Se non abbiamo il customerId, proviamo a trovarlo tramite email
    if (!customerIdToUse && userEmail) {
      console.log('🔍 Ricerca customer ID tramite email:', userEmail)
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1
      })
      
      if (customers.data.length > 0) {
        customerIdToUse = customers.data[0].id
        console.log('✅ Customer ID trovato:', customerIdToUse)
      }
    }
    
    if (!customerIdToUse) {
      console.log('❌ Nessun customer ID trovato')
      await updateUserSubscriptionStatus(userId, 'NONE', null, null, null)
      return { success: false, error: 'Nessun customer ID trovato' }
    }
    
    // Recupera l'abbonamento da Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerIdToUse,
      status: 'all',
      limit: 1
    })

    if (subscriptions.data.length === 0) {
      console.log('❌ Nessun abbonamento trovato per il cliente')
      await updateUserSubscriptionStatus(userId, 'NONE', null, null, null)
      return { success: false, error: 'Nessun abbonamento trovato' }
    }

    const subscription = subscriptions.data[0]
    const subscriptionData = await parseSubscriptionData(subscription)
    
    // Aggiorna lo stato nel database
    await updateUserSubscriptionStatus(
      userId,
      subscriptionData.status,
      subscriptionData.currentPeriodStart,
      subscriptionData.currentPeriodEnd,
      subscriptionData.trialEnd
    )

    console.log(`✅ Abbonamento sincronizzato: ${subscriptionData.status}`)
    return { success: true, subscription: subscriptionData }
  } catch (error: any) {
    console.error('❌ Errore sincronizzazione abbonamento:', error)
    return { success: false, error: error.message }
  }
}

// Parsifica i dati dell'abbonamento da Stripe
async function parseSubscriptionData(subscription: any): Promise<SubscriptionData> {
  const customer = await stripe.customers.retrieve(subscription.customer)
  const price = await stripe.prices.retrieve(subscription.items.data[0].price.id)
  const product = await stripe.products.retrieve(price.product as string)

  return {
    id: subscription.id,
    status: subscription.status.toUpperCase(),
    customerId: subscription.customer,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    plan: product.metadata?.plan || 'BASE',
    interval: price.recurring?.interval || 'month'
  }
}

// Aggiorna lo stato dell'abbonamento nel database
async function updateUserSubscriptionStatus(
  userId: string,
  status: string,
  periodStart: Date | null,
  periodEnd: Date | null,
  trialEnd: Date | null
) {
  try {
    // ✅ Prima recupera i metadati esistenti per preservarli
    const { data: existingUser, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (fetchError) {
      console.error('❌ Errore recupero utente:', fetchError)
      throw fetchError
    }
    
    const existingMetadata = existingUser.user?.user_metadata || {}
    
    // ✅ Aggiorna solo i campi dell'abbonamento, preservando gli altri
    const updatedMetadata = {
      ...existingMetadata,
      subscriptionStatus: status,
      currentPeriodStart: periodStart?.toISOString(),
      currentPeriodEnd: periodEnd?.toISOString(),
      trialEnd: trialEnd?.toISOString()
    }
    
    console.log('🔄 Aggiornamento metadati:', {
      userId,
      status,
      existingMetadata,
      updatedMetadata
    })
    
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: updatedMetadata
    })

    if (error) {
      console.error('❌ Errore aggiornamento utente:', error)
      throw error
    }

    console.log(`✅ Stato abbonamento aggiornato: ${status}`)
  } catch (error: any) {
    console.error('❌ Errore aggiornamento stato abbonamento:', error)
    throw error
  }
}

// Gestisce i tentativi di pagamento falliti
export async function handlePaymentRetry(subscriptionId: string, attempt: number) {
  try {
    console.log(`🔄 Tentativo di pagamento ${attempt} per abbonamento: ${subscriptionId}`)
    
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const customer = await stripe.customers.retrieve(subscription.customer)
    
    // Se è il primo tentativo, invia email di avviso
    if (attempt === 1) {
      console.log('📧 Invio email primo tentativo fallito')
      // Qui potresti inviare un'email di avviso
    }
    
    // Se è il secondo tentativo, invia email di ultimo avviso
    if (attempt === 2) {
      console.log('📧 Invio email ultimo tentativo')
      // Qui potresti inviare un'email di ultimo avviso
    }
    
    // Se è il terzo tentativo, sospendi l'abbonamento
    if (attempt >= 3) {
      console.log('🚫 Sospensione abbonamento dopo 3 tentativi falliti')
      await stripe.subscriptions.update(subscriptionId, {
        pause_collection: {
          behavior: 'void'
        }
      })
      
      // Aggiorna lo stato nel database
      const user = await getUserByCustomerId(subscription.customer)
      if (user) {
        await updateUserSubscriptionStatus(user.id, 'PAST_DUE', null, null, null)
      }
    }
    
    return { success: true, attempt }
  } catch (error: any) {
    console.error('❌ Errore gestione tentativo pagamento:', error)
    return { success: false, error: error.message }
  }
}

// Recupera l'utente dal customer ID
async function getUserByCustomerId(customerId: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) {
      console.error('❌ Errore recupero utenti:', error)
      return null
    }
    
    return data.users.find(user => 
      (user.user_metadata as any)?.stripeCustomerId === customerId
    )
  } catch (error: any) {
    console.error('❌ Errore ricerca utente:', error)
    return null
  }
}

// Verifica se un utente ha diritto a 2 tentativi di pagamento
export function shouldAllowPaymentRetry(user: any, attempt: number): boolean {
  const status = (user as any)?.subscriptionStatus?.toUpperCase()
  
  // Se è in trial, permetti sempre l'accesso
  if (status === 'TRIALING') return true
  
  // Se è attivo, permetti sempre l'accesso
  if (status === 'ACTIVE') return true
  
  // Se è past_due, permetti fino a 2 tentativi
  if (status === 'PAST_DUE' && attempt <= 2) return true
  
  // Per tutti gli altri casi, blocca
  return false
}

// Ottieni il numero di tentativi di pagamento falliti
export async function getPaymentAttempts(subscriptionId: string): Promise<number> {
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
