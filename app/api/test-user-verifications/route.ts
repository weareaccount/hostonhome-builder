import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
    }

    // Recupera tutte le verifiche per l'utente (senza filtri)
    const { data: verifications, error } = await supabase
      .from('challenge_verifications')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('❌ Errore recupero verifiche:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Errore nel recupero delle verifiche' 
      }, { status: 500 })
    }

    console.log('📋 Tutte le verifiche per utente:', verifications?.length || 0)
    console.log('📋 Verifiche FIRST_REVIEW:', verifications?.filter(v => v.challenge_id === 'FIRST_REVIEW'))

    return NextResponse.json({ 
      success: true, 
      verifications: verifications || [],
      count: verifications?.length || 0
    })

  } catch (error) {
    console.error('❌ Errore API test-user-verifications:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Errore interno del server' 
    }, { status: 500 })
  }
}
