'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Lock,
  Star
} from 'lucide-react'
import { ChallengeService } from '@/lib/challenges'

interface ChallengeStatsProps {
  userId: string
}

export default function ChallengeStats({ userId }: ChallengeStatsProps) {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    available: 0,
    locked: 0,
    completionRate: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      if (!userId) return
      
      setLoading(true)
      try {
        // Usa l'API Supabase invece del localStorage
        console.log('📊 Caricamento statistiche da API Supabase...')
        const response = await fetch(`/api/user/challenges-status?userId=${userId}`)
        const data = await response.json()
        
        if (data.success) {
          const challenges = data.challenges
          const stats = {
            total: challenges.length,
            completed: challenges.filter(c => c.status === 'COMPLETED').length,
            inProgress: challenges.filter(c => c.status === 'IN_PROGRESS').length,
            available: challenges.filter(c => c.status === 'AVAILABLE').length,
            locked: challenges.filter(c => c.status === 'LOCKED').length,
            completionRate: Math.round((challenges.filter(c => c.status === 'COMPLETED').length / challenges.length) * 100)
          }
          console.log('📊 Statistiche calcolate da API:', stats)
          setStats(stats)
        } else {
          console.error('❌ Errore API statistiche:', data.error)
        }
      } catch (error) {
        console.error('Errore nel caricamento delle statistiche:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [userId])

  if (loading) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              <div className="h-3 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900">Progresso Challenge</span>
            <p className="text-sm text-gray-600 font-normal">Le tue statistiche</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Completion Rate */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Completamento</span>
            <span className="text-sm font-bold text-blue-600">{stats.completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stats.completionRate}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-lg font-bold text-green-600">{stats.completed}</span>
            </div>
            <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">Completate</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Clock className="w-4 h-4 text-orange-600 mr-1" />
              <span className="text-lg font-bold text-orange-600">{stats.inProgress}</span>
            </div>
            <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">In corso</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Target className="w-4 h-4 text-blue-600 mr-1" />
              <span className="text-lg font-bold text-blue-600">{stats.available}</span>
            </div>
            <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">Disponibili</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Lock className="w-4 h-4 text-gray-600 mr-1" />
              <span className="text-lg font-bold text-gray-600">{stats.locked}</span>
            </div>
            <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">Bloccate</div>
          </div>
        </div>

        {/* Achievement Level */}
        <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-gray-800">
              {stats.completed === 0 && 'Inizia la tua prima challenge!'}
              {stats.completed > 0 && stats.completed < 3 && 'Ottimo inizio! Continua così!'}
              {stats.completed >= 3 && stats.completed < 6 && 'Stai diventando un host esperto!'}
              {stats.completed >= 6 && stats.completed < 9 && 'Sei quasi un Super Host!'}
              {stats.completed >= 9 && '🎉 Sei un Super Host Indipendente!'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
