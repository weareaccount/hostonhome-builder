import type { ChallengeVerification, AdminNotification } from '@/types'

export class VerificationService {
  private static readonly STORAGE_KEY = 'challenge_verifications'
  private static readonly NOTIFICATIONS_KEY = 'admin_notifications'

  // Invia una verifica per approvazione
  static async submitVerification(
    challengeId: string,
    userId: string,
    photoUrl: string,
    description?: string
  ): Promise<ChallengeVerification> {
    try {
      const verification: ChallengeVerification = {
        id: `verification_${Date.now()}`,
        challengeId,
        userId,
        photoUrl,
        photoDescription: description,
        status: 'PENDING',
        submittedAt: new Date()
      }

      // Salva la verifica
      await this.saveVerification(verification)

      // Aggiorna lo stato della challenge a PENDING_VERIFICATION
      const { ChallengeService } = await import('./challenges')
      await ChallengeService.updateChallengeStatus(userId, challengeId, 'PENDING_VERIFICATION')

      // Crea notifica per admin
      await this.createAdminNotification(verification)

      console.log('Verifica inviata:', verification.id)
      return verification
    } catch (error) {
      console.error('Errore nell\'invio della verifica:', error)
      throw error
    }
  }

  // Ottieni tutte le verifiche di un utente
  static async getUserVerifications(userId: string): Promise<ChallengeVerification[]> {
    try {
      if (typeof window === 'undefined') return []
      
      const data = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Errore nel caricamento delle verifiche:', error)
      return []
    }
  }

