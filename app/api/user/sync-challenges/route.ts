import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ChallengeService } from '@/lib/challenges'

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

    console.log('🔄 Sincronizzazione challenge per utente:', userId)

    // Recupera tutte le verifiche dell'utente che sono state approvate o rifiutate
    const { data: verifications, error } = await supabase
      .from('challenge_verifications')
      .select('challenge_id, status, reviewed_at')
      .eq('user_id', userId)
      .in('status', ['APPROVED', 'REJECTED'])
      .not('reviewed_at', 'is', null)

    if (error) {
      console.error('❌ Errore nel recupero verifiche:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Errore nel recupero verifiche' 
      }, { status: 500 })
    }

    console.log('📋 Verifiche trovate:', verifications?.length || 0)
    if (verifications && verifications.length > 0) {
      console.log('📋 Dettagli verifiche:', verifications.map(v => ({ 
        challenge_id: v.challenge_id, 
        status: v.status, 
        reviewed_at: v.reviewed_at 
      })))
    }

    // Aggiorna lo stato delle challenge
    let updatedCount = 0
    for (const verification of verifications || []) {
      const challengeStatus = verification.status === 'APPROVED' ? 'COMPLETED' : 'REJECTED'
      
      console.log(`🔄 Aggiornamento challenge ${verification.challenge_id} a ${challengeStatus}`)
      
      try {
        const success = await ChallengeService.updateChallengeStatus(
          userId,
          verification.challenge_id,
          challengeStatus
        )
        
        if (success) {
          updatedCount++
          console.log(`✅ Challenge ${verification.challenge_id} aggiornata a ${challengeStatus}`)
        } else {
          console.log(`❌ Fallimento aggiornamento challenge ${verification.challenge_id}`)
        }
      } catch (error) {
        console.error(`❌ Errore nell'aggiornamento challenge ${verification.challenge_id}:`, error)
      }
    }

    console.log(`✅ Sincronizzazione completata: ${updatedCount} challenge aggiornate`)

    return NextResponse.json({ 
      success: true, 
      message: `${updatedCount} challenge sincronizzate`,
      updatedCount
    })

  } catch (error) {
    console.error('❌ Errore API sync-challenges:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Errore interno del server' 
    }, { status: 500 })
  }
}
