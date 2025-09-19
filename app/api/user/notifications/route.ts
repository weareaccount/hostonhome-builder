import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/lib/notifications'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID richiesto',
        notifications: [],
        count: 0
      }, { status: 400 })
    }
    
    console.log('🔍 API: Recupero notifiche utente:', userId)
    
    const notifications = await NotificationService.getUserNotifications(userId)
    
    console.log('✅ API: Notifiche utente recuperate:', notifications.length)
    
    return NextResponse.json({
      success: true,
      notifications,
      count: notifications.length
    })
  } catch (error) {
    console.error('❌ API: Errore nel recupero notifiche utente:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      notifications: [],
      count: 0
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, notificationId, notification } = body
    
    console.log('🔍 API: Azione notifiche utente:', action)
    
    switch (action) {
      case 'markAsRead':
        if (!notificationId) {
          return NextResponse.json({
            success: false,
            error: 'ID notifica richiesto'
          }, { status: 400 })
        }
        
        const success = await NotificationService.markUserNotificationAsRead(notificationId)
        
        return NextResponse.json({
          success,
          message: success ? 'Notifica marcata come letta' : 'Errore nella marcatura'
        })
        
      case 'remove':
        if (!notificationId) {
          return NextResponse.json({
            success: false,
            error: 'ID notifica richiesto'
          }, { status: 400 })
        }
        
        const removed = await NotificationService.removeUserNotification(notificationId)
        
        return NextResponse.json({
          success: removed,
          message: removed ? 'Notifica rimossa' : 'Errore nella rimozione'
        })
        
      case 'create':
        if (!notification) {
          return NextResponse.json({
            success: false,
            error: 'Dati notifica richiesti'
          }, { status: 400 })
        }
        
        const created = await NotificationService.createUserNotification(notification)
        
        return NextResponse.json({
          success: !!created,
          notification: created,
          message: created ? 'Notifica creata' : 'Errore nella creazione'
        })
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Azione non supportata'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ API: Errore nell\'azione notifiche utente:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 })
  }
}
