import { NextRequest, NextResponse } from 'next/server'
import { VerificationService } from '@/lib/verifications'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Recupero verifiche admin...')
    
    const verifications = await VerificationService.getAllVerifications()
    
    console.log('✅ API: Verifiche recuperate:', verifications.length)
    
    return NextResponse.json({
      success: true,
      verifications,
      count: verifications.length
    })
  } catch (error) {
    console.error('❌ API: Errore nel recupero verifiche:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      verifications: [],
      count: 0
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, verificationId, adminId, reason } = body
    
    console.log('🔍 API: Azione verifica:', action, verificationId)
    
    switch (action) {
      case 'approve':
        if (!verificationId || !adminId) {
          return NextResponse.json({
            success: false,
            error: 'ID verifica e admin richiesti'
          }, { status: 400 })
        }
        
        const approved = await VerificationService.approveVerification(verificationId, adminId)
        
        return NextResponse.json({
          success: approved,
          message: approved ? 'Verifica approvata' : 'Errore nell\'approvazione'
        })
        
      case 'reject':
        if (!verificationId || !adminId || !reason) {
          return NextResponse.json({
            success: false,
            error: 'ID verifica, admin e motivo richiesti'
          }, { status: 400 })
        }
        
        const rejected = await VerificationService.rejectVerification(verificationId, adminId, reason)
        
        return NextResponse.json({
          success: rejected,
          message: rejected ? 'Verifica rifiutata' : 'Errore nel rifiuto'
        })
        
      case 'markNotificationAsRead':
        if (!verificationId) {
          return NextResponse.json({
            success: false,
            error: 'ID notifica richiesto'
          }, { status: 400 })
        }
        
        const marked = await VerificationService.removeNotification(verificationId)
        
        return NextResponse.json({
          success: marked,
          message: marked ? 'Notifica marcata come letta' : 'Errore nella marcatura'
        })
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Azione non supportata'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ API: Errore nell\'azione verifica:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 })
  }
}
