import { NextResponse } from 'next/server'
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe'
import { PlanType } from '@/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { plan, interval, customerId, successUrl, cancelUrl, metadata } = body as {
      plan: PlanType
      interval: 'monthly' | 'yearly'
      customerId?: string
      successUrl?: string
      cancelUrl?: string
      metadata?: Record<string, string>
    }

    if (!plan || !interval) {
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 })
    }

    const priceId = STRIPE_PRICE_IDS[plan][interval]
    if (!priceId) {
      return NextResponse.json({ error: 'Prezzo non configurato' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url:
        (successUrl && `${successUrl}&session_id={CHECKOUT_SESSION_ID}`) ||
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login?status=cancel`,
      metadata: {
        plan,
        interval,
        ...metadata,
      },
    })

    return NextResponse.json({ url: session.url, id: session.id })
  } catch (error: any) {
    console.error('Checkout error', error)
    return NextResponse.json({ error: error.message || 'Errore durante il checkout' }, { status: 500 })
  }
}


