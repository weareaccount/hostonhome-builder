'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
// Le API routes gestiscono ora le chiamate a Supabase

interface UserNotification {
  id: string
  userId: string
  challengeId: string
  type: 'CHALLENGE_APPROVED' | 'CHALLENGE_REJECTED' | 'BADGE_UNLOCKED' | 'VERIFICATION_APPROVED' | 'VERIFICATION_REJECTED'
  title: string
  message: string
  isRead: boolean
  createdAt: Date
}

interface UserNotificationsProps {
  userId: string
  onVerificationUpdate?: (challengeId: string, status: 'APPROVED' | 'REJECTED') => void
}

export default function UserNotifications({ userId, onVerificationUpdate }: UserNotificationsProps) {
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
    
    // Aggiornamento automatico ogni 5 secondi per vedere notifiche di approvazione/rifiuto
    const interval = setInterval(() => {
      console.log('🔄 Controllo notifiche utente...')
      loadNotifications()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [userId])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      console.log('🔍 Caricamento notifiche utente tramite API:', userId)
      
      // Usa l'API route invece di chiamare direttamente Supabase
      const response = await fetch(`/api/user/notifications?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        console.log('✅ Notifiche utente recuperate tramite API:', data.count)
        
        // Controlla se ci sono nuove notifiche di verifica
        const newNotifications = data.notifications.filter((notification: UserNotification) => 
          notification.type === 'VERIFICATION_APPROVED' || notification.type === 'VERIFICATION_REJECTED'
        )
        
        // Se ci sono nuove notifiche di verifica, aggiorna lo stato della challenge
        if (newNotifications.length > 0) {
          newNotifications.forEach(async (notification: UserNotification) => {
            const status = notification.type === 'VERIFICATION_APPROVED' ? 'COMPLETED' : 'REJECTED'
            
            // Notifica il componente padre per il refresh - il database è già aggiornato
            console.log('🔔 Notifica verifica ricevuta:', notification.challengeId, status)
            if (onVerificationUpdate) {
              onVerificationUpdate(notification.challengeId, status === 'COMPLETED' ? 'APPROVED' : 'REJECTED')
            }
          })
        }
        
        setNotifications(data.notifications)
      } else {
        console.error('❌ Errore API:', data.error)
        setNotifications([])
      }
    } catch (error) {
      console.error('❌ Errore nel caricamento delle notifiche utente:', error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      console.log('📖 Marcatura notifica come letta:', notificationId)
      
      // Usa l'API route invece di chiamare direttamente Supabase
      const response = await fetch('/api/user/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'markAsRead',
          notificationId: notificationId
        })
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Notifica marcata come letta')
        await loadNotifications()
      } else {
        console.error('❌ Errore nella marcatura della notifica:', result.error)
      }
    } catch (error) {
      console.error('❌ Errore nel marcare come letta:', error)
    }
  }

  const clearAllNotifications = async () => {
    try {
      console.log('🧹 Pulizia di tutte le notifiche utente')
      
      // Per ora manteniamo il localStorage come fallback
      const key = `user_notifications_${userId}`
      localStorage.removeItem(key)
      
      // TODO: Implementare pulizia completa da Supabase se necessario
      await loadNotifications()
      
      console.log('✅ Notifiche pulite')
    } catch (error) {
      console.error('❌ Errore nella pulizia delle notifiche:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'CHALLENGE_APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'CHALLENGE_REJECTED':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'BADGE_UNLOCKED':
        return <span className="text-2xl">🎉</span>
      default:
        return <AlertCircle className="w-5 h-5 text-blue-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'CHALLENGE_APPROVED':
        return 'border-green-200 bg-green-50'
      case 'CHALLENGE_REJECTED':
        return 'border-red-200 bg-red-50'
      case 'BADGE_UNLOCKED':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <span>Le Tue Notifiche</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento notifiche...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <span>Le Tue Notifiche</span>
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('🔄 Aggiornamento manuale notifiche...')
              loadNotifications()
            }}
            className="flex items-center space-x-1"
          >
            <Bell className="w-4 h-4" />
            <span>Aggiorna</span>
          </Button>
          {notifications.length > 0 && (
            <Button 
              onClick={clearAllNotifications}
              variant="outline"
              size="sm"
              className="text-xs text-red-600 hover:text-red-700"
            >
              🧹 Pulisci
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Nessuna notifica</p>
            <p className="text-gray-500 text-sm">Riceverai notifiche quando le tue verifiche saranno esaminate</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${getNotificationColor(notification.type)} ${
                  !notification.isRead ? 'ring-2 ring-blue-200' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{notification.title}</h4>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.createdAt).toLocaleString('it-IT')}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Button
                      onClick={() => markAsRead(notification.id)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      ✓
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
