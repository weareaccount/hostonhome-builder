import type { User } from '@/lib/supabase'

// Helper to normalize status strings coming from Stripe ('active') or our enums ('ACTIVE')
function normalizeStatus(status?: string | null): string {
  if (!status) return 'NONE'
  return String(status).toUpperCase()
}

export function isSubscriptionActive(user: User | null): boolean {
  if (!user) return false
  
  const status = normalizeStatus((user as any).subscriptionStatus)
  
  // ✅ SOLO questi stati permettono l'accesso - BLOCCATO IMMEDIATAMENTE per tutti gli altri
  if (status === 'ACTIVE' || status === 'TRIALING') return true
  
  // ❌ TUTTI gli altri stati bloccano immediatamente (PAST_DUE, CANCELED, INCOMPLETE, UNPAID, etc.)
  return false
}

export function getSubscriptionBlockReason(user: User | null): string {
  if (!user) return 'Autenticati per continuare.'
  const status = normalizeStatus((user as any).subscriptionStatus)
  switch (status) {
    case 'TRIALING':
      return 'Prova gratuita attiva. Completa il pagamento per continuare dopo il trial.'
    case 'PAST_DUE':
      return 'Pagamento non riuscito. Aggiorna il metodo di pagamento immediatamente.'
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


