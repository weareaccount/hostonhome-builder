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
    console.log('🔍 DEBUG: Versione API AGGIORNATA - Build:', new Date().toISOString())

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
        // Se la verifica corrente è APPROVED/REJECTED e quella nuova è PENDING, NON sostituire (mantieni APPROVED/REJECTED)
        else if ((currentStatus === 'APPROVED' || currentStatus === 'REJECTED') && newStatus === 'PENDING') {
          // Mantieni la verifica APPROVED/REJECTED esistente
          console.log('🔒 Mantenendo verifica APPROVED/REJECTED per challenge', challengeId, 'ignorando PENDING')
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
    console.log('📋 Challenge con verifiche APPROVED:', Object.keys(verificationMap).filter(key => verificationMap[key].status === 'APPROVED'))
    console.log('📋 Challenge con verifiche REJECTED:', Object.keys(verificationMap).filter(key => verificationMap[key].status === 'REJECTED'))
    
    // Debug specifico per challenge 3
    console.log('🔍 DEBUG Challenge 3 - Verifica nella mappa:', verificationMap['3'])
    console.log('🔍 DEBUG Challenge 3 - Tutte le verifiche per challenge 3:', verifications?.filter(v => v.challenge_id === '3'))

    // Recupera tutte le definizioni delle challenge
    const allChallenges = ChallengeService.getAllChallengeDefinitions()
    
    console.log('📋 Challenge caricate:', allChallenges.length)
    console.log('📋 Verifiche trovate:', Object.keys(verificationMap).length)
    console.log('📋 Verifiche APPROVED:', Object.keys(verificationMap).filter(key => verificationMap[key].status === 'APPROVED'))
    
    // Aggiorna lo stato delle challenge basandosi SOLO sulle verifiche esistenti
    const updatedChallenges = allChallenges.map(challenge => {
      const verification = verificationMap[challenge.id]
      
      console.log('🔍 Controllo challenge:', {
        id: challenge.id,
        title: challenge.title,
        verification: verification ? { status: verification.status } : 'Nessuna verifica'
      })
      
      if (verification) {
        switch (verification.status) {
          case 'PENDING':
            // Verifica in attesa di approvazione
            console.log('🔄 Challenge con verifica PENDING:', challenge.title, 'stato: PENDING_VERIFICATION')
            return {
              ...challenge,
              status: 'PENDING_VERIFICATION' as ChallengeStatus,
              progress: { current: 0, target: challenge.target.value, percentage: 0 }
            }
          
          case 'APPROVED':
            // Verifica approvata dall'admin - SOLO questa challenge è completata
            console.log('✅ Challenge con verifica APPROVED:', challenge.title, 'stato: COMPLETED')
            return {
              ...challenge,
              status: 'COMPLETED' as ChallengeStatus,
              progress: { 
                current: challenge.target.value, 
                target: challenge.target.value, 
                percentage: 100 
              },
              completedAt: verification.reviewed_at
            }
          
          case 'REJECTED':
            // Verifica rifiutata dall'admin - può riprovare
            console.log('❌ Challenge con verifica REJECTED:', challenge.title, 'stato: REJECTED')
            return {
              ...challenge,
              status: 'REJECTED' as ChallengeStatus,
              progress: { current: 0, target: challenge.target.value, percentage: 0 }
            }
          
          default:
            // Stato sconosciuto, mostra come disponibile
            console.log('❓ Challenge con stato verifica sconosciuto:', verification.status, 'stato: AVAILABLE')
            return {
              ...challenge,
              status: 'AVAILABLE' as ChallengeStatus,
              progress: { current: 0, target: challenge.target.value, percentage: 0 }
            }
        }
      }
      
      // Nessuna verifica presente - challenge disponibile
      console.log('✅ Challenge senza verifica:', challenge.title, 'stato: AVAILABLE')
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
    console.log('📋 Challenge con stato REJECTED:', updatedChallenges.filter(c => c.status === 'REJECTED').length)

    // Calcola lo stato dei banner
    const banners = ChallengeService.calculateBannerStatus(updatedChallenges)
    const unlockedBanners = ChallengeService.getUnlockedBanners(updatedChallenges)
    const nextBanner = ChallengeService.getNextBannerToUnlock(updatedChallenges)

    console.log('🏆 Banner sbloccati:', unlockedBanners.length)
    console.log('🎯 Prossimo banner:', nextBanner?.title || 'Nessuno')

    return NextResponse.json({ 
      success: true, 
      challenges: updatedChallenges,
      count: updatedChallenges.length,
      banners: {
        all: banners,
        unlocked: unlockedBanners,
        nextToUnlock: nextBanner
      }
    })

  } catch (error) {
    console.error('❌ Errore API challenges-status:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Errore interno del server' 
    }, { status: 500 })
  }
}
