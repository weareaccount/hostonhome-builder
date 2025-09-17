'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Share2, 
  Eye, 
  Star, 
  MessageCircle, 
  Camera, 
  Calendar, 
  Globe, 
  Users, 
  Trophy, 
  Crown,
  Lock,
  CheckCircle,
  Clock,
  Gift
} from 'lucide-react'
import type { Challenge, ChallengeStatus } from '@/types'

interface ChallengeCardProps {
  challenge: Challenge
  onStart?: (challengeId: string) => void
  onClaim?: (challengeId: string) => void
  onShare?: (challengeId: string) => void
}

const getChallengeIcon = (type: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'SHARE_SITE': <Share2 className="w-6 h-6" />,
    'FIRST_VISITS': <Eye className="w-6 h-6" />,
    'FIRST_REVIEW': <Star className="w-6 h-6" />,
    'WHATSAPP_CONTACT': <MessageCircle className="w-6 h-6" />,
    'UPDATE_PHOTOS': <Camera className="w-6 h-6" />,
    'FIRST_BOOKING': <Calendar className="w-6 h-6" />,
    'SOCIAL_SHARE': <Globe className="w-6 h-6" />,
    'INTERNATIONAL_GUEST': <Users className="w-6 h-6" />,
    'TOP_HOST_MONTH': <Trophy className="w-6 h-6" />,
    'SUPER_HOST_INDEPENDENT': <Crown className="w-6 h-6" />
  }
  return iconMap[type] || <Gift className="w-6 h-6" />
}

const getStatusIcon = (status: ChallengeStatus) => {
  switch (status) {
    case 'LOCKED':
      return <Lock className="w-4 h-4 text-gray-400" />
    case 'AVAILABLE':
      return <Clock className="w-4 h-4 text-blue-500" />
    case 'IN_PROGRESS':
      return <Clock className="w-4 h-4 text-orange-500" />
    case 'COMPLETED':
      return <CheckCircle className="w-4 h-4 text-green-500" />
    default:
      return <Clock className="w-4 h-4 text-gray-400" />
  }
}

const getStatusColor = (status: ChallengeStatus) => {
  switch (status) {
    case 'LOCKED':
      return 'border-gray-200 bg-gray-50'
    case 'AVAILABLE':
      return 'border-blue-200 bg-blue-50'
    case 'IN_PROGRESS':
      return 'border-orange-200 bg-orange-50'
    case 'COMPLETED':
      return 'border-green-200 bg-green-50'
    default:
      return 'border-gray-200 bg-gray-50'
  }
}

const getRewardIcon = (type: string) => {
  switch (type) {
    case 'BADGE':
      return <Trophy className="w-4 h-4 text-yellow-600" />
    case 'CONSULTATION':
      return <Users className="w-4 h-4 text-blue-600" />
    case 'TEMPLATE':
      return <Share2 className="w-4 h-4 text-purple-600" />
    case 'GUIDE':
      return <Camera className="w-4 h-4 text-green-600" />
    case 'TRANSLATION':
      return <Globe className="w-4 h-4 text-indigo-600" />
    case 'SHOWCASE':
      return <Star className="w-4 h-4 text-pink-600" />
    default:
      return <Gift className="w-4 h-4 text-gray-600" />
  }
}

export default function ChallengeCard({ challenge, onStart, onClaim, onShare }: ChallengeCardProps) {
  const isLocked = challenge.status === 'LOCKED'
  const isCompleted = challenge.status === 'COMPLETED'
  const isInProgress = challenge.status === 'IN_PROGRESS'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card className={`transition-all duration-200 hover:shadow-lg ${getStatusColor(challenge.status)} ${isLocked ? 'opacity-60' : ''}`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl ${isLocked ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                {getChallengeIcon(challenge.type)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{challenge.title}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(challenge.status)}
                  <span className="text-sm text-gray-600 capitalize">
                    {challenge.status === 'LOCKED' ? 'Bloccata' : 
                     challenge.status === 'AVAILABLE' ? 'Disponibile' :
                     challenge.status === 'IN_PROGRESS' ? 'In corso' : 'Completata'}
                  </span>
                </div>
              </div>
            </div>
            
            {isCompleted && (
              <div className="text-right">
                <div className="text-xs text-gray-500">Completata</div>
                <div className="text-sm font-medium text-green-600">
                  {challenge.completedAt ? new Date(challenge.completedAt).toLocaleDateString('it-IT') : ''}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-4 leading-relaxed">
            {challenge.description}
          </p>

          {/* Progress Bar */}
          {!isLocked && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progresso</span>
                <span className="text-sm text-gray-600">
                  {challenge.progress.current} / {challenge.progress.target} {challenge.target.unit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${
                    isCompleted ? 'bg-green-500' : 
                    isInProgress ? 'bg-orange-500' : 'bg-blue-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${challenge.progress.percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            </div>
          )}

          {/* Target */}
          <div className="mb-4 p-3 bg-white/70 rounded-lg border border-gray-100">
            <div className="text-sm font-medium text-gray-700 mb-1">Obiettivo</div>
            <div className="text-sm text-gray-600">{challenge.target.description}</div>
          </div>

          {/* Reward */}
          <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-2 mb-2">
              {getRewardIcon(challenge.reward.type)}
              <span className="text-sm font-semibold text-gray-800">Ricompensa</span>
            </div>
            <div className="text-sm font-medium text-gray-900">{challenge.reward.title}</div>
            <div className="text-xs text-gray-600 mt-1">{challenge.reward.description}</div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            {isLocked ? (
              <Button disabled className="flex-1 bg-gray-300 text-gray-500">
                <Lock className="w-4 h-4 mr-2" />
                Bloccata
              </Button>
            ) : isCompleted ? (
              <>
                <Button 
                  onClick={() => onClaim?.(challenge.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Riscuoti Ricompensa
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => onShare?.(challenge.id)}
                  className="px-3"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={() => onStart?.(challenge.id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isInProgress ? 'Continua' : 'Inizia'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => onShare?.(challenge.id)}
                  className="px-3"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
