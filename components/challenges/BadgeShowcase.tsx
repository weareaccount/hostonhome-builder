'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Star, Crown, Award, Medal, Shield } from 'lucide-react'
import type { UserBadge } from '@/types'

interface BadgeShowcaseProps {
  badges: UserBadge[]
  userId: string
}

const getBadgeIcon = (badgeTitle: string) => {
  if (badgeTitle.includes('Primi passi')) return <Star className="w-6 h-6 text-yellow-500" />
  if (badgeTitle.includes('Ospite Felice')) return <Trophy className="w-6 h-6 text-green-500" />
  if (badgeTitle.includes('Indipendente')) return <Crown className="w-6 h-6 text-purple-500" />
  if (badgeTitle.includes('Super Host')) return <Award className="w-6 h-6 text-red-500" />
  if (badgeTitle.includes('Top Host')) return <Medal className="w-6 h-6 text-blue-500" />
  return <Shield className="w-6 h-6 text-gray-500" />
}

const getBadgeColor = (badgeTitle: string) => {
  if (badgeTitle.includes('Primi passi')) return 'from-yellow-400 to-orange-500'
  if (badgeTitle.includes('Ospite Felice')) return 'from-green-400 to-emerald-500'
  if (badgeTitle.includes('Indipendente')) return 'from-purple-400 to-violet-500'
  if (badgeTitle.includes('Super Host')) return 'from-red-400 to-pink-500'
  if (badgeTitle.includes('Top Host')) return 'from-blue-400 to-cyan-500'
  return 'from-gray-400 to-slate-500'
}

export default function BadgeShowcase({ badges, userId }: BadgeShowcaseProps) {
  const earnedBadges = badges.filter(badge => badge.isVisible)
  const totalBadges = badges.length

  if (earnedBadges.length === 0) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-gray-400 to-slate-500 rounded-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">I Tuoi Badge</span>
              <p className="text-sm text-gray-600 font-normal">Mostra i tuoi successi</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun badge ancora</h3>
            <p className="text-gray-600 mb-4">
              Completa le challenge per guadagnare i tuoi primi badge!
            </p>
            <div className="text-sm text-gray-500">
              Hai {totalBadges} badge disponibili da sbloccare
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
          <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-gray-900">I Tuoi Badge</span>
            <p className="text-sm text-gray-600 font-normal">
              {earnedBadges.length} di {totalBadges} badge guadagnati
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {earnedBadges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group"
            >
              <div className={`p-4 rounded-xl bg-gradient-to-br ${getBadgeColor(badge.title)} text-white shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-105`}>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    {getBadgeIcon(badge.title)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{badge.title}</h3>
                    <p className="text-sm text-white/90">{badge.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/80">
                    Guadagnato il {new Date(badge.earnedAt).toLocaleDateString('it-IT')}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-300" />
                    <span className="text-yellow-300 font-medium">Badge</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {earnedBadges.length < totalBadges && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Continua a guadagnare badge!</span>
            </div>
            <p className="text-sm text-blue-700">
              Hai ancora {totalBadges - earnedBadges.length} badge da sbloccare completando le challenge.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
