import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ChallengeService } from '@/lib/challenges'

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

    console.log('🔍 Recupero stato challenge per utente:', userId)

    // Recupera tutte le verifiche dell'utente
    const { data: verifications, error } = await supabase
      .from('challenge_verifications')
      .select('challenge_id, status, reviewed_at')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('❌ Errore nel recupero verifiche:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Errore nel recupero verifiche' 
      }, { status: 500 })
    }

    console.log('📋 Verifiche trovate:', verifications?.length || 0)
    console.log('📋 Verifiche per FIRST_REVIEW:', verifications?.filter(v => v.challenge_id === 'FIRST_REVIEW'))
    console.log('📋 Tutte le verifiche:', verifications)
    console.log('📋 Verifiche PENDING:', verifications?.filter(v => v.status === 'PENDING'))
    console.log('📋 Verifiche APPROVED:', verifications?.filter(v => v.status === 'APPROVED'))
    console.log('📋 Verifiche REJECTED:', verifications?.filter(v => v.status === 'REJECTED'))

    // Crea una mappa delle verifiche per challenge (dai priorità alle verifiche approvate/rifiutate)
    const verificationMap: Record<string, { status: string; reviewed_at: string }> = {}
    for (const verification of verifications || []) {
      const challengeId = verification.challenge_id
      
      // Se non abbiamo ancora una verifica per questa challenge
      if (!verificationMap[challengeId]) {
        verificationMap[challengeId] = {
          status: verification.status,
          reviewed_at: verification.reviewed_at
        }
      } else {
        // Se abbiamo già una verifica, dai priorità alle verifiche approvate/rifiutate
        const currentStatus = verificationMap[challengeId].status
        const newStatus = verification.status
        
        // Se la verifica corrente è PENDING e quella nuova è APPROVED/REJECTED, sostituisci
        if (currentStatus === 'PENDING' && (newStatus === 'APPROVED' || newStatus === 'REJECTED')) {
          verificationMap[challengeId] = {
            status: verification.status,
            reviewed_at: verification.reviewed_at
          }
        }
        // Se la verifica corrente è APPROVED/REJECTED e quella nuova è PENDING, sostituisci (nuova verifica)
        else if ((currentStatus === 'APPROVED' || currentStatus === 'REJECTED') && newStatus === 'PENDING') {
          verificationMap[challengeId] = {
            status: verification.status,
            reviewed_at: verification.reviewed_at
          }
        }
        // Se entrambe sono APPROVED/REJECTED, prendi la più recente
        else if ((currentStatus === 'APPROVED' || currentStatus === 'REJECTED') && 
                 (newStatus === 'APPROVED' || newStatus === 'REJECTED')) {
          // Prendi quella con reviewed_at più recente
          const currentReviewedAt = verificationMap[challengeId].reviewed_at
          const newReviewedAt = verification.reviewed_at
          
          if (newReviewedAt && currentReviewedAt && new Date(newReviewedAt) > new Date(currentReviewedAt)) {
            verificationMap[challengeId] = {
              status: verification.status,
              reviewed_at: verification.reviewed_at
            }
          }
        }
      }
    }

    console.log('📋 Mappa verifiche finale:', verificationMap)
    console.log('📋 Challenge con verifiche PENDING:', Object.keys(verificationMap).filter(key => verificationMap[key].status === 'PENDING'))

    // Recupera tutte le definizioni delle challenge (non dal localStorage)
    const allChallenges = ChallengeService.getAllChallengeDefinitions()
    
    // Aggiorna lo stato delle challenge basandosi sulle verifiche
    const updatedChallenges = allChallenges.map(challenge => {
      const verification = verificationMap[challenge.id]
      
      if (verification) {
        // Aggiorna lo stato della challenge basandosi sulla verifica
        let newStatus: string
        if (verification.status === 'APPROVED') {
          newStatus = 'COMPLETED'
        } else if (verification.status === 'REJECTED') {
          newStatus = 'REJECTED'
        } else if (verification.status === 'PENDING') {
          newStatus = 'PENDING_VERIFICATION'
        } else {
          newStatus = challenge.status // Mantieni lo stato originale se non riconosciuto
        }
        
        console.log('🔄 Challenge aggiornata:', challenge.title, 'da', challenge.status, 'a', newStatus, 'verifica:', verification.status)
        
        return {
          ...challenge,
          status: newStatus,
          completedAt: verification.status === 'APPROVED' ? verification.reviewed_at : undefined,
          progress: { current: 0, target: challenge.target.value, percentage: 0 }
        }
      }
      
      return {
        ...challenge,
        progress: { current: 0, target: challenge.target.value, percentage: 0 }
      }
    })

    console.log('✅ Challenge aggiornate:', updatedChallenges.length)
    console.log('📋 Challenge con stato PENDING_VERIFICATION:', updatedChallenges.filter(c => c.status === 'PENDING_VERIFICATION'))

    return NextResponse.json({ 
      success: true, 
      challenges: updatedChallenges,
      count: updatedChallenges.length
    })

  } catch (error) {
    console.error('❌ Errore API challenges-status:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Errore interno del server' 
    }, { status: 500 })
  }
}
