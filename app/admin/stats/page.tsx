'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Trophy,
  Calendar,
  Download,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react'

interface StatData {
  period: string
  users: number
  challenges: number
  completions: number
  revenue: number
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState({
    totalUsers: 156,
    activeUsers: 89,
    totalChallenges: 1247,
    completedChallenges: 892,
    totalRevenue: 12450,
    monthlyRevenue: 2100,
    avgCompletionRate: 71.5,
    topChallenge: 'Condividi il tuo sito'
  })
  
  const [chartData, setChartData] = useState<StatData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    loadStats()
  }, [selectedPeriod])

  const loadStats = async () => {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Ottieni dati reali dalle verifiche
      const { VerificationService } = await import('@/lib/verification')
      const notifications = await VerificationService.getAdminNotifications()
      const notificationStats = await VerificationService.getNotificationStats()
      
      // Calcola statistiche reali
      const uniqueUsers = new Set(notifications.map(n => n.userId)).size
      const completedVerifications = notifications.filter(n => n.isRead).length
      
      // Simula dati reali basati sul periodo selezionato
      const mockData: StatData[] = generateMockData(selectedPeriod)
      setChartData(mockData)
      
      // Aggiorna statistiche generali con dati reali
      setStats(prev => ({
        ...prev,
        totalUsers: uniqueUsers || 0, // Dati reali dalle verifiche
        activeUsers: Math.floor(uniqueUsers * 0.7) || 0, // 70% degli utenti attivi
        totalChallenges: notifications.length || 0, // Totale verifiche = challenge inviate
        completedChallenges: completedVerifications || 0, // Verifiche completate
        totalRevenue: completedVerifications * 25 || 0, // €25 per challenge completata
        monthlyRevenue: Math.floor(completedVerifications * 25 * 0.3) || 0 // 30% mensile
      }))
    } catch (error) {
      console.error('Errore nel caricamento delle statistiche:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = (period: string): StatData[] => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365
    const data: StatData[] = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      data.push({
        period: date.toLocaleDateString('it-IT', { 
          month: 'short', 
          day: 'numeric' 
        }),
        users: Math.floor(Math.random() * 20) + 5,
        challenges: Math.floor(Math.random() * 50) + 10,
        completions: Math.floor(Math.random() * 40) + 8,
        revenue: Math.floor(Math.random() * 500) + 100
      })
    }
    
    return data
  }

  const challengeStats = [
    { name: 'Condividi il tuo sito', completions: 89, rate: 89 },
    { name: 'Prima visita', completions: 67, rate: 67 },
    { name: 'Prima recensione', completions: 45, rate: 45 },
    { name: 'WhatsApp First Contact', completions: 34, rate: 34 },
    { name: 'Foto che parlano', completions: 78, rate: 78 },
    { name: 'Indipendenza in crescita', completions: 23, rate: 23 },
    { name: 'Super Condivisione', completions: 56, rate: 56 },
    { name: 'Ospite del mondo', completions: 12, rate: 12 },
    { name: 'Top Host del mese', completions: 8, rate: 8 },
    { name: 'Super Host Indipendente', completions: 3, rate: 3 }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistiche e Report</h1>
          <p className="text-gray-600">Analisi dettagliate delle performance del sistema</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Ultimi 7 giorni</option>
            <option value="30d">Ultimi 30 giorni</option>
            <option value="90d">Ultimi 90 giorni</option>
            <option value="1y">Ultimo anno</option>
          </select>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Esporta Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
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
                <div className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% questo mese
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.activeUsers}</div>
                <div className="text-sm text-gray-600">Utenti Attivi</div>
                <div className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8% questo mese
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.completedChallenges}</div>
                <div className="text-sm text-gray-600">Challenge Completate</div>
                <div className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15% questo mese
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">€{stats.monthlyRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Ricavi Mensili</div>
                <div className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +22% questo mese
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Attività Utenti</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.slice(-7).map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{data.period}</span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">{data.users} utenti</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">{data.challenges} challenge</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>Performance Challenge</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {challengeStats.slice(0, 5).map((challenge, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{challenge.name}</span>
                    <span className="text-sm text-gray-600">{challenge.completions} completate</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${challenge.rate}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Challenge Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span>Statistiche Dettagliate Challenge</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Challenge</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Completate</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Tasso Successo</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Tempo Medio</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {challengeStats.map((challenge, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{challenge.name}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-blue-600">{challenge.completions}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${challenge.rate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{challenge.rate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm text-gray-600">
                        {Math.floor(Math.random() * 7) + 1} giorni
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>Ricavi</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Ricavi Totali</span>
                <span className="font-bold text-lg">€{stats.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Ricavi Mensili</span>
                <span className="font-bold text-lg">€{stats.monthlyRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Ricavi Giornalieri</span>
                <span className="font-bold text-lg">€{(stats.monthlyRevenue / 30).toFixed(0)}</span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Crescita Mensile</span>
                  <span className="text-green-600 font-semibold flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +22%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Engagement</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tasso Completamento</span>
                <span className="font-bold text-lg">{stats.avgCompletionRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Utenti Attivi/Giorno</span>
                <span className="font-bold text-lg">{Math.floor(stats.activeUsers / 30)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Challenge Popolare</span>
                <span className="font-bold text-lg">{stats.topChallenge}</span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Soddisfazione</span>
                  <span className="text-green-600 font-semibold flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    94%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
