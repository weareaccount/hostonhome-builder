import type { UserBadge } from '@/types'

export class BadgeService {
  private static readonly STORAGE_KEY = 'user_badges'

  // Definizione dei gruppi di badge
  private static readonly BADGE_GROUPS = {
    'primi-passi': {
      id: 'primi-passi',
      title: 'Badge "Primi passi"',
      description: 'Il tuo primo passo nel mondo dell\'ospitalità digitale',
      icon: '⭐',
      rarity: 'COMMON',
      requiredChallenges: ['1', '2', '3', '4'], // Condividi sito, Prima visita, Prima recensione, WhatsApp First Contact
      color: 'bg-green-100 border-green-300 text-green-800'
    },
    'ospite-felice': {
      id: 'ospite-felice',
      title: 'Badge "Ospite Felice"',
      description: 'Hai dimostrato di saper rendere felici i tuoi ospiti',
      icon: '🏆',
      rarity: 'UNCOMMON',
      requiredChallenges: ['5', '6', '7', '8'], // Foto che parlano, Indipendenza in crescita, Super Condivisione, Ospite del mondo
      color: 'bg-blue-100 border-blue-300 text-blue-800'
    },
    'indipendente': {
      id: 'indipendente',
      title: 'Badge "Indipendente"',
      description: 'Hai raggiunto l\'indipendenza nell\'ospitalità digitale',
      icon: '👑',
      rarity: 'RARE',
      requiredChallenges: ['9', '10'], // Top Host del mese, Super Host Indipendente
      color: 'bg-purple-100 border-purple-300 text-purple-800'
    }
  }

