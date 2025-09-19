import { NextResponse } from 'next/server'
import { ChallengeService } from '@/lib/challenges'

export async function POST(request: Request) {
  try {
    const { userId, challengeId, status } = await request.json()
    
    if (!userId || !challengeId || !status) {
      return NextResponse.json({ 
        success: false, 
        error: 'userId, challengeId e status sono richiesti' 
      }, { status: 400 })
    }

    console.log('🔄 Aggiornamento stato challenge:', { userId, challengeId, status })

    // Aggiorna lo stato della challenge
    const success = await ChallengeService.updateChallengeStatus(
      userId, 
      challengeId, 
      status as 'IN_PROGRESS' | 'PENDING_VERIFICATION' | 'COMPLETED' | 'REJECTED'
    )

    if (success) {
      console.log('✅ Stato challenge aggiornato con successo')
      return NextResponse.json({ success: true, message: 'Stato challenge aggiornato' })
    } else {
      console.error('❌ Errore nell\'aggiornamento stato challenge')
      return NextResponse.json({ 
        success: false, 
        error: 'Errore nell\'aggiornamento stato challenge' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Errore API challenge-status:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Errore interno del server' 
    }, { status: 500 })
  }
}
