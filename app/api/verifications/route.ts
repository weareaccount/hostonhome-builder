import { NextRequest, NextResponse } from 'next/server'
import { VerificationService } from '@/lib/verifications'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, challengeId, photoUrl, photoDescription } = body
    
    if (!userId || !challengeId || !photoUrl) {
      return NextResponse.json({
        success: false,
        error: 'userId, challengeId e photoUrl sono richiesti'
      }, { status: 400 })
    }
    
    console.log('🔍 API: Invio verifica challenge:', challengeId, 'per utente:', userId)
    
    const verification = await VerificationService.submitVerification(
      userId,
      challengeId,
      photoUrl,
      photoDescription || ''
    )
    
    if (verification) {
      console.log('✅ API: Verifica inviata con successo:', verification.id)
      
      return NextResponse.json({
        success: true,
        verification,
        message: 'Verifica inviata con successo'
      })
    } else {
      console.error('❌ API: Errore nell\'invio della verifica')
      
      return NextResponse.json({
        success: false,
        error: 'Errore nell\'invio della verifica',
        verification: null
      }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ API: Errore nell\'invio della verifica:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      verification: null
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID richiesto',
        verifications: []
      }, { status: 400 })
    }
    
    console.log('🔍 API: Recupero verifiche utente:', userId)
    
    const verifications = await VerificationService.getUserVerifications(userId)
    
    console.log('✅ API: Verifiche utente recuperate:', verifications.length)
    
    return NextResponse.json({
      success: true,
      verifications,
      count: verifications.length
    })
  } catch (error) {
    console.error('❌ API: Errore nel recupero verifiche utente:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      verifications: []
    }, { status: 500 })
  }
}
