'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface UserNotification {
  id: string
  userId: string
  challengeId: string
  type: 'CHALLENGE_APPROVED' | 'CHALLENGE_REJECTED' | 'BADGE_UNLOCKED'
  title: string
  message: string
  isRead: boolean
  createdAt: Date
}

interface UserNotificationsProps {
  userId: string
}

export default function UserNotifications({ userId }: UserNotificationsProps) {
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
    
    // Polling per aggiornare le notifiche ogni 5 secondi
    const interval = setInterval(() => {
      loadNotifications()
    }, 5000)

    return () => clearInterval(interval)
  }, [userId])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const key = `user_notifications_${userId}`
      const data = localStorage.getItem(key)
      const userNotifications = data ? JSON.parse(data) : []
      
      // Ordina per data di creazione (più recenti prima)
      const sortedNotifications = userNotifications.sort((a: UserNotification, b: UserNotification) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      
      setNotifications(sortedNotifications)
    } catch (error) {
      console.error('Errore nel caricamento delle notifiche utente:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const key = `user_notifications_${userId}`
      const data = localStorage.getItem(key)
      const userNotifications = data ? JSON.parse(data) : []
      
      const updatedNotifications = userNotifications.map((n: UserNotification) => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
      
      localStorage.setItem(key, JSON.stringify(updatedNotifications))
      await loadNotifications()
    } catch (error) {
      console.error('Errore nel marcare come letta:', error)
    }
  }

  const clearAllNotifications = async () => {
    try {
      const key = `user_notifications_${userId}`
      localStorage.removeItem(key)
      await loadNotifications()
    } catch (error) {
      console.error('Errore nella pulizia delle notifiche:', error)
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
