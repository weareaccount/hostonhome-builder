import type { ChallengeVerification, AdminNotification } from '@/types'

export class VerificationService {
  private static readonly STORAGE_KEY = 'challenge_verifications'
  private static readonly NOTIFICATIONS_KEY = 'admin_notifications'
  private static readonly SHARED_NOTIFICATIONS_KEY = 'shared_admin_notifications'

  // Invia una verifica per approvazione
  static async submitVerification(
    challengeId: string,
    userId: string,
    photoUrl: string,
    description?: string
  ): Promise<ChallengeVerification> {
    try {
      console.log('🚀 Inizio submitVerification:', { challengeId, userId, photoUrl })
      
      const verification: ChallengeVerification = {
        id: `verification_${Date.now()}`,
        challengeId,
        userId,
        photoUrl,
        photoDescription: description,
        status: 'PENDING',
        submittedAt: new Date()
      }

      console.log('📝 Verifica creata:', verification)

      // Salva la verifica
      await this.saveVerification(verification)
      console.log('💾 Verifica salvata')

      // Aggiorna lo stato della challenge a PENDING_VERIFICATION
      const { ChallengeService } = await import('./challenges')
      await ChallengeService.updateChallengeStatus(userId, challengeId, 'PENDING_VERIFICATION')
      console.log('🔄 Stato challenge aggiornato a PENDING_VERIFICATION')

      // Crea notifica per admin
      await this.createAdminNotification(verification)
      console.log('🔔 Notifica admin creata')

      console.log('✅ Verifica inviata completamente:', verification.id)
      return verification
    } catch (error) {
      console.error('❌ Errore nell\'invio della verifica:', error)
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
      if (typeof window === 'undefined') {
        console.log('⚠️ Window undefined, ritorno array vuoto')
        return []
      }
      
      // Recupera da localStorage locale
      const localData = localStorage.getItem(this.NOTIFICATIONS_KEY)
      console.log('📦 Dati localStorage locale:', localData)
      
      // Recupera da sessionStorage condiviso
      const sharedData = sessionStorage.getItem(this.SHARED_NOTIFICATIONS_KEY)
      console.log('📦 Dati sessionStorage condiviso:', sharedData)
      
      // Recupera da storage globale simulato
      const globalData = localStorage.getItem('global_admin_notifications')
      console.log('📦 Dati storage globale:', globalData)
      
      let allNotifications: AdminNotification[] = []
      
      // Combina tutte le notifiche da tutti i storage
      if (localData) {
        const localNotifications = JSON.parse(localData)
        allNotifications = [...allNotifications, ...localNotifications]
      }
      
      if (sharedData) {
        const sharedNotifications = JSON.parse(sharedData)
        allNotifications = [...allNotifications, ...sharedNotifications]
      }
      
      if (globalData) {
        const globalNotifications = JSON.parse(globalData)
        // Rimuovi i campi server-specifici
        const cleanGlobalNotifications = globalNotifications.map((n: any) => {
          const { serverId, syncedAt, ...cleanNotification } = n
          return cleanNotification
        })
        allNotifications = [...allNotifications, ...cleanGlobalNotifications]
      }
      
      // Rimuovi duplicati basati sull'ID
      const uniqueNotifications = allNotifications.filter((notification, index, self) => 
        index === self.findIndex(n => n.id === notification.id)
      )
      
      console.log('🔔 Notifiche combinate:', uniqueNotifications)
      
      // Ordina per data di creazione (più recenti prima)
      const sortedNotifications = uniqueNotifications.sort((a: AdminNotification, b: AdminNotification) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      
      console.log('📋 Notifiche ordinate:', sortedNotifications)
      return sortedNotifications
    } catch (error) {
      console.error('❌ Errore nel caricamento delle notifiche:', error)
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
      if (typeof window === 'undefined') {
        console.log('⚠️ Window undefined in createAdminNotification')
        return
      }
      
      console.log('🔔 Creazione notifica admin per verifica:', verification.id)
      
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

      console.log('📝 Notifica creata:', notification)

      // Salva in localStorage locale
      const existing = localStorage.getItem(this.NOTIFICATIONS_KEY)
      console.log('📦 Dati esistenti localStorage:', existing)
      
      const notifications = existing ? JSON.parse(existing) : []
      console.log('📋 Notifiche esistenti localStorage:', notifications)
      
      notifications.push(notification)
      console.log('➕ Notifica aggiunta localStorage, totale:', notifications.length)
      
      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications))
      console.log('💾 Notifiche salvate in localStorage')

      // Salva anche in sessionStorage per condivisione tra tab
      const sharedExisting = sessionStorage.getItem(this.SHARED_NOTIFICATIONS_KEY)
      const sharedNotifications = sharedExisting ? JSON.parse(sharedExisting) : []
      
      sharedNotifications.push(notification)
      sessionStorage.setItem(this.SHARED_NOTIFICATIONS_KEY, JSON.stringify(sharedNotifications))
      console.log('💾 Notifiche salvate in sessionStorage per condivisione')

      // Simula invio a "server" usando un timestamp per sincronizzazione
      await this.syncToSharedStorage(notification)
      
      console.log('✅ Notifica admin creata con successo:', notification.id)
      console.log('📸 Foto URL:', verification.photoUrl)
    } catch (error) {
      console.error('❌ Errore nella creazione della notifica:', error)
    }
  }

  // Simula sincronizzazione con "server" condiviso
  private static async syncToSharedStorage(notification: AdminNotification): Promise<void> {
    try {
      // Usa un timestamp per simulare un ID server
      const serverId = `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Salva in un storage "globale" simulato
      const globalKey = 'global_admin_notifications'
      const existing = localStorage.getItem(globalKey)
      const globalNotifications = existing ? JSON.parse(existing) : []
      
      const serverNotification = {
        ...notification,
        serverId,
        syncedAt: new Date()
      }
      
      globalNotifications.push(serverNotification)
      localStorage.setItem(globalKey, JSON.stringify(globalNotifications))
      
      console.log('🌐 Notifica sincronizzata con server simulato:', serverId)
    } catch (error) {
      console.error('❌ Errore nella sincronizzazione:', error)
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
