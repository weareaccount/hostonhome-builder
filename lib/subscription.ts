import type { User } from '@/lib/supabase'

// Helper to normalize status strings coming from Stripe ('active') or our enums ('ACTIVE')
function normalizeStatus(status?: string | null): string {
  if (!status) return 'NONE'
  return String(status).toUpperCase()
}

export function isSubscriptionActive(user: User | null): boolean {
  if (!user) return false
  
  const status = normalizeStatus((user as any).subscriptionStatus)
  const rawStatus = (user as any).subscriptionStatus
  
  // ✅ Debug: Log dello status per capire il problema
  console.log('🔍 Debug subscription status:', {
    userId: user.id,
    email: user.email,
    rawStatus,
    normalizedStatus: status,
    plan: (user as any).plan,
    stripeCustomerId: (user as any).stripeCustomerId
  })
  
  // ✅ Stati che permettono l'accesso
  if (status === 'ACTIVE' || status === 'TRIALING') return true
  
  // ✅ PAST_DUE: Permetti accesso per 2 tentativi di pagamento
  if (status === 'PAST_DUE') {
    const paymentAttempts = (user as any).paymentAttempts || 0
    if (paymentAttempts <= 2) return true
  }
  
  // ❌ Tutti gli altri stati bloccano l'accesso
  return false
}

export function getSubscriptionBlockReason(user: User | null): string {
  if (!user) return 'Autenticati per continuare.'
  const status = normalizeStatus((user as any).subscriptionStatus)
  const paymentAttempts = (user as any).paymentAttempts || 0
  
  switch (status) {
    case 'TRIALING':
      return 'Prova gratuita attiva. Completa il pagamento per continuare dopo il trial.'
    case 'PAST_DUE':
      if (paymentAttempts <= 2) {
        return `Pagamento non riuscito (tentativo ${paymentAttempts}/2). Aggiorna il metodo di pagamento per continuare.`
      }
      return 'Pagamento fallito dopo 2 tentativi. Aggiorna il metodo di pagamento per riattivare i servizi.'
    case 'CANCELED':
      return 'Abbonamento disdetto. Riattiva per continuare.'
    case 'INCOMPLETE':
    case 'INCOMPLETE_EXPIRED':
    case 'UNPAID':
      return 'Abbonamento non attivo. Completa il checkout o aggiorna il pagamento.'
    default:
      return 'Abbonamento non attivo. Attiva o aggiorna il piano per usare i servizi.'
  }
}

// ✅ Nuova funzione per ottenere informazioni sul trial
export function getTrialInfo(user: User | null): { isTrial: boolean; daysRemaining: number } {
  if (!user) return { isTrial: false, daysRemaining: 0 }
  
  const status = normalizeStatus((user as any).subscriptionStatus)
  if (status !== 'TRIALING') return { isTrial: false, daysRemaining: 0 }
  
  const end = (user as any).currentPeriodEnd
  if (!end) return { isTrial: false, daysRemaining: 0 }
  
  const endDate = new Date(end).getTime()
  const now = Date.now()
  const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)))
  
  return { isTrial: true, daysRemaining }
}


