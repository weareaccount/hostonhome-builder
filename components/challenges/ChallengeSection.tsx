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
        // Usa direttamente l'API che legge dal database
        console.log('🔄 Caricamento challenge dal database...')
        console.log('📡 Chiamando API:', `/api/user/challenges-status?userId=${userId}`)
        const response = await fetch(`/api/user/challenges-status?userId=${userId}`)
        console.log('📡 Risposta API:', response.status, response.statusText)
        const data = await response.json()
        console.log('📡 Dati API ricevuti:', data)
        
        if (data.success) {
          console.log('✅ Challenge caricate con stato aggiornato:', data.count)
          
          // Log dettagliato per debug
          const completedChallenges = data.challenges.filter(c => c.status === 'COMPLETED')
          const rejectedChallenges = data.challenges.filter(c => c.status === 'REJECTED')
          const pendingChallenges = data.challenges.filter(c => c.status === 'PENDING_VERIFICATION')
          
          console.log('🎯 Challenge completate:', completedChallenges.length, completedChallenges.map(c => c.title))
          console.log('❌ Challenge rifiutate:', rejectedChallenges.length, rejectedChallenges.map(c => c.title))
          console.log('⏳ Challenge in verifica:', pendingChallenges.length, pendingChallenges.map(c => c.title))
          
          setChallenges(data.challenges)
        } else {
          console.error('❌ Errore nel caricamento challenge:', data.error)
          setChallenges([])
        }
      } catch (error) {
        console.error('Errore nel caricamento delle challenge:', error)
        setChallenges([])
      } finally {
        setLoading(false)
      }
    }

    loadChallenges()
    
    // Aggiornamento automatico ogni 10 secondi per verifiche in corso
    const interval = setInterval(() => {
      // Controlla se ci sono challenge in verifica
      const hasPendingChallenges = challenges.some(c => c.status === 'PENDING_VERIFICATION')
      if (hasPendingChallenges) {
        console.log('🔄 Controllo aggiornamenti per challenge in verifica...')
        loadChallenges()
      }
    }, 10000)
    
    // Aggiorna anche quando l'utente torna sulla pagina
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Pagina visibile - aggiornamento challenge...')
        loadChallenges()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Ascolta eventi di aggiornamento verifica
    const handleVerificationUpdate = (event: CustomEvent) => {
      console.log('🔔 Evento verifica ricevuto:', event.detail)
      const { challengeId, status } = event.detail
      console.log('🔄 Aggiornamento challenge dopo approvazione:', challengeId, status)
      loadChallenges()
    }
    
    window.addEventListener('challengeVerificationUpdate', handleVerificationUpdate as EventListener)
    
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('challengeVerificationUpdate', handleVerificationUpdate as EventListener)
    }
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
      console.log('🚀 Avvio challenge:', challengeId)
      
      // Aggiorna le challenge dal database invece che dal localStorage
      const response = await fetch(`/api/user/challenges-status?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setChallenges(data.challenges)
        console.log('✅ Challenge aggiornate dopo avvio')
      } else {
        console.error('❌ Errore nel caricamento challenge dopo avvio:', data.error)
      }
    } catch (error) {
      console.error('❌ Errore nell\'avvio della challenge:', error)
    }
  }

  const handleClaimReward = async (challengeId: string) => {
    try {
      console.log('🎁 Riscuotendo ricompensa per challenge:', challengeId)
      
      // Aggiorna le challenge dal database invece che dal localStorage
      const response = await fetch(`/api/user/challenges-status?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setChallenges(data.challenges)
        console.log('✅ Challenge aggiornate dopo riscossione ricompensa')
        
        // Mostra messaggio di successo
        alert('🎉 Ricompensa riscossa con successo!')
        
        onChallengeComplete?.(challengeId)
      } else {
        console.error('❌ Errore nel caricamento challenge dopo riscossione:', data.error)
        alert('❌ Errore nel riscuotere la ricompensa. Riprova.')
      }
    } catch (error) {
      console.error('❌ Errore nel riscuotere la ricompensa:', error)
      alert('❌ Errore nel riscuotere la ricompensa. Riprova.')
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

  const handleVerificationSubmitted = async (challengeId: string) => {
    try {
      console.log('🔄 CALLBACK RICEVUTO - Aggiornamento challenge dopo verifica inviata:', challengeId)
      console.log('🔄 UserId:', userId)
      console.log('🔄 Callback handleVerificationSubmitted chiamato correttamente!')
      
      // Aspetta un momento per assicurarsi che il database sia aggiornato
      console.log('⏳ Aspetto 500ms per sincronizzazione database...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Ricarica le challenge per aggiornare lo stato
      console.log('📡 Chiamando API challenges-status...')
      const response = await fetch(`/api/user/challenges-status?userId=${userId}`)
      const data = await response.json()
      
      console.log('📡 Risposta API:', data)
      
      if (data.success) {
        console.log('✅ API success - Aggiornando state con', data.challenges.length, 'challenge')
        setChallenges(data.challenges)
        console.log('✅ Challenge aggiornate dopo verifica inviata')
        
        // Log per debug
        const updatedChallenge = data.challenges.find(c => c.id === challengeId)
        if (updatedChallenge) {
          console.log('🎯 Challenge aggiornata:', updatedChallenge.title, 'Stato:', updatedChallenge.status)
        } else {
          console.error('❌ Challenge non trovata nell\'aggiornamento:', challengeId)
        }
      } else {
        console.error('❌ Errore nel caricamento challenge dopo verifica:', data.error)
      }
    } catch (error) {
      console.error('❌ Errore nell\'aggiornamento dopo verifica:', error)
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
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                console.log('🔄 Aggiornamento manuale challenge...')
                setLoading(true)
                try {
                  const response = await fetch(`/api/user/challenges-status?userId=${userId}`)
                  const data = await response.json()
                  if (data.success) {
                    setChallenges(data.challenges)
                    console.log('✅ Challenge aggiornate manualmente')
                  }
                } catch (error) {
                  console.error('❌ Errore aggiornamento manuale:', error)
                } finally {
                  setLoading(false)
                }
              }}
              className="flex items-center space-x-1"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Aggiorna</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <span>{isExpanded ? 'Chiudi' : 'Apri'}</span>
            </Button>
          </div>
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
                          onVerificationSubmitted={(challengeId) => {
                            console.log('🔗 Callback passato al ChallengeCard per challenge:', challengeId)
                            handleVerificationSubmitted(challengeId)
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
