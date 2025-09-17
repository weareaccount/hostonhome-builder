'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Trophy, 
  Star, 
  Crown, 
  Award, 
  Medal, 
  Shield, 
  Sparkles,
  Eye,
  EyeOff,
  Share2,
  Download,
  CheckCircle,
  Lock
} from 'lucide-react'
import type { UserBadge } from '@/types'
import { BadgeService } from '@/lib/badges'

interface BadgeShowcaseProps {
  badges: UserBadge[]
  userId: string
}

// Definizione completa dei badge con design avanzato
const BADGE_DEFINITIONS = {
  'Primi passi': {
    icon: Star,
    gradient: 'from-yellow-400 via-orange-500 to-red-500',
    glow: 'shadow-yellow-500/50',
    rarity: 'common',
    emoji: '⭐',
    description: 'Il tuo primo passo nel mondo dell\'ospitalità digitale'
  },
  'Ospite Felice': {
    icon: Trophy,
    gradient: 'from-green-400 via-emerald-500 to-teal-500',
    glow: 'shadow-green-500/50',
    rarity: 'uncommon',
    emoji: '🏆',
    description: 'Hai dimostrato di saper rendere felici i tuoi ospiti'
  },
  'Indipendente': {
    icon: Crown,
    gradient: 'from-purple-400 via-violet-500 to-indigo-500',
    glow: 'shadow-purple-500/50',
    rarity: 'rare',
    emoji: '👑',
    description: 'Hai raggiunto l\'indipendenza come host digitale'
  },
  'Super Host': {
    icon: Award,
    gradient: 'from-red-400 via-pink-500 to-rose-500',
    glow: 'shadow-red-500/50',
    rarity: 'epic',
    emoji: '🏅',
    description: 'Sei un Super Host riconosciuto dalla community'
  },
  'Top Host': {
    icon: Medal,
    gradient: 'from-blue-400 via-cyan-500 to-sky-500',
    glow: 'shadow-blue-500/50',
    rarity: 'legendary',
    emoji: '🥇',
    description: 'Sei tra i migliori host del mese'
  }
}

const getBadgeConfig = (badgeTitle: string) => {
  const key = Object.keys(BADGE_DEFINITIONS).find(k => badgeTitle.includes(k))
  return key ? BADGE_DEFINITIONS[key as keyof typeof BADGE_DEFINITIONS] : {
    icon: Shield,
    gradient: 'from-gray-400 to-slate-500',
    glow: 'shadow-gray-500/50',
    rarity: 'common',
    emoji: '🛡️',
    description: 'Badge speciale'
  }
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'text-gray-600'
    case 'uncommon': return 'text-green-600'
    case 'rare': return 'text-blue-600'
    case 'epic': return 'text-purple-600'
    case 'legendary': return 'text-yellow-600'
    default: return 'text-gray-600'
  }
}

// Componente BadgeCard avanzato
const BadgeCard = ({ badge, index }: { badge: UserBadge; index: number }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(badge.isVisible)
  const config = getBadgeConfig(badge.title)
  const IconComponent = config.icon

  const handleToggleVisibility = async () => {
    const newVisibility = !isVisible
    setIsVisible(newVisibility)
    
    try {
      await BadgeService.updateBadgeVisibility(badge.userId, badge.id, newVisibility)
      console.log(`Badge ${badge.id} visibility updated: ${newVisibility}`)
    } catch (error) {
      console.error('Errore nell\'aggiornamento della visibilità:', error)
      setIsVisible(!newVisibility) // Ripristina lo stato precedente
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Ho guadagnato il badge: ${badge.title}`,
        text: `Sono orgoglioso di aver guadagnato il badge "${badge.title}" su HostOnHome!`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(`Ho guadagnato il badge "${badge.title}" su HostOnHome!`)
      alert('Badge condiviso! Link copiato negli appunti.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${config.gradient} p-1 shadow-lg ${config.glow} transition-all duration-300 ${isHovered ? 'scale-105 shadow-2xl' : ''}`}>
        {/* Effetto shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: isHovered ? '100%' : '-100%' }}
          transition={{ duration: 0.6 }}
        />
        
        <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-6">
          {/* Header del badge */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                {/* Effetto sparkle */}
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </motion.div>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{badge.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full bg-white/20 text-white font-medium ${getRarityColor(config.rarity)}`}>
                    {config.rarity.toUpperCase()}
                  </span>
                  <span className="text-2xl">{config.emoji}</span>
                </div>
              </div>
            </div>
            
            {/* Azioni badge */}
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="outline"
                onClick={handleToggleVisibility}
                className="w-8 h-8 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleShare}
                className="w-8 h-8 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Descrizione */}
          <p className="text-white/90 text-sm mb-4 leading-relaxed">
            {config.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-300" />
              <span className="text-xs text-white/80">
                Guadagnato il {new Date(badge.earnedAt).toLocaleDateString('it-IT')}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-300" />
              <span className="text-xs text-yellow-300 font-medium">Badge</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function BadgeShowcase({ badges, userId }: BadgeShowcaseProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showAll, setShowAll] = useState(false)
  
  const earnedBadges = badges.filter(badge => badge.isVisible)
  const totalBadges = badges.length
  const displayedBadges = showAll ? earnedBadges : earnedBadges.slice(0, 3)

  if (earnedBadges.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-gray-400 to-slate-500 rounded-xl shadow-lg">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">I Tuoi Badge</span>
              <p className="text-sm text-gray-600 font-normal">Mostra i tuoi successi</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <Trophy className="w-16 h-16 text-gray-500" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3">Nessun badge ancora</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                Completa le challenge per guadagnare i tuoi primi badge e mostrare i tuoi successi!
              </p>
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
                <Lock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {totalBadges} badge disponibili da sbloccare
                </span>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl shadow-lg">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">I Tuoi Badge</span>
              <p className="text-sm text-gray-600 font-normal">
                {earnedBadges.length} di {totalBadges} badge guadagnati
              </p>
            </div>
          </CardTitle>
          
          {/* Controlli vista */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="flex items-center space-x-2"
            >
              {viewMode === 'grid' ? (
                <>
                  <Download className="w-4 h-4" />
                  <span>Lista</span>
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4" />
                  <span>Griglia</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Badge Grid */}
        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}`}>
          <AnimatePresence>
            {displayedBadges.map((badge, index) => (
              <BadgeCard key={badge.id} badge={badge} index={index} />
            ))}
          </AnimatePresence>
        </div>

        {/* Mostra più badge */}
        {earnedBadges.length > 3 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="flex items-center space-x-2"
            >
              {showAll ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>Mostra meno</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Mostra tutti ({earnedBadges.length})</span>
                </>
              )}
            </Button>
          </div>
        )}

        {/* Progresso badge */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trophy className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Progresso Badge</h3>
                <p className="text-sm text-gray-600">Continua a guadagnare badge!</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{earnedBadges.length}</div>
              <div className="text-sm text-gray-600">di {totalBadges}</div>
            </div>
          </div>
          
          {/* Barra progresso */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(earnedBadges.length / totalBadges) * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {earnedBadges.length < totalBadges ? 
                `${totalBadges - earnedBadges.length} badge da sbloccare` : 
                'Tutti i badge guadagnati! 🎉'
              }
            </span>
            <span className="font-medium text-blue-600">
              {Math.round((earnedBadges.length / totalBadges) * 100)}% completato
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
