'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  Filter,
  MarkAsRead,
  Trash2
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'

export default function NotificationsPage() {
  const { user, loading } = useAuth()
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Challenge completata!',
      message: 'Hai completato la challenge "Prima recensione" e hai sbloccato il badge "Primi passi"',
      time: '2 minuti fa',
      read: false,
      category: 'challenge'
    },
    {
      id: 2,
      type: 'info',
      title: 'Nuovo progetto creato',
      message: 'Il progetto "San Vito Suites" è stato creato con successo. Puoi iniziare a personalizzarlo.',
      time: '1 ora fa',
      read: true,
      category: 'project'
    },
    {
      id: 3,
      type: 'warning',
      title: 'Trial in scadenza',
      message: 'Il tuo trial scadrà tra 4 giorni. Considera di fare upgrade per continuare a utilizzare tutte le funzionalità.',
      time: '3 ore fa',
      read: false,
      category: 'billing'
    },
    {
      id: 4,
      type: 'success',
      title: 'Badge sbloccato!',
      message: 'Congratulazioni! Hai sbloccato il badge "Ospite Felice" completando tutte le challenge richieste.',
      time: '1 giorno fa',
      read: true,
      category: 'badge'
    },
    {
      id: 5,
      type: 'info',
      title: 'Aggiornamento sistema',
      message: 'Sono state rilasciate nuove funzionalità per migliorare la tua esperienza. Scoprile nella dashboard!',
      time: '2 giorni fa',
      read: false,
      category: 'system'
    }
  ])

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read
    if (filter === 'read') return notification.read
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'info': return <Info className="w-5 h-5 text-blue-500" />
      default: return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'challenge': return 'bg-green-100 text-green-800'
      case 'project': return 'bg-blue-100 text-blue-800'
      case 'billing': return 'bg-yellow-100 text-yellow-800'
      case 'badge': return 'bg-purple-100 text-purple-800'
      case 'system': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'challenge': return 'Challenge'
      case 'project': return 'Progetto'
      case 'billing': return 'Fatturazione'
      case 'badge': return 'Badge'
      case 'system': return 'Sistema'
      default: return 'Generale'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento notifiche...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Accesso Negato</h2>
        <p className="text-gray-600 mt-2">Effettua il login per accedere alle notifiche.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="text-center lg:text-left">
          <h1 className="text-3xl font-bold text-gray-900">Notifiche</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 
              ? `${unreadCount} notifiche non lette` 
              : 'Tutte le notifiche sono state lette'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button 
              onClick={markAllAsRead}
              variant="outline"
              className="flex items-center gap-2"
            >
              <MarkAsRead className="w-4 h-4" />
              Segna tutte come lette
            </Button>
          )}
        </div>
      </div>

      {/* Filtri */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Tutte ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Non lette ({unreadCount})
              </Button>
              <Button
                variant={filter === 'read' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('read')}
              >
                Lette ({notifications.length - unreadCount})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista Notifiche */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filter === 'unread' ? 'Nessuna notifica non letta' : 
                 filter === 'read' ? 'Nessuna notifica letta' : 
                 'Nessuna notifica'}
              </h3>
              <p className="text-gray-600">
                {filter === 'unread' ? 'Tutte le notifiche sono state lette' :
                 filter === 'read' ? 'Non ci sono notifiche lette' :
                 'Non hai ancora ricevuto notifiche'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id}
              className={`transition-all duration-200 hover:shadow-md ${
                !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(notification.category)}`}>
                          {getCategoryLabel(notification.category)}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3 leading-relaxed">
                        {notification.message}
                      </p>
                      
                      <p className="text-sm text-gray-400">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {!notification.read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Segna come letta
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Statistiche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2 text-blue-600" />
            Statistiche Notifiche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
              <div className="text-sm text-gray-600">Totale</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{unreadCount}</div>
              <div className="text-sm text-gray-600">Non lette</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</div>
              <div className="text-sm text-gray-600">Lette</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(((notifications.length - unreadCount) / notifications.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Completate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
