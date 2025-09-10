import { NextResponse } from 'next/server'
import { syncUserSubscription } from '@/lib/subscription-sync'
import { createClient } from '@supabase/supabase-js'

// Endpoint per sincronizzare manualmente l'abbonamento
export async function POST(request: Request) {
  try {
    const { userId, customerId, userEmail } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'userId richiesto' }, { status: 400 })
    }
    
    // Sincronizza l'abbonamento
    const result = await syncUserSubscription(userId, customerId, userEmail)
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Abbonamento sincronizzato con successo',
        subscription: result.subscription
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('❌ Errore sincronizzazione abbonamento:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

// Endpoint per sincronizzare l'abbonamento dell'utente corrente
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const customerId = searchParams.get('customerId')
    
    if (!userId || !customerId) {
      return NextResponse.json({ error: 'userId e customerId richiesti' }, { status: 400 })
    }
    
    // Sincronizza l'abbonamento
    const result = await syncUserSubscription(userId, customerId)
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Abbonamento sincronizzato con successo',
        subscription: result.subscription
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('❌ Errore sincronizzazione abbonamento:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
