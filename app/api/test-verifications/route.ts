import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'userId è richiesto' 
      }, { status: 400 })
    }

    console.log('🔍 TEST VERIFICHE per utente:', userId)

    // Recupera tutte le verifiche dell'utente
    const { data: verifications, error } = await supabase
      .from('challenge_verifications')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('❌ Errore recupero verifiche:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Errore nel recupero delle verifiche: ' + error.message
      }, { status: 500 })
    }

    console.log('📋 Verifiche trovate:', verifications?.length || 0)
    console.log('📋 Tutte le verifiche:', verifications)

    // Test specifico per challenge_id = "1" (Prima Visita)
    const challenge1Verifications = verifications?.filter(v => v.challenge_id === '1') || []
    console.log('📋 Verifiche per challenge 1 (Prima Visita):', challenge1Verifications)

    return NextResponse.json({ 
      success: true, 
      verifications: verifications || [],
      challenge1Verifications: challenge1Verifications,
      count: verifications?.length || 0
    })

  } catch (error) {
    console.error('❌ Errore API test-verifications:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Errore interno del server: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
