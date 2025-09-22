import React from 'react'
import type { Banner } from '@/types'

interface BannerShowcaseProps {
  banners: Banner[]
  unlockedBanners: Banner[]
  nextBannerToUnlock: Banner | null
}

export function BannerShowcase({ banners, unlockedBanners, nextBannerToUnlock }: BannerShowcaseProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'text-gray-600 bg-gray-100'
      case 'UNCOMMON': return 'text-blue-600 bg-blue-100'
      case 'RARE': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'border-gray-300'
      case 'UNCOMMON': return 'border-blue-300'
      case 'RARE': return 'border-purple-300'
      default: return 'border-gray-300'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`relative rounded-lg border-2 p-4 transition-all duration-300 ${
              banner.isUnlocked 
                ? `${getRarityBorder(banner.rarity)} shadow-lg` 
                : 'border-gray-200 bg-gray-50 opacity-60'
            }`}
          >
            {/* Icona e titolo */}
            <div className="text-center mb-4">
              <div className={`text-4xl mb-2 ${banner.isUnlocked ? '' : 'grayscale'}`}>
                {banner.icon}
              </div>
              <h3 className={`font-bold text-lg ${banner.isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                {banner.title}
              </h3>
              <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(banner.rarity)}`}>
                {banner.rarity}
              </div>
            </div>

            {/* Descrizione */}
            <p className={`text-sm mb-4 ${banner.isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
              {banner.description}
            </p>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progresso</span>
                <span>{banner.progress.completed}/{banner.progress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    banner.isUnlocked ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${banner.progress.percentage}%` }}
                ></div>
              </div>
            </div>

            {/* Stato */}
            {banner.isUnlocked ? (
              <div className="text-center">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                  ✅ Sbloccato
                </div>
                {banner.unlockedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Sbloccato il {new Date(banner.unlockedAt).toLocaleDateString('it-IT')}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
                  🔒 Bloccato
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {banner.progress.completed > 0 
                    ? `${banner.progress.total - banner.progress.completed} task rimanenti`
                    : 'Completa le task richieste'
                  }
                </p>
              </div>
            )}

            {/* Badge "Prossimo" */}
            {nextBannerToUnlock?.id === banner.id && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                PROSSIMO
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
