import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'userId è richiesto' 
      }, { status: 400 })
    }

    console.log('🚨 AGGIORNAMENTO FORZATO per utente:', userId)

    // Recupera tutte le verifiche dell'utente che sono state approvate o rifiutate
    const { data: verifications, error } = await supabase
      .from('challenge_verifications')
      .select('challenge_id, status, reviewed_at')
      .eq('user_id', userId)
      .not('reviewed_at', 'is', null)

    if (error) {
      console.error('❌ Errore nel recupero verifiche:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Errore nel recupero verifiche' 
      }, { status: 500 })
    }

    console.log('📋 Verifiche trovate:', verifications?.length || 0)

    // Crea una mappa delle verifiche per challenge
    const verificationMap: Record<string, { status: string; reviewed_at: string }> = {}
    for (const verification of verifications || []) {
      verificationMap[verification.challenge_id] = {
        status: verification.status,
        reviewed_at: verification.reviewed_at
      }
    }

    // Usa ChallengeService per ottenere tutte le challenge con le definizioni complete
    const allChallenges = await ChallengeService.getUserChallenges(userId)
    
    // Aggiorna lo stato delle challenge basandosi sulle verifiche
    const updatedChallenges = allChallenges.map(challenge => {
      const verification = verificationMap[challenge.type]
      
      if (verification) {
        // Aggiorna lo stato della challenge basandosi sulla verifica
        const newStatus = verification.status === 'APPROVED' ? 'COMPLETED' : 'REJECTED'
        
        return {
          ...challenge,
          status: newStatus,
          completedAt: verification.status === 'APPROVED' ? verification.reviewed_at : undefined
        }
      }
      
      return challenge
    })

    console.log('✅ Challenge aggiornate:', updatedChallenges.length)
    console.log('📋 Dettagli:', updatedChallenges.map(c => ({ title: c.title, status: c.status })))

    return NextResponse.json({ 
      success: true, 
      message: `${updatedChallenges.length} challenge aggiornate con successo`,
      challenges: updatedChallenges,
      count: updatedChallenges.length
    })

  } catch (error) {
    console.error('❌ Errore API force-update-challenges:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Errore interno del server' 
    }, { status: 500 })
  }
}
