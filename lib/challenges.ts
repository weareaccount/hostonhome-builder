import type { Challenge, ChallengeProgress, ChallengeStatus, ChallengeType } from '@/types'

export class ChallengeService {
  private static readonly STORAGE_KEY = 'challenge_progress'
  private static readonly CHALLENGE_DEFINITIONS: Record<ChallengeType, any> = {
    SHARE_SITE: {
      title: 'Condividi il tuo sito',
      description: 'Invia il link del tuo sito a 10 persone (amici, parenti, ex ospiti) per aumentare la visibilità.',
      icon: '📤',
      reward: {
        type: 'BADGE',
        title: 'Badge "Primi passi"',
        description: 'Mostra il tuo badge di primo passo sul sito'
      },
      target: {
        value: 10,
        unit: 'persone',
        description: 'Condividi con 10 persone diverse'
      }
    },
    FIRST_VISITS: {
      title: 'Prima visita',
      description: 'Ottieni almeno 20 visite uniche al tuo sito per dimostrare il suo appeal.',
      icon: '👀',
      reward: {
        type: 'CONSULTATION',
        title: 'Consiglio SEO personalizzato',
        description: 'Ricevi consigli personalizzati per migliorare la SEO del tuo sito'
      },
      target: {
        value: 20,
        unit: 'visite',
        description: 'Raggiungi 20 visite uniche'
      }
    },
    FIRST_REVIEW: {
      title: 'Prima recensione',
      description: 'Pubblica la tua prima recensione sul sito per aumentare la credibilità.',
      icon: '⭐',
      reward: {
        type: 'BADGE',
        title: 'Badge "Ospite Felice"',
        description: 'Mostra il badge di ospite felice'
      },
      target: {
        value: 1,
        unit: 'recensione',
        description: 'Pubblica almeno una recensione'
      }
    },
    WHATSAPP_CONTACT: {
      title: 'WhatsApp First Contact',
      description: 'Ricevi il tuo primo messaggio di prenotazione tramite WhatsApp.',
      icon: '📱',
      reward: {
        type: 'TEMPLATE',
        title: 'Template gratuito di messaggi di risposta rapida',
        description: 'Template predefiniti per rispondere rapidamente ai clienti'
      },
      target: {
        value: 1,
        unit: 'messaggio',
        description: 'Ricevi un messaggio WhatsApp di prenotazione'
      }
    },
    UPDATE_PHOTOS: {
      title: 'Foto che parlano',
      description: 'Aggiorna la tua galleria con almeno 5 nuove foto di qualità per attirare più ospiti.',
      icon: '📸',
      reward: {
        type: 'GUIDE',
        title: 'Mini-guida "Fotografia per host"',
        description: 'Guida completa per scattare foto professionali della tua struttura'
      },
      target: {
        value: 5,
        unit: 'foto',
        description: 'Aggiungi 5 nuove foto di qualità'
      }
    },
    FIRST_BOOKING: {
      title: 'Indipendenza in crescita',
      description: 'Ricevi la tua prima prenotazione entro 2 mesi dalla pubblicazione.',
      icon: '📈',
      reward: {
        type: 'BADGE',
        title: 'Badge "Indipendente"',
        description: 'Mostra il badge di host indipendente'
      },
      target: {
        value: 1,
        unit: 'prenotazione',
        description: 'Ricevi la prima prenotazione'
      }
    },
    SOCIAL_SHARE: {
      title: 'Super Condivisione',
      description: 'Condividi il tuo sito su almeno un social (Instagram, Facebook o LinkedIn).',
      icon: '🌍',
      reward: {
        type: 'TEMPLATE',
        title: 'Template Canva per post social',
        description: 'Template personalizzati per condividere sui social'
      },
      target: {
        value: 1,
        unit: 'social',
        description: 'Condividi su almeno un social network'
      }
    },
    INTERNATIONAL_GUEST: {
      title: 'Ospite del mondo',
      description: 'Ricevi la prima richiesta da un ospite internazionale.',
      icon: '✈️',
      reward: {
        type: 'TRANSLATION',
        title: 'Traduzione gratuita di una sezione del sito in inglese',
        description: 'Traduzione professionale di una sezione del tuo sito'
      },
      target: {
        value: 1,
        unit: 'richiesta',
        description: 'Ricevi una richiesta da ospite internazionale'
      }
    },
    TOP_HOST_MONTH: {
      title: 'Top Host del mese',
      description: 'Completa almeno 3 challenge in un mese per diventare il top host.',
      icon: '🏅',
      reward: {
        type: 'SHOWCASE',
        title: 'Vetrina come "Host del mese" nella newsletter/community',
        description: 'Vieni mostrato come host del mese nella community'
      },
      target: {
        value: 3,
        unit: 'challenge',
        description: 'Completa 3 challenge in un mese'
      }
    },
    SUPER_HOST_INDEPENDENT: {
      title: 'Super Host Indipendente',
      description: 'Completa tutte le challenge principali per diventare un super host.',
      icon: '🔑',
      reward: {
        type: 'BADGE',
        title: 'Badge speciale visibile sul sito + menzione in homepage vetrina "HostOnHome"',
        description: 'Badge speciale e menzione nella homepage di HostOnHome'
      },
      target: {
        value: 9,
        unit: 'challenge',
        description: 'Completa tutte le challenge principali'
      }
    }
  }

