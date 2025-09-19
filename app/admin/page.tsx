'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Bell, 
  TrendingUp, 
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Activity
} from 'lucide-react'
import NotificationDebugger from '@/components/debug/NotificationDebugger'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNotifications: 0,
    unreadNotifications: 0,
    pendingVerifications: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      
      // Usa l'API route per le statistiche
      const response = await fetch('/api/admin/notifications/stats')
      const data = await response.json()
      
      if (data.success) {
        const { stats } = data
        setStats({
          totalUsers: stats.verificationStats.total || 0,
          totalNotifications: stats.adminNotifications,
          unreadNotifications: stats.unreadAdmin,
          pendingVerifications: stats.verificationStats.pending
        })
      } else {
        console.error('Errore nel caricamento delle statistiche:', data.error)
        // Fallback con valori di default
        setStats({
          totalUsers: 0,
          totalNotifications: 0,
          unreadNotifications: 0,
          pendingVerifications: 0
        })
      }
    } catch (error) {
      console.error('Errore nel caricamento delle statistiche:', error)
      // Fallback con valori di default
      setStats({
        totalUsers: 0,
        totalNotifications: 0,
        unreadNotifications: 0,
        pendingVerifications: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: 'Verifiche in Attesa',
      description: `${stats.pendingVerifications} verifiche da esaminare`,
      icon: Bell,
      color: 'bg-orange-500',
      href: '/admin/verifications'
    },
    {
      title: 'Gestione Utenti',
      description: `${stats.totalUsers} utenti registrati`,
      icon: Users,
      color: 'bg-blue-500',
      href: '/admin/users'
    },
    {
      title: 'Statistiche',
      description: 'Analisi e report dettagliati',
      icon: BarChart3,
      color: 'bg-green-500',
      href: '/admin/stats'
    },
    {
      title: 'Impostazioni',
      description: 'Configurazione del sistema',
      icon: Activity,
      color: 'bg-purple-500',
      href: '/admin/settings'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Benvenuto nell'Admin Panel</h1>
            <p className="text-blue-100">
              Gestisci il sistema HostOnHome Builder e monitora le attività degli utenti
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <div className="text-blue-100">Utenti Attivi</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
                <div className="text-sm text-gray-600">Utenti Totali</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Bell className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.unreadNotifications}</div>
                <div className="text-sm text-gray-600">Notifiche Non Lette</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.pendingVerifications}</div>
                <div className="text-sm text-gray-600">Verifiche in Attesa</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalNotifications}</div>
                <div className="text-sm text-gray-600">Verifiche Totali</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Azioni Rapide</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <a
                    href={action.href}
                    className="block p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-lg ${action.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </a>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-green-600" />
              <span>Attività Recente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Verifica approvata</p>
                  <p className="text-xs text-gray-600">Challenge "Condividi il tuo sito" completata</p>
                </div>
                <span className="text-xs text-gray-500">2 min fa</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Nuova verifica</p>
                  <p className="text-xs text-gray-600">Foto caricata per "Prima visita"</p>
                </div>
                <span className="text-xs text-gray-500">5 min fa</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Nuovo utente</p>
                  <p className="text-xs text-gray-600">Mario Rossi si è registrato</p>
                </div>
                <span className="text-xs text-gray-500">10 min fa</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span>Azioni Richieste</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Verifiche in Attesa</span>
                </div>
                <p className="text-sm text-red-700">
                  Hai {stats.pendingVerifications} verifiche foto da esaminare. 
                  <a href="/admin/verifications" className="underline ml-1">Esamina ora</a>
                </p>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Sistema Aggiornato</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Nuova versione disponibile. 
                  <a href="/admin/settings" className="underline ml-1">Aggiorna ora</a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debug Section */}
      <div className="mt-8">
        <NotificationDebugger />
      </div>
    </div>
  )
}