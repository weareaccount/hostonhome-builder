import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

// Inizializza Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { userId } = (await request.json()) as { userId?: string }
    
    if (!userId) {
      return NextResponse.json({ error: 'userId mancante' }, { status: 400 })
    }

    console.log('🔍 Test abbonamento per utente:', userId)

    // ✅ Recupera i dati dell'utente da Supabase
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
    }

    const user = userData.user
    const metadata = user.user_metadata as any
    
    console.log('👤 Dati utente:', {
      email: user.email,
      subscriptionStatus: metadata?.subscriptionStatus,
      stripeCustomerId: metadata?.stripeCustomerId,
      stripeSubscriptionId: metadata?.stripeSubscriptionId,
      currentPeriodEnd: metadata?.currentPeriodEnd,
      cancelAtPeriodEnd: metadata?.cancelAtPeriodEnd
    })

    // ✅ Se abbiamo un customer ID, verifica lo stato in Stripe
    if (metadata?.stripeCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(metadata.stripeCustomerId)
        console.log('💳 Customer Stripe:', {
          id: customer.id,
          email: customer.email,
          created: customer.created
        })

        // Recupera gli abbonamenti
        const subscriptions = await stripe.subscriptions.list({
          customer: metadata.stripeCustomerId,
          status: 'all',
          limit: 5
        })

        console.log('📋 Abbonamenti trovati:', subscriptions.data.length)
        
        const subscriptionDetails = subscriptions.data.map(sub => ({
          id: sub.id,
          status: sub.status,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          currentPeriodEnd: sub.current_period_end,
          trialEnd: sub.trial_end,
          created: sub.created
        }))

        console.log('📊 Dettagli abbonamenti:', subscriptionDetails)

        return NextResponse.json({
          success: true,
          user: {
            email: user.email,
            subscriptionStatus: metadata?.subscriptionStatus,
            stripeCustomerId: metadata?.stripeCustomerId,
            stripeSubscriptionId: metadata?.stripeSubscriptionId,
            currentPeriodEnd: metadata?.currentPeriodEnd,
            cancelAtPeriodEnd: metadata?.cancelAtPeriodEnd
          },
          stripe: {
            customer: {
              id: customer.id,
              email: customer.email,
              created: customer.created
            },
            subscriptions: subscriptionDetails
          }
        })
      } catch (stripeError: any) {
        console.error('❌ Errore Stripe:', stripeError)
        return NextResponse.json({ 
          success: false, 
          error: `Errore Stripe: ${stripeError.message}`,
          user: {
            email: user.email,
            subscriptionStatus: metadata?.subscriptionStatus,
            stripeCustomerId: metadata?.stripeCustomerId,
            stripeSubscriptionId: metadata?.stripeSubscriptionId
          }
        })
      }
    } else {
      return NextResponse.json({
        success: true,
        user: {
          email: user.email,
          subscriptionStatus: metadata?.subscriptionStatus,
          stripeCustomerId: metadata?.stripeCustomerId,
          stripeSubscriptionId: metadata?.stripeSubscriptionId
        },
        message: 'Nessun customer ID trovato'
      })
    }
  } catch (error: any) {
    console.error('❌ Errore test abbonamento:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Errore durante il test' 
    }, { status: 500 })
  }
}