  // Ottieni tutte le challenge per un utente
  static async getUserChallenges(userId: string): Promise<Challenge[]> {
    try {
      // In produzione, questo dovrebbe fare una chiamata API
      const progressData = this.getLocalProgress(userId)
      
      return Object.entries(this.CHALLENGE_DEFINITIONS).map(([type, definition], index) => {
        const challengeId = (index + 1).toString()
        const progress = progressData[challengeId] || { current: 0, target: definition.target.value, percentage: 0 }
        
        return {
          id: challengeId,
          type: type as ChallengeType,
          title: definition.title,
          description: definition.description,
          icon: definition.icon,
          reward: definition.reward,
          target: definition.target,
          status: this.calculateStatus(progress.current, definition.target.value, progress.status),
          progress: {
            current: progress.current,
            target: definition.target.value,
            percentage: Math.round((progress.current / definition.target.value) * 100)
          },
          completedAt: progress.completedAt,
          unlockedAt: progress.unlockedAt
        }
      })
    } catch (error) {
      console.error('Errore nel caricamento delle challenge:', error)
      return []
    }
  }

  // Aggiorna il progresso di una challenge
  static async updateChallengeProgress(
    userId: string, 
    challengeId: string, 
    increment: number = 1,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      const progressData = this.getLocalProgress(userId)
      const challenge = await this.getChallengeById(challengeId)
      
      if (!challenge) return false

      const currentProgress = progressData[challengeId] || { current: 0, target: challenge.target.value, percentage: 0 }
      const newCurrent = Math.min(currentProgress.current + increment, challenge.target.value)
      
      progressData[challengeId] = {
        current: newCurrent,
        target: challenge.target.value,
        percentage: Math.round((newCurrent / challenge.target.value) * 100),
        lastUpdated: new Date(),
        metadata: { ...currentProgress.metadata, ...metadata }
      }

      // Se la challenge è completata, aggiorna la data di completamento
      if (newCurrent >= challenge.target.value && !currentProgress.completedAt) {
        progressData[challengeId].completedAt = new Date()
      }

      this.saveLocalProgress(userId, progressData)
      
      // In produzione, qui dovresti fare una chiamata API per salvare nel database
      console.log(`Challenge ${challengeId} progress updated: ${newCurrent}/${challenge.target.value}`)
      
      return true
    } catch (error) {
      console.error('Errore nell\'aggiornamento del progresso:', error)
      return false
    }
  }

  // Completa una challenge
  static async completeChallenge(userId: string, challengeId: string): Promise<boolean> {
    try {
      const challenge = await this.getChallengeById(challengeId)
      if (!challenge) return false

      return await this.updateChallengeProgress(userId, challengeId, challenge.target.value)
    } catch (error) {
      console.error('Errore nel completamento della challenge:', error)
      return false
    }
  }

  // Aggiorna lo stato di una challenge
  static async updateChallengeStatus(
    userId: string, 
    challengeId: string, 
    status: 'IN_PROGRESS' | 'PENDING_VERIFICATION' | 'COMPLETED' | 'REJECTED'
  ): Promise<boolean> {
    try {
      const progressData = this.getLocalProgress(userId)
      const challenge = await this.getChallengeById(challengeId)
      
      if (!challenge) return false
      
      // Aggiorna il progresso con il nuovo stato
      progressData[challengeId] = {
        ...progressData[challengeId],
        current: challenge.target.value,
        target: challenge.target.value,
        percentage: 100,
        status: status,
        lastUpdated: new Date()
      }
      
      this.saveLocalProgress(userId, progressData)
      console.log(`Challenge ${challengeId} status updated to: ${status}`)
      return true
    } catch (error) {
      console.error('Errore nell\'aggiornamento dello stato:', error)
      return false
    }
  }

  // Ottieni una challenge specifica
  static async getChallengeById(challengeId: string): Promise<Challenge | null> {
    const challenges = await this.getUserChallenges('dummy-user-id') // In produzione passerai l'userId reale
    return challenges.find(c => c.id === challengeId) || null
  }

  // Calcola lo status di una challenge
  private static calculateStatus(current: number, target: number, customStatus?: string): ChallengeStatus {
    // Se c'è uno stato personalizzato (es. PENDING_VERIFICATION), usalo
    if (customStatus && ['PENDING_VERIFICATION', 'REJECTED'].includes(customStatus)) {
      return customStatus as ChallengeStatus
    }
    
    if (current >= target) return 'COMPLETED'
    if (current > 0) return 'IN_PROGRESS'
    return 'AVAILABLE'
  }

  // Gestione locale del progresso (per demo)
  private static getLocalProgress(userId: string): Record<string, any> {
    if (typeof window === 'undefined') return {}
    
    try {
      const data = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error('Errore nel caricamento del progresso locale:', error)
      return {}
    }
  }

  private static saveLocalProgress(userId: string, progress: Record<string, any>): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(progress))
    } catch (error) {
      console.error('Errore nel salvataggio del progresso locale:', error)
    }
  }

  // Simula eventi per testare le challenge
  static simulateChallengeEvents(userId: string): void {
    // Simula alcuni eventi per dimostrare il funzionamento
    setTimeout(() => {
      this.updateChallengeProgress(userId, '1', 2) // Condividi sito
    }, 1000)

    setTimeout(() => {
      this.updateChallengeProgress(userId, '2', 5) // Visite
    }, 2000)

    setTimeout(() => {
      this.updateChallengeProgress(userId, '5', 1) // Foto
    }, 3000)
  }

  // Ottieni statistiche delle challenge
  static async getChallengeStats(userId: string): Promise<{
    total: number
    completed: number
    inProgress: number
    available: number
    locked: number
    completionRate: number
  }> {
    const challenges = await this.getUserChallenges(userId)
    
    return {
      total: challenges.length,
      completed: challenges.filter(c => c.status === 'COMPLETED').length,
      inProgress: challenges.filter(c => c.status === 'IN_PROGRESS').length,
      available: challenges.filter(c => c.status === 'AVAILABLE').length,
      locked: challenges.filter(c => c.status === 'LOCKED').length,
      completionRate: Math.round((challenges.filter(c => c.status === 'COMPLETED').length / challenges.length) * 100)
    }
  }
}