  // Ottieni tutte le notifiche admin
  static async getAdminNotifications(): Promise<AdminNotification[]> {
    try {
      if (typeof window === 'undefined') return []
      
      const data = localStorage.getItem(this.NOTIFICATIONS_KEY)
      const notifications = data ? JSON.parse(data) : []
      
      // Ordina per data di creazione (più recenti prima)
      return notifications.sort((a: AdminNotification, b: AdminNotification) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    } catch (error) {
      console.error('Errore nel caricamento delle notifiche:', error)
      return []
    }
  }

  // Approva una verifica
  static async approveVerification(
    verificationId: string,
    adminId: string
  ): Promise<boolean> {
    try {
      const notifications = await this.getAdminNotifications()
      const notification = notifications.find(n => n.verificationId === verificationId)
      
      if (!notification) return false

      // Aggiorna lo stato della verifica
      await this.updateVerificationStatus(verificationId, 'APPROVED', adminId)

      // Rimuovi la notifica
      await this.removeNotification(notification.id)

      // Completa automaticamente la challenge
      await this.completeChallenge(notification.userId, notification.challengeId)

      // Notifica l'utente dell'approvazione
      await this.notifyUserApproval(notification.userId, notification.challengeId)

      console.log('✅ Verifica approvata:', verificationId)
      console.log('👤 Utente notificato:', notification.userId)
      return true
    } catch (error) {
      console.error('Errore nell\'approvazione:', error)
      return false
    }
  }

  // Rifiuta una verifica
  static async rejectVerification(
    verificationId: string,
    adminId: string,
    reason: string
  ): Promise<boolean> {
    try {
      const notifications = await this.getAdminNotifications()
      const notification = notifications.find(n => n.verificationId === verificationId)
      
      if (!notification) return false

      // Aggiorna lo stato della verifica
      await this.updateVerificationStatus(verificationId, 'REJECTED', adminId, reason)

      // Rimuovi la notifica
      await this.removeNotification(notification.id)

      console.log('Verifica rifiutata:', verificationId)
      return true
    } catch (error) {
      console.error('Errore nel rifiuto:', error)
      return false
    }
  }

  // Marca notifica come letta
  static async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const notifications = await this.getAdminNotifications()
      const updatedNotifications = notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
      
      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications))
      return true
    } catch (error) {
      console.error('Errore nell\'aggiornamento della notifica:', error)
      return false
    }
  }

  // Ottieni statistiche notifiche
  static async getNotificationStats(): Promise<{
    total: number
    unread: number
    pending: number
  }> {
    try {
      const notifications = await this.getAdminNotifications()
      const unread = notifications.filter(n => !n.isRead).length
      const pending = notifications.length

      return {
        total: notifications.length,
        unread,
        pending
      }
    } catch (error) {
      console.error('Errore nel calcolo delle statistiche:', error)
      return { total: 0, unread: 0, pending: 0 }
    }
  }

  // Metodi privati
  private static async saveVerification(verification: ChallengeVerification): Promise<void> {
    try {
      if (typeof window === 'undefined') return
      
      const key = `${this.STORAGE_KEY}_${verification.userId}`
      const existing = localStorage.getItem(key)
      const verifications = existing ? JSON.parse(existing) : []
      
      verifications.push(verification)
      localStorage.setItem(key, JSON.stringify(verifications))
    } catch (error) {
      console.error('Errore nel salvataggio della verifica:', error)
    }
  }

  private static async createAdminNotification(verification: ChallengeVerification): Promise<void> {
    try {
      if (typeof window === 'undefined') return
      
      const notification: AdminNotification = {
        id: `notification_${Date.now()}`,
        type: 'CHALLENGE_VERIFICATION',
        userId: verification.userId,
        challengeId: verification.challengeId,
        verificationId: verification.id,
        title: 'Nuova verifica challenge',
        message: `L'utente ${verification.userId.slice(0, 8)} ha inviato una foto per verificare il completamento della challenge.`,
        photoUrl: verification.photoUrl,
        isRead: false,
        createdAt: new Date()
      }

      const existing = localStorage.getItem(this.NOTIFICATIONS_KEY)
      const notifications = existing ? JSON.parse(existing) : []
      
      notifications.push(notification)
      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications))
      
      console.log('🔔 Notifica admin creata:', notification.id)
      console.log('📸 Foto URL:', verification.photoUrl)
    } catch (error) {
      console.error('Errore nella creazione della notifica:', error)
    }
  }

  private static async updateVerificationStatus(
    verificationId: string,
    status: 'APPROVED' | 'REJECTED',
    adminId: string,
    reason?: string
  ): Promise<void> {
    try {
      // Trova e aggiorna la verifica in tutti gli utenti
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.STORAGE_KEY)
      )

      for (const key of keys) {
        const verifications = JSON.parse(localStorage.getItem(key) || '[]')
        const updatedVerifications = verifications.map((v: ChallengeVerification) => 
          v.id === verificationId 
            ? { 
                ...v, 
                status, 
                reviewedAt: new Date(),
                reviewedBy: adminId,
                rejectionReason: reason
              }
            : v
        )
        
        if (updatedVerifications.some((v: ChallengeVerification) => v.id === verificationId)) {
          localStorage.setItem(key, JSON.stringify(updatedVerifications))
          break
        }
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento dello stato:', error)
    }
  }

  private static async removeNotification(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getAdminNotifications()
      const updatedNotifications = notifications.filter(n => n.id !== notificationId)
      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications))
    } catch (error) {
      console.error('Errore nella rimozione della notifica:', error)
    }
  }

  private static async completeChallenge(userId: string, challengeId: string): Promise<void> {
    try {
      // Importa dinamicamente per evitare dipendenze circolari
      const { ChallengeService } = await import('./challenges')
      await ChallengeService.completeChallenge(userId, challengeId)
      
      // Aggiungi badge automaticamente
      const { BadgeService } = await import('./badges')
      await BadgeService.simulateBadgeEarned(userId, challengeId)
    } catch (error) {
      console.error('Errore nel completamento della challenge:', error)
    }
  }

  private static async notifyUserApproval(userId: string, challengeId: string): Promise<void> {
    try {
      // Crea una notifica per l'utente
      const userNotification = {
        id: `user_notification_${Date.now()}`,
        userId: userId,
        challengeId: challengeId,
        type: 'CHALLENGE_APPROVED',
        title: '🎉 Challenge Approvata!',
        message: 'La tua verifica è stata approvata! Hai guadagnato un badge.',
        isRead: false,
        createdAt: new Date()
      }

      // Salva la notifica utente
      const key = `user_notifications_${userId}`
      const existing = localStorage.getItem(key)
      const notifications = existing ? JSON.parse(existing) : []
      notifications.push(userNotification)
      localStorage.setItem(key, JSON.stringify(notifications))

      console.log('🔔 Notifica utente creata:', userNotification.id)
    } catch (error) {
      console.error('Errore nella notifica utente:', error)
    }
  }
}