  // Ottieni tutti i badge di un utente
  static async getUserBadges(userId: string): Promise<UserBadge[]> {
    try {
      if (typeof window === 'undefined') return []
      
      const data = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`)
      const badges = data ? JSON.parse(data) : []
      
      // Controlla se ci sono nuovi badge da sbloccare
      await this.checkAndUnlockBadges(userId)
      
      // Ricarica i badge dopo il controllo
      const updatedData = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`)
      return updatedData ? JSON.parse(updatedData) : []
    } catch (error) {
      console.error('Errore nel caricamento dei badge:', error)
      return []
    }
  }

  // Controlla e sblocca automaticamente i badge basati sui gruppi
  static async checkAndUnlockBadges(userId: string): Promise<void> {
    try {
      console.log('🔍 Controllo badge da sbloccare per utente:', userId)
      
      // Ottieni le challenge completate dall'utente tramite API Supabase
      console.log('📡 Chiamando API per badge da sbloccare...')
      const response = await fetch(`/api/user/challenges-status?userId=${userId}`)
      const data = await response.json()
      
      if (!data.success) {
        console.error('❌ Errore API badge:', data.error)
        return []
      }
      
      const userChallenges = data.challenges
      const completedChallenges = userChallenges.filter(c => c.status === 'COMPLETED')
      const completedChallengeIds = completedChallenges.map(c => c.id)
      
      console.log('✅ Challenge completate per badge:', completedChallengeIds)
      
      // Ottieni i badge attuali dell'utente
      const currentBadges = await this.getUserBadgesRaw(userId)
      const currentBadgeIds = currentBadges.map(b => b.id)
      
      // Controlla ogni gruppo di badge
      for (const [groupId, groupConfig] of Object.entries(this.BADGE_GROUPS)) {
        // Se l'utente ha già questo badge, salta
        if (currentBadgeIds.includes(groupId)) {
          console.log('⏭️ Badge già posseduto:', groupConfig.title)
          continue
        }
        
        // Controlla se l'utente ha completato tutte le challenge richieste
        const hasAllRequiredChallenges = groupConfig.requiredChallenges.every(challengeId => 
          completedChallenges.some(c => c.id === challengeId)
        )
        
        if (hasAllRequiredChallenges) {
          console.log('🎉 Sblocco badge:', groupConfig.title)
          await this.unlockBadge(userId, groupId, groupConfig)
        } else {
          const missingChallenges = groupConfig.requiredChallenges.filter(challengeId => 
            !completedChallengeIds.includes(challengeId)
          )
          console.log('⏳ Badge non ancora sbloccabile:', groupConfig.title, 'Mancano:', missingChallenges)
        }
      }
    } catch (error) {
      console.error('❌ Errore nel controllo badge:', error)
    }
  }

  // Ottieni badge senza controlli automatici
  private static async getUserBadgesRaw(userId: string): Promise<UserBadge[]> {
    try {
      if (typeof window === 'undefined') return []
      
      const data = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Errore nel caricamento dei badge:', error)
      return []
    }
  }

  // Sblocca un badge specifico
  private static async unlockBadge(userId: string, badgeId: string, groupConfig: any): Promise<void> {
    try {
      const newBadge: UserBadge = {
        id: badgeId,
        challengeId: groupConfig.requiredChallenges[0], // Usa la prima challenge come riferimento
        userId,
        title: groupConfig.title,
        description: groupConfig.description,
        icon: groupConfig.icon,
        earnedAt: new Date(),
        isVisible: true,
        rarity: groupConfig.rarity,
        color: groupConfig.color
      }

      const currentBadges = await this.getUserBadgesRaw(userId)
      const updatedBadges = [...currentBadges, newBadge]
      
      this.saveUserBadges(userId, updatedBadges)
      
      console.log('✅ Badge sbloccato:', newBadge.title)
      
      // Crea notifica per l'utente
      await this.createBadgeNotification(userId, newBadge)
    } catch (error) {
      console.error('❌ Errore nello sblocco badge:', error)
    }
  }

  // Crea notifica per il badge sbloccato
  private static async createBadgeNotification(userId: string, badge: UserBadge): Promise<void> {
    try {
      const notification = {
        id: `badge_notification_${Date.now()}`,
        userId: userId,
        challengeId: badge.challengeId,
        type: 'BADGE_UNLOCKED',
        title: `🎉 ${badge.title} Sbloccato!`,
        message: `Hai sbloccato il badge "${badge.title}"! ${badge.description}`,
        isRead: false,
        createdAt: new Date()
      }

      const key = `user_notifications_${userId}`
      const existing = localStorage.getItem(key)
      const notifications = existing ? JSON.parse(existing) : []
      notifications.push(notification)
      localStorage.setItem(key, JSON.stringify(notifications))
      
      console.log('🔔 Notifica badge creata:', notification.title)
    } catch (error) {
      console.error('❌ Errore nella creazione notifica badge:', error)
    }
  }

  // Salva i badge di un utente
  private static saveUserBadges(userId: string, badges: UserBadge[]): void {
    try {
      if (typeof window === 'undefined') return
      
      localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(badges))
    } catch (error) {
      console.error('Errore nel salvataggio dei badge:', error)
    }
  }

  // Aggiungi un nuovo badge
  static async addBadge(userId: string, badge: Omit<UserBadge, 'id' | 'earnedAt'>): Promise<UserBadge> {
    try {
      const badges = await this.getUserBadges(userId)
      const newBadge: UserBadge = {
        ...badge,
        id: `badge_${Date.now()}`,
        earnedAt: new Date()
      }
      
      const updatedBadges = [...badges, newBadge]
      this.saveUserBadges(userId, updatedBadges)
      
      return newBadge
    } catch (error) {
      console.error('Errore nell\'aggiunta del badge:', error)
      throw error
    }
  }

  // Aggiorna la visibilità di un badge
  static async updateBadgeVisibility(userId: string, badgeId: string, isVisible: boolean): Promise<boolean> {
    try {
      const badges = await this.getUserBadges(userId)
      const updatedBadges = badges.map(badge => 
        badge.id === badgeId ? { ...badge, isVisible } : badge
      )
      
      this.saveUserBadges(userId, updatedBadges)
      return true
    } catch (error) {
      console.error('Errore nell\'aggiornamento della visibilità:', error)
      return false
    }
  }

  // Ottieni statistiche dei badge
  static async getBadgeStats(userId: string): Promise<{
    total: number
    earned: number
    visible: number
    hidden: number
    completionRate: number
  }> {
    try {
      const badges = await this.getUserBadges(userId)
      const earned = badges.length
      const visible = badges.filter(b => b.isVisible).length
      const hidden = earned - visible
      
      return {
        total: 10, // Numero totale di badge disponibili
        earned,
        visible,
        hidden,
        completionRate: Math.round((earned / 10) * 100)
      }
    } catch (error) {
      console.error('Errore nel calcolo delle statistiche:', error)
      return {
        total: 10,
        earned: 0,
        visible: 0,
        hidden: 0,
        completionRate: 0
      }
    }
  }

  // Simula il guadagno di un nuovo badge
  static async simulateBadgeEarned(userId: string, challengeId: string): Promise<UserBadge | null> {
    try {
      const badgeMap: Record<string, Omit<UserBadge, 'id' | 'earnedAt' | 'userId'>> = {
        '1': {
          challengeId: '1',
          title: 'Badge "Primi passi"',
          description: 'Il tuo primo passo nel mondo dell\'ospitalità digitale',
          icon: '⭐',
          isVisible: true
        },
        '2': {
          challengeId: '2',
          title: 'Badge "Esploratore"',
          description: 'Hai ottenuto le tue prime visite al sito',
          icon: '👀',
          isVisible: true
        },
        '3': {
          challengeId: '3',
          title: 'Badge "Ospite Felice"',
          description: 'Hai dimostrato di saper rendere felici i tuoi ospiti',
          icon: '🏆',
          isVisible: true
        },
        '4': {
          challengeId: '4',
          title: 'Badge "Comunicatore"',
          description: 'Hai ricevuto il tuo primo contatto WhatsApp',
          icon: '📱',
          isVisible: true
        },
        '5': {
          challengeId: '5',
          title: 'Badge "Indipendente"',
          description: 'Hai raggiunto l\'indipendenza come host digitale',
          icon: '👑',
          isVisible: true
        }
      }

      const badgeData = badgeMap[challengeId]
      if (!badgeData) return null

      const badges = await this.getUserBadges(userId)
      const existingBadge = badges.find(b => b.challengeId === challengeId)
      
      if (existingBadge) return existingBadge

      const newBadge = await this.addBadge(userId, {
        ...badgeData,
        userId
      })

      return newBadge
    } catch (error) {
      console.error('Errore nella simulazione del badge:', error)
      return null
    }
  }

  // Esporta i badge come JSON
  static async exportBadges(userId: string): Promise<string> {
    try {
      const badges = await this.getUserBadges(userId)
      return JSON.stringify(badges, null, 2)
    } catch (error) {
      console.error('Errore nell\'esportazione dei badge:', error)
      return '[]'
    }
  }

  // Importa badge da JSON
  static async importBadges(userId: string, badgesJson: string): Promise<boolean> {
    try {
      const badges = JSON.parse(badgesJson)
      if (!Array.isArray(badges)) return false
      
      this.saveUserBadges(userId, badges)
      return true
    } catch (error) {
      console.error('Errore nell\'importazione dei badge:', error)
      return false
    }
  }
}
