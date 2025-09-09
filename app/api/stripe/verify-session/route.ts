import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const { sessionId } = (await request.json()) as { sessionId?: string }
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId mancante' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    })

    const isComplete = session.status === 'complete' || session.payment_status === 'paid'
    const isSubscription = session.mode === 'subscription'

    if (!isComplete || !isSubscription) {
      return NextResponse.json({ valid: false }, { status: 200 })
    }

    const subObj = session.subscription && typeof session.subscription === 'object' ? session.subscription : null
    const periodStart = subObj && 'current_period_start' in subObj ? new Date((subObj as any).current_period_start * 1000).toISOString() : null
    const periodEnd = subObj && 'current_period_end' in subObj ? new Date((subObj as any).current_period_end * 1000).toISOString() : null
    const status = subObj && 'status' in subObj ? (subObj as any).status : null

    return NextResponse.json({
      valid: true,
      customerId: session.customer,
      subscriptionId: subObj ? (subObj as any).id : session.subscription,
      metadata: session.metadata || null,
      periodStart,
      periodEnd,
      status,
    })
  } catch (error: any) {
    console.error('Verify session error', error)
    return NextResponse.json({ error: error.message || 'Errore durante la verifica' }, { status: 500 })
  }
}


