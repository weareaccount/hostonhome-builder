import type { User } from '@/lib/supabase'

// Helper to normalize status strings coming from Stripe ('active') or our enums ('ACTIVE')
function normalizeStatus(status?: string | null): string {
  if (!status) return 'NONE'
  return String(status).toUpperCase()
}

export function isSubscriptionActive(user: User | null): boolean {
  if (!user) return false
  const status = normalizeStatus((user as any).subscriptionStatus)
  // Allow ACTIVE or TRIALING
  if (status === 'ACTIVE' || status === 'TRIALING') return true
  // Fallback: if we have currentPeriodEnd in the future and not explicitly canceled
  const end = (user as any).currentPeriodEnd
  const cancelAtPeriodEnd = (user as any).cancelAtPeriodEnd
  if (end) {
    const endDate = new Date(end).getTime()
    if (Date.now() < endDate && normalizeStatus((user as any).subscriptionStatus) !== 'CANCELED') {
      return true
    }
  }
  return false
}

export function getSubscriptionBlockReason(user: User | null): string {
  if (!user) return 'Autenticati per continuare.'
  const status = normalizeStatus((user as any).subscriptionStatus)
  switch (status) {
    case 'PAST_DUE':
      return 'Pagamento non riuscito. Aggiorna il metodo di pagamento.'
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


