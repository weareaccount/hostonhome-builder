import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { syncUserSubscription } from '@/lib/subscription-sync'
import { createClient } from '@supabase/supabase-js'

// Inizializza Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { subscriptionId, userId } = (await request.json()) as { 
      subscriptionId?: string
      userId?: string 
    }
    
    if (!subscriptionId) {
      return NextResponse.json({ error: 'subscriptionId mancante' }, { status: 400 })
    }

    console.log('🔄 Disdetta abbonamento:', subscriptionId)

    // ✅ Disdici l'abbonamento in Stripe
    const sub = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    console.log('✅ Abbonamento disdetto in Stripe:', {
      id: sub.id,
      status: sub.status,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      currentPeriodEnd: sub.current_period_end
    })

    // ✅ Se abbiamo l'userId, sincronizza lo stato in Supabase
    if (userId) {
      try {
        // Recupera il customer ID dall'abbonamento
        const customerId = sub.customer as string
        
        // Sincronizza lo stato dell'abbonamento
        const syncResult = await syncUserSubscription(userId, customerId)
        
        if (syncResult.success) {
          console.log('✅ Stato abbonamento sincronizzato in Supabase')
        } else {
          console.log('⚠️ Errore sincronizzazione stato:', syncResult.error)
        }
      } catch (syncError: any) {
        console.error('❌ Errore sincronizzazione dopo disdetta:', syncError)
        // Non bloccare la risposta se la sincronizzazione fallisce
      }
    }

    return NextResponse.json({ 
      success: true, 
      status: sub.status, 
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      currentPeriodEnd: sub.current_period_end
    })
  } catch (error: any) {
    console.error('❌ Errore disdetta abbonamento:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Errore durante la disdetta' 
    }, { status: 500 })
  }
}


