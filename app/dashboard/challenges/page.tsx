'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Trophy, Star, Crown, Award, TrendingUp } from 'lucide-react'
import ChallengeSection from '@/components/challenges/ChallengeSection'
import { BannerShowcase } from '@/components/challenges/BannerShowcase'
import ChallengeStats from '@/components/challenges/ChallengeStats'
import UserNotifications from '@/components/challenges/UserNotifications'
import { useAuth } from '@/components/auth/AuthProvider'
import type { Banner } from '@/types'

export default function ChallengesPage() {
  const { user, loading } = useAuth()
  const [banners, setBanners] = useState<Banner[]>([])
  const [unlockedBanners, setUnlockedBanners] = useState<Banner[]>([])
  const [nextBannerToUnlock, setNextBannerToUnlock] = useState<Banner | null>(null)

  useEffect(() => {
    if (user) {
      loadChallengeAndBannerStatus()
    }
  }, [user])

  const loadChallengeAndBannerStatus = async () => {
    if (!user) return
    try {
      const response = await fetch(`/api/user/challenges-status?userId=${user.id}`)
      const data = await response.json()
      if (data.success && data.banners) {
        setBanners(data.banners.all || [])
        setUnlockedBanners(data.banners.unlocked || [])
        setNextBannerToUnlock(data.banners.nextToUnlock || null)
      }
    } catch (error) {
      console.error('Errore nel caricamento dello stato delle challenge e dei banner:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento challenge...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Accesso Negato</h2>
        <p className="text-gray-600 mt-2">Effettua il login per accedere alle challenge.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header Section */}
      <div className="text-center lg:text-left">
        <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-start mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-4 mb-4 lg:mb-0">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="text-center lg:text-left">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Le Tue Challenge</h1>
            <p className="text-gray-600 text-base lg:text-lg max-w-2xl">Completa le challenge per sbloccare i banner e migliorare il tuo profilo</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Challenge Totali</p>
                <p className="text-2xl font-bold text-gray-900">10</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Completate</p>
                <p className="text-2xl font-bold text-green-600">9</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Badge Sbloccati</p>
                <p className="text-2xl font-bold text-yellow-600">2</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Progresso</p>
                <p className="text-2xl font-bold text-purple-600">90%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Banner Showcase */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
          <CardTitle className="flex items-center text-xl">
            <Trophy className="w-6 h-6 mr-3 text-yellow-600" />
            I Tuoi Banner
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <BannerShowcase 
            banners={banners}
            unlockedBanners={unlockedBanners}
            nextBannerToUnlock={nextBannerToUnlock}
          />
        </CardContent>
      </Card>

      {/* Challenge Section */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center text-xl">
            <Target className="w-6 h-6 mr-3 text-blue-600" />
            Challenge Disponibili
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ChallengeSection 
            userId={user?.id || ''} 
            onChallengeComplete={(challengeId) => {
              console.log('Challenge completed:', challengeId)
              // Ricarica i banner dopo il completamento
              loadChallengeAndBannerStatus()
            }}
          />
        </CardContent>
      </Card>

      {/* Stats and Notifications */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Statistiche Challenge
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ChallengeStats userId={user?.id || ''} />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center text-lg">
              <Star className="w-5 h-5 mr-2 text-purple-600" />
              Notifiche
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <UserNotifications 
              userId={user?.id || ''} 
              onVerificationUpdate={(challengeId, status) => {
                console.log('🔄 Aggiornamento verifica ricevuto:', { challengeId, status })
                const event = new CustomEvent('challengeVerificationUpdate', { 
                  detail: { challengeId, status } 
                })
                window.dispatchEvent(event)
                // Ricarica i banner dopo l'aggiornamento
                loadChallengeAndBannerStatus()
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
