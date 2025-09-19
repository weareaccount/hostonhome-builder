'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertCircle,
  Database,
  User
} from 'lucide-react'
// Le API routes gestiscono ora le chiamate a Supabase

interface DebugStats {
  adminNotifications: number
  userNotifications: number
  unreadAdmin: number
  unreadUser: number
  lastCheck: string
}

export default function NotificationDebugger() {
  const [stats, setStats] = useState<DebugStats>({
    adminNotifications: 0,
    userNotifications: 0,
    unreadAdmin: 0,
    unreadUser: 0,
    lastCheck: 'Mai'
  })
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)])
  }

  const checkNotificationSystem = async () => {
    setLoading(true)
    addLog('🔍 Controllo sistema notifiche...')

    try {
      // Test lettura notifiche admin tramite API
      const adminResponse = await fetch('/api/admin/notifications')
      const adminData = await adminResponse.json()
      
      if (adminData.success) {
        addLog(`📋 Notifiche admin trovate: ${adminData.count}`)
      } else {
        addLog(`❌ Errore notifiche admin: ${adminData.error}`)
      }

      // Test statistiche tramite API
      const statsResponse = await fetch('/api/admin/notifications/stats')
      const statsData = await statsResponse.json()
      
      if (statsData.success) {
        const { stats } = statsData
        addLog(`📊 Statistiche: ${stats.adminNotifications} notifiche admin, ${stats.unreadAdmin} non lette`)
        addLog(`📊 Verifiche: ${stats.verificationStats.total} totali, ${stats.verificationStats.unread} non lette`)
        
        setStats({
          adminNotifications: stats.adminNotifications,
          userNotifications: 0, // Non disponibile tramite API per ora
          unreadAdmin: stats.unreadAdmin,
          unreadUser: 0, // Non disponibile tramite API per ora
          lastCheck: new Date().toLocaleTimeString()
        })
      } else {
        addLog(`❌ Errore statistiche: ${statsData.error}`)
      }

      addLog('✅ Controllo completato con successo')
    } catch (error) {
      addLog(`❌ Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`)
    } finally {
      setLoading(false)
    }
  }

  const testCreateNotification = async () => {
    setLoading(true)
    addLog('🧪 Test creazione notifica...')

    try {
      // Test creazione notifica admin tramite API
      const testNotification = {
        type: 'CHALLENGE_VERIFICATION' as const,
        userId: 'test-user-id',
        challengeId: 'test-challenge',
        verificationId: null,
        title: 'Test Debug Notification',
        message: 'Questa è una notifica di test creata dal debugger',
        photoUrl: 'https://example.com/test.jpg',
        isRead: false
      }

      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          notification: testNotification
        })
      })

      const result = await response.json()
      
      if (result.success && result.notification) {
        addLog(`✅ Notifica admin creata: ${result.notification.id}`)
        
        // Rimuovi la notifica di test
        const deleteResponse = await fetch('/api/admin/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'remove',
            notificationId: result.notification.id
          })
        })
        
        const deleteResult = await deleteResponse.json()
        if (deleteResult.success) {
          addLog('🗑️ Notifica di test rimossa')
        } else {
          addLog('⚠️ Errore nella rimozione della notifica di test')
        }
      } else {
        addLog(`❌ Creazione notifica fallita: ${result.error}`)
      }
    } catch (error) {
      addLog(`❌ Errore test: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`)
    } finally {
      setLoading(false)
    }
  }

  const clearLogs = () => {
    setLogs([])
    addLog('🧹 Log puliti')
  }

  useEffect(() => {
    checkNotificationSystem()
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span>Debug Sistema Notifiche</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-800">{stats.adminNotifications}</div>
              <div className="text-sm text-blue-600">Notifiche Admin</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <User className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-800">{stats.userNotifications}</div>
              <div className="text-sm text-green-600">Notifiche Utente</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-800">{stats.unreadAdmin}</div>
              <div className="text-sm text-orange-600">Non Lette Admin</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-800">{stats.unreadUser}</div>
              <div className="text-sm text-purple-600">Non Lette Utente</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              onClick={checkNotificationSystem} 
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Controlla Sistema</span>
            </Button>
            
            <Button 
              onClick={testCreateNotification} 
              disabled={loading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Test Creazione</span>
            </Button>
            
            <Button 
              onClick={clearLogs} 
              variant="outline"
              className="flex items-center space-x-2"
            >
              <XCircle className="w-4 h-4" />
              <span>Pulisci Log</span>
            </Button>
          </div>

          <div className="text-sm text-gray-600 mb-4">
            Ultimo controllo: {stats.lastCheck}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <span>Log Debug</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-4">
                Nessun log disponibile
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono text-gray-700">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
