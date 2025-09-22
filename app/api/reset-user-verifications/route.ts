import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'userId è richiesto' 
      }, { status: 400 })
    }

    console.log('🔄 Reset verifiche per utente:', userId)

    // Elimina tutte le verifiche dell'utente
    const { error } = await supabase
      .from('challenge_verifications')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('❌ Errore nel reset verifiche:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Errore nel reset verifiche' 
      }, { status: 500 })
    }

    console.log('✅ Verifiche resetate per utente:', userId)
    return NextResponse.json({ 
      success: true, 
      message: `Verifiche resetate per utente ${userId}` 
    })

  } catch (error) {
    console.error('❌ Errore API reset-user-verifications:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Errore interno del server' 
    }, { status: 500 })
  }
}