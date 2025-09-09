import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const { subscriptionId } = (await request.json()) as { subscriptionId?: string }
    if (!subscriptionId) {
      return NextResponse.json({ error: 'subscriptionId mancante' }, { status: 400 })
    }

    const sub = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    return NextResponse.json({ ok: true, status: sub.status, cancelAtPeriodEnd: sub.cancel_at_period_end })
  } catch (error: any) {
    console.error('Cancel subscription error', error)
    return NextResponse.json({ error: error.message || 'Errore durante la disdetta' }, { status: 500 })
  }
}


