import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const userId = '0099a7d7-ca66-4a3f-a051-d55a8d923b17'
    
    console.log('🚨 AUTO RESET VERIFICHE per utente:', userId)

    // Elimina tutte le verifiche dell'utente
    const { error } = await supabase
      .from('challenge_verifications')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('❌ Errore eliminazione verifiche:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Errore nell\'eliminazione delle verifiche: ' + error.message
      }, { status: 500 })
    }

    console.log('✅ Verifiche eliminate per utente:', userId)

    return NextResponse.json({ 
      success: true, 
      message: 'Verifiche eliminate con successo per utente: ' + userId
    })

  } catch (error) {
    console.error('❌ Errore API auto-reset-verifications:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Errore interno del server: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
