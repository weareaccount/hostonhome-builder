'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  ChevronDown, 
  ChevronRight,
  Star,
  Users,
  Calendar,
  Share2
} from 'lucide-react'
import ChallengeCard from './ChallengeCard'
import { ChallengeService } from '@/lib/challenges'
import type { Challenge, ChallengeStatus } from '@/types'

interface ChallengeSectionProps {
  userId: string
  onChallengeComplete?: (challengeId: string) => void
}

// Rimuovo i mock data - ora utilizziamo il ChallengeService

export default function ChallengeSection({ userId, onChallengeComplete }: ChallengeSectionProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [filter, setFilter] = useState<'ALL' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED'>('ALL')
  const [loading, setLoading] = useState(true)

  // Carica le challenge quando il componente viene montato
  useEffect(() => {
    const loadChallenges = async () => {
      if (!userId) return
      
      setLoading(true)
      try {
        const userChallenges = await ChallengeService.getUserChallenges(userId)
        setChallenges(userChallenges)
        
        // Simula alcuni eventi per dimostrare il funzionamento
        ChallengeService.simulateChallengeEvents(userId)
      } catch (error) {
        console.error('Errore nel caricamento delle challenge:', error)
      } finally {
        setLoading(false)
      }
    }

    loadChallenges()

    // Polling per aggiornare le challenge ogni 5 secondi
    const interval = setInterval(() => {
      if (userId) {
        loadChallenges()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [userId])

  // Statistiche delle challenge
  const stats = {
    total: challenges.length,
    completed: challenges.filter(c => c.status === 'COMPLETED').length,
    inProgress: challenges.filter(c => c.status === 'IN_PROGRESS').length,
    available: challenges.filter(c => c.status === 'AVAILABLE').length,
    locked: challenges.filter(c => c.status === 'LOCKED').length
  }

  const filteredChallenges = challenges.filter(challenge => {
    if (filter === 'ALL') return true
    return challenge.status === filter
  })

  const handleStartChallenge = async (challengeId: string) => {
    try {
      await ChallengeService.updateChallengeProgress(userId, challengeId, 1)
      // Ricarica le challenge per aggiornare lo stato
      const updatedChallenges = await ChallengeService.getUserChallenges(userId)
      setChallenges(updatedChallenges)
    } catch (error) {
      console.error('Errore nell\'avvio della challenge:', error)
    }
  }

  const handleClaimReward = async (challengeId: string) => {
    try {
      // Le ricompense possono essere riscosse solo dopo l'approvazione dell'admin
      console.log('Riscuotendo ricompensa per challenge:', challengeId)
      
      // Non completare automaticamente la challenge - deve essere già COMPLETED dall'admin
      const updatedChallenges = await ChallengeService.getUserChallenges(userId)
      setChallenges(updatedChallenges)
      
      onChallengeComplete?.(challengeId)
    } catch (error) {
      console.error('Errore nel riscuotere la ricompensa:', error)
    }
  }

  const handleShareChallenge = (challengeId: string) => {
    // Qui implementerai la logica per condividere la challenge
    console.log('Sharing challenge:', challengeId)
    
    // Simula la condivisione
    if (navigator.share) {
      navigator.share({
        title: 'Challenge SEO HostOnHome',
        text: 'Scopri le challenge per migliorare la SEO del tuo sito!',
        url: window.location.href
      })
    } else {
      // Fallback per browser che non supportano Web Share API
      const url = window.location.href
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copiato negli appunti!')
      })
    }
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">Challenge SEO</span>
              <p className="text-sm text-gray-600 font-normal">Fai crescere la SEO del tuo sito</p>
            </div>
          </CardTitle>
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span>{isExpanded ? 'Chiudi' : 'Apri'}</span>
          </Button>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="pt-0">
              {/* Statistiche */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">Totali</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">Completate</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">In corso</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.available}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">Disponibili</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{stats.locked}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">Bloccate</div>
                </div>
              </div>

              {/* Filtri */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { key: 'ALL', label: 'Tutte', count: stats.total },
                  { key: 'AVAILABLE', label: 'Disponibili', count: stats.available },
                  { key: 'IN_PROGRESS', label: 'In corso', count: stats.inProgress },
                  { key: 'COMPLETED', label: 'Completate', count: stats.completed }
                ].map(({ key, label, count }) => (
                  <Button
                    key={key}
                    variant={filter === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(key as any)}
                    className="flex items-center space-x-2"
                  >
                    <span>{label}</span>
                    <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                      {count}
                    </span>
                  </Button>
                ))}
              </div>

              {/* Lista Challenge */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Caricamento challenge...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredChallenges.map((challenge, index) => (
                      <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <ChallengeCard
                          challenge={challenge}
                          userId={userId}
                          onStart={handleStartChallenge}
                          onClaim={handleClaimReward}
                          onShare={handleShareChallenge}
                          onVerificationSubmitted={async (challengeId) => {
                            console.log('Verifica inviata per challenge:', challengeId)
                            // Ricarica le challenge per aggiornare lo stato
                            await loadChallenges()
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {filteredChallenges.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna challenge trovata</h3>
                      <p className="text-gray-600">Prova a cambiare filtro per vedere altre challenge.</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
