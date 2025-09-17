import type { UserBadge } from '@/types'

export class BadgeService {
  private static readonly STORAGE_KEY = 'user_badges'

  // Ottieni tutti i badge di un utente
  static async getUserBadges(userId: string): Promise<UserBadge[]> {
    try {
      if (typeof window === 'undefined') return []
      
      const data = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`)
      const badges = data ? JSON.parse(data) : []
      
      // Se non ci sono badge, crea alcuni badge di esempio
      if (badges.length === 0) {
        const defaultBadges = this.createDefaultBadges(userId)
        this.saveUserBadges(userId, defaultBadges)
        return defaultBadges
      }
      
      return badges
    } catch (error) {
      console.error('Errore nel caricamento dei badge:', error)
      return []
    }
  }

  // Crea badge di default per nuovi utenti
  private static createDefaultBadges(userId: string): UserBadge[] {
    return [
      {
        id: '1',
        challengeId: '1',
        userId,
        title: 'Badge "Primi passi"',
        description: 'Il tuo primo passo nel mondo dell\'ospitalità digitale',
        icon: '⭐',
        earnedAt: new Date('2024-01-10'),
        isVisible: true
      },
      {
        id: '2',
        challengeId: '3',
        userId,
        title: 'Badge "Ospite Felice"',
        description: 'Hai dimostrato di saper rendere felici i tuoi ospiti',
        icon: '🏆',
        earnedAt: new Date('2024-01-15'),
        isVisible: true
      },
      {
        id: '3',
        challengeId: '5',
        userId,
        title: 'Badge "Indipendente"',
        description: 'Hai raggiunto l\'indipendenza come host digitale',
        icon: '👑',
        earnedAt: new Date('2024-01-20'),
        isVisible: true
      }
    ]
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
