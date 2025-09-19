import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ChallengeService } from '@/lib/challenges'
import type { ChallengeStatus } from '@/types'

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    console.log('🚀 API challenges-status chiamata!')
    console.log('🚀 URL:', request.url)
    console.log('🚀 UserId:', userId)

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'userId è richiesto' 
      }, { status: 400 })
    }

    console.log('🔍 Recupero stato challenge per utente:', userId)
    console.log('🔍 TIMESTAMP API chiamata:', new Date().toISOString())

    // Recupera tutte le verifiche dell'utente
    const { data: verifications, error } = await supabase
      .from('challenge_verifications')
      .select('id, challenge_id, status, reviewed_at, user_id, created_at, submitted_at')
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
    console.log('📋 Tutte le verifiche:', verifications)
    console.log('📋 Verifiche PENDING:', verifications?.filter(v => v.status === 'PENDING'))
    console.log('📋 Verifiche APPROVED:', verifications?.filter(v => v.status === 'APPROVED'))
    console.log('📋 Verifiche REJECTED:', verifications?.filter(v => v.status === 'REJECTED'))
    
    // Log specifico per ogni challenge
    for (const verification of verifications || []) {
      console.log('🔍 Verifica trovata:', {
        challenge_id: verification.challenge_id,
        status: verification.status,
        user_id: verification.user_id,
        id: verification.id,
        created_at: verification.created_at,
        submitted_at: verification.submitted_at
      })
    }
    
    // Log specifico per challenge_id = "1"
    const challenge1Verifications = verifications?.filter(v => v.challenge_id === '1') || []
    console.log('🔍 Verifiche per challenge 1 (Prima Visita):', challenge1Verifications)
    
    // Log specifico per challenge_id = "6" (Indipendenza in crescita)
    const challenge6Verifications = verifications?.filter(v => v.challenge_id === '6') || []
    console.log('🔍 Verifiche per challenge 6 (Indipendenza in crescita):', challenge6Verifications)
    
    // Log di tutte le verifiche per debug
    console.log('🔍 TUTTE LE VERIFICHE TROVATE:', verifications?.map(v => ({
      id: v.id,
      challenge_id: v.challenge_id,
      status: v.status,
      user_id: v.user_id,
      created_at: v.created_at,
      submitted_at: v.submitted_at
    })))

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

    // Recupera tutte le definizioni delle challenge (ignora localStorage completamente)
    const allChallenges = ChallengeService.getAllChallengeDefinitions()
    
    console.log('📋 Challenge caricate:', allChallenges.length)
    
    // Aggiorna lo stato delle challenge basandosi SOLO sulle verifiche PENDING
    const updatedChallenges = allChallenges.map(challenge => {
      const verification = verificationMap[challenge.id]
      
      console.log('🔍 Controllo challenge:', {
        id: challenge.id,
        title: challenge.title,
        verification: verification ? { status: verification.status } : 'Nessuna verifica'
      })
      
      if (verification && verification.status === 'PENDING') {
        // SOLO per verifiche PENDING, aggiorna lo stato a PENDING_VERIFICATION
        console.log('🔄 Challenge con verifica PENDING:', challenge.title, 'stato: PENDING_VERIFICATION')
        
        return {
          ...challenge,
          status: 'PENDING_VERIFICATION' as ChallengeStatus,
          progress: { current: 0, target: challenge.target.value, percentage: 0 }
        }
      }
      
      // Per tutte le altre challenge (incluso APPROVED/REJECTED), mostra come AVAILABLE
      console.log('✅ Challenge disponibile:', challenge.title, 'stato: AVAILABLE')
      return {
        ...challenge,
        status: 'AVAILABLE' as ChallengeStatus,
        progress: { current: 0, target: challenge.target.value, percentage: 0 }
      }
    })

    console.log('✅ Challenge aggiornate:', updatedChallenges.length)
    console.log('📋 Challenge con stato AVAILABLE:', updatedChallenges.filter(c => c.status === 'AVAILABLE').length)
    console.log('📋 Challenge con stato PENDING_VERIFICATION:', updatedChallenges.filter(c => c.status === 'PENDING_VERIFICATION').length)
    console.log('📋 Challenge con stato COMPLETED:', updatedChallenges.filter(c => c.status === 'COMPLETED').length)

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
