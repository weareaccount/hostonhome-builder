import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/lib/notifications'
import { VerificationService } from '@/lib/verifications'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 API: Recupero statistiche notifiche...')
    
    // Ottieni statistiche dalle notifiche
    const adminNotifications = await NotificationService.getAdminNotifications()
    const unreadAdmin = await NotificationService.getAdminUnreadCount()
    
    // Ottieni statistiche dalle verifiche
    const verificationStats = await VerificationService.getNotificationStats()
    
    const stats = {
      adminNotifications: adminNotifications.length,
      unreadAdmin,
      verificationStats
    }
    
    console.log('✅ API: Statistiche recuperate:', stats)
    
    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('❌ API: Errore nel recupero statistiche:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      stats: {
        adminNotifications: 0,
        unreadAdmin: 0,
        verificationStats: { total: 0, unread: 0, pending: 0 }
      }
    }, { status: 500 })
  }
}
