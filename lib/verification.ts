import type { ChallengeVerification, AdminNotification } from '@/types'

export class VerificationService {
  private static readonly STORAGE_KEY = 'challenge_verifications'
  private static readonly NOTIFICATIONS_KEY = 'admin_notifications'
  private static readonly SHARED_NOTIFICATIONS_KEY = 'shared_admin_notifications'
  private static readonly GLOBAL_NOTIFICATIONS_KEY = 'global_admin_notifications'
  private static readonly NOTIFICATION_COUNTER_KEY = 'notification_counter'

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
      
      console.log('🔍 Ricerca notifiche in tutti gli storage...')
      
      // Recupera da localStorage locale
      const localData = localStorage.getItem(this.NOTIFICATIONS_KEY)
      console.log('📦 Dati localStorage locale:', localData)
      
      // Recupera da sessionStorage condiviso
      const sharedData = sessionStorage.getItem(this.SHARED_NOTIFICATIONS_KEY)
      console.log('📦 Dati sessionStorage condiviso:', sharedData)
      
      // Recupera da storage globale simulato
      const globalData = localStorage.getItem(this.GLOBAL_NOTIFICATIONS_KEY)
      console.log('📦 Dati storage globale:', globalData)
      
      let allNotifications: AdminNotification[] = []
      
      // Combina tutte le notifiche da tutti i storage
      if (localData) {
        try {
          const localNotifications = JSON.parse(localData)
          allNotifications = [...allNotifications, ...localNotifications]
          console.log('✅ Aggiunte', localNotifications.length, 'notifiche locali')
        } catch (e) {
          console.error('❌ Errore parsing localStorage:', e)
        }
      }
      
      if (sharedData) {
        try {
          const sharedNotifications = JSON.parse(sharedData)
          allNotifications = [...allNotifications, ...sharedNotifications]
          console.log('✅ Aggiunte', sharedNotifications.length, 'notifiche condivise')
        } catch (e) {
          console.error('❌ Errore parsing sessionStorage:', e)
        }
      }
      
      if (globalData) {
        try {
          const globalNotifications = JSON.parse(globalData)
          // Rimuovi i campi server-specifici
          const cleanGlobalNotifications = globalNotifications.map((n: any) => {
            const { serverId, syncedAt, uniqueTimestamp, hash, ...cleanNotification } = n
            return cleanNotification
          })
          allNotifications = [...allNotifications, ...cleanGlobalNotifications]
          console.log('✅ Aggiunte', cleanGlobalNotifications.length, 'notifiche globali')
        } catch (e) {
          console.error('❌ Errore parsing storage globale:', e)
        }
      }
      
      console.log('📊 Totale notifiche prima della deduplicazione:', allNotifications.length)
      
      // Rimuovi duplicati basati sull'ID e sull'hash
      const uniqueNotifications = allNotifications.filter((notification, index, self) => 
        index === self.findIndex(n => n.id === notification.id)
      )
      
      console.log('📊 Totale notifiche dopo deduplicazione:', uniqueNotifications.length)
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

  // Metodo alternativo per ottenere notifiche solo dal server simulato
  static async getGlobalNotificationsOnly(): Promise<AdminNotification[]> {
    try {
      if (typeof window === 'undefined') {
        console.log('⚠️ Window undefined, ritorno array vuoto')
        return []
      }
      
      console.log('🌐 Recupero notifiche solo dal server simulato...')
      
      const globalData = localStorage.getItem(this.GLOBAL_NOTIFICATIONS_KEY)
      console.log('📦 Dati storage globale:', globalData)
      
      if (!globalData) {
        console.log('📭 Nessuna notifica nel server simulato')
        return []
      }
      
      const globalNotifications = JSON.parse(globalData)
      console.log('📋 Notifiche dal server simulato:', globalNotifications.length)
      
      // Rimuovi i campi server-specifici
      const cleanNotifications = globalNotifications.map((n: any) => {
        const { serverId, syncedAt, uniqueTimestamp, hash, ...cleanNotification } = n
        return cleanNotification
      })
      
      // Ordina per data di creazione (più recenti prima)
      const sortedNotifications = cleanNotifications.sort((a: AdminNotification, b: AdminNotification) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      
      console.log('📋 Notifiche dal server simulato ordinate:', sortedNotifications)
      return sortedNotifications
    } catch (error) {
      console.error('❌ Errore nel recupero delle notifiche globali:', error)
      return []
    }
  }

  // Metodo alternativo per ottenere notifiche solo dal server simulato
  static async getGlobalNotificationsOnly(): Promise<AdminNotification[]> {
    try {
      if (typeof window === 'undefined') {
        console.log('⚠️ Window undefined, ritorno array vuoto')
        return []
      }
      
      console.log('🌐 Recupero notifiche solo dal server simulato...')
      
      const globalData = localStorage.getItem(this.GLOBAL_NOTIFICATIONS_KEY)
      console.log('📦 Dati storage globale:', globalData)
      
      if (!globalData) {
        console.log('📭 Nessuna notifica nel server simulato')
        return []
      }
      
      const globalNotifications = JSON.parse(globalData)
      console.log('📋 Notifiche dal server simulato:', globalNotifications.length)
      
      // Rimuovi i campi server-specifici
      const cleanNotifications = globalNotifications.map((n: any) => {
        const { serverId, syncedAt, uniqueTimestamp, hash, ...cleanNotification } = n
        return cleanNotification
      })
      
      // Ordina per data di creazione (più recenti prima)
      const sortedNotifications = cleanNotifications.sort((a: AdminNotification, b: AdminNotification) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      
      console.log('📋 Notifiche dal server simulato ordinate:', sortedNotifications)
      return sortedNotifications
    } catch (error) {
      console.error('❌ Errore nel recupero delle notifiche globali:', error)
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
      console.log('❌ Rifiuto verifica:', verificationId, 'Motivo:', reason)
      
      const notifications = await this.getAdminNotifications()
      const notification = notifications.find(n => n.verificationId === verificationId)
      
      if (!notification) {
        console.log('❌ Notifica non trovata per verifica:', verificationId)
        return false
      }

      // Aggiorna lo stato della verifica
      await this.updateVerificationStatus(verificationId, 'REJECTED', adminId, reason)

      // Rimuovi la notifica
      await this.removeNotification(notification.id)

      // Notifica l'utente del rifiuto
      await this.notifyUserRejection(notification.userId, notification.challengeId, reason)

      console.log('✅ Verifica rifiutata:', verificationId)
      console.log('👤 Utente notificato del rifiuto:', notification.userId)
      return true
    } catch (error) {
      console.error('❌ Errore nel rifiuto:', error)
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
      console.log('🌐 Inizio sincronizzazione con server simulato...')
      
      // Usa un timestamp per simulare un ID server
      const serverId = `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Salva in un storage "globale" simulato usando un approccio diverso
      const globalKey = this.GLOBAL_NOTIFICATIONS_KEY
      const existing = localStorage.getItem(globalKey)
      const globalNotifications = existing ? JSON.parse(existing) : []
      
      const serverNotification = {
        ...notification,
        serverId,
        syncedAt: new Date(),
        // Aggiungi un timestamp unico per identificare questa notifica
        uniqueTimestamp: Date.now(),
        // Aggiungi un hash per identificare univocamente la notifica
        hash: this.generateNotificationHash(notification)
      }
      
      // Controlla se la notifica esiste già
      const exists = globalNotifications.some((n: any) => n.hash === serverNotification.hash)
      if (!exists) {
        globalNotifications.push(serverNotification)
        localStorage.setItem(globalKey, JSON.stringify(globalNotifications))
        console.log('💾 Notifica aggiunta al server simulato:', serverId)
      } else {
        console.log('⚠️ Notifica già esistente nel server simulato')
      }
      
      // Incrementa il contatore globale delle notifiche
      this.incrementGlobalCounter()
      
      console.log('🌐 Notifica sincronizzata con server simulato:', serverId)
      console.log('📊 Contatore globale aggiornato')
      
      // Verifica che sia stata salvata
      const verify = localStorage.getItem(globalKey)
      console.log('🔍 Verifica salvataggio:', verify ? JSON.parse(verify).length : 0, 'notifiche')
    } catch (error) {
      console.error('❌ Errore nella sincronizzazione:', error)
    }
  }

  // Genera un hash unico per la notifica
  private static generateNotificationHash(notification: AdminNotification): string {
    const data = `${notification.challengeId}_${notification.userId}_${notification.photoUrl}_${notification.createdAt}`
    return btoa(data).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)
  }

  // Incrementa il contatore globale delle notifiche
  private static incrementGlobalCounter(): void {
    try {
      const current = localStorage.getItem(this.NOTIFICATION_COUNTER_KEY)
      const count = current ? parseInt(current) + 1 : 1
      localStorage.setItem(this.NOTIFICATION_COUNTER_KEY, count.toString())
      console.log('📊 Contatore notifiche:', count)
    } catch (error) {
      console.error('❌ Errore nell\'incremento del contatore:', error)
    }
  }

  // Ottieni il contatore globale delle notifiche
  static getGlobalNotificationCount(): number {
    try {
      const current = localStorage.getItem(this.NOTIFICATION_COUNTER_KEY)
      return current ? parseInt(current) : 0
    } catch (error) {
      console.error('❌ Errore nel recupero del contatore:', error)
      return 0
    }
  }

  // Forza la sincronizzazione delle notifiche
  static async forceSyncNotifications(): Promise<void> {
    try {
      console.log('🔄 Forzando sincronizzazione notifiche...')
      
      // Recupera tutte le notifiche da tutti gli storage
      const allNotifications = await this.getAdminNotifications()
      
      // Salva le notifiche combinate in tutti gli storage
      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(allNotifications))
      sessionStorage.setItem(this.SHARED_NOTIFICATIONS_KEY, JSON.stringify(allNotifications))
      
      console.log('✅ Sincronizzazione forzata completata:', allNotifications.length, 'notifiche')
    } catch (error) {
      console.error('❌ Errore nella sincronizzazione forzata:', error)
    }
  }

  // Pulisci tutti gli storage delle notifiche (per debug)
  static clearAllNotifications(): void {
    try {
      localStorage.removeItem(this.NOTIFICATIONS_KEY)
      sessionStorage.removeItem(this.SHARED_NOTIFICATIONS_KEY)
      localStorage.removeItem(this.GLOBAL_NOTIFICATIONS_KEY)
      localStorage.removeItem(this.NOTIFICATION_COUNTER_KEY)
      console.log('🧹 Tutti gli storage delle notifiche puliti')
    } catch (error) {
      console.error('❌ Errore nella pulizia:', error)
    }
  }

  // Crea una notifica di test per verificare il sistema
  static async createTestNotification(): Promise<void> {
    try {
      console.log('🧪 Creazione notifica di test...')
      
      const testNotification: AdminNotification = {
        id: `test_${Date.now()}`,
        type: 'CHALLENGE_VERIFICATION',
        userId: 'test_user_123',
        challengeId: 'test_challenge_456',
        verificationId: `test_verification_${Date.now()}`,
        title: '🧪 Notifica di Test',
        message: 'Questa è una notifica di test per verificare che il sistema funzioni correttamente.',
        photoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwN2JmZiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlRFU1Q8L3RleHQ+PC9zdmc+',
        isRead: false,
        createdAt: new Date()
      }

      // Salva direttamente nel server simulato
      const globalKey = this.GLOBAL_NOTIFICATIONS_KEY
      const existing = localStorage.getItem(globalKey)
      const globalNotifications = existing ? JSON.parse(existing) : []
      
      globalNotifications.push(testNotification)
      localStorage.setItem(globalKey, JSON.stringify(globalNotifications))
      
      // Incrementa il contatore
      this.incrementGlobalCounter()
      
      console.log('✅ Notifica di test creata:', testNotification.id)
      console.log('📊 Contatore globale:', this.getGlobalNotificationCount())
    } catch (error) {
      console.error('❌ Errore nella creazione della notifica di test:', error)
    }
  }

  private static async updateVerificationStatus(
    verificationId: string,
    status: 'APPROVED' | 'REJECTED',
    adminId: string,
    reason?: string
  ): Promise<void> {
    try {
      console.log('🔄 Aggiornamento stato verifica:', verificationId, 'a', status)
      
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
          console.log('✅ Verifica aggiornata in:', key)
          break
        }
      }
      
      // Aggiorna anche lo stato della challenge nell'utente
      const notifications = await this.getAdminNotifications()
      const notification = notifications.find(n => n.verificationId === verificationId)
      
      if (notification) {
        const { ChallengeService } = await import('./challenges')
        const newStatus = status === 'APPROVED' ? 'COMPLETED' : 'REJECTED'
        await ChallengeService.updateChallengeStatus(notification.userId, notification.challengeId, newStatus)
        console.log('✅ Stato challenge aggiornato a:', newStatus)
      }
    } catch (error) {
      console.error('❌ Errore nell\'aggiornamento dello stato:', error)
    }
  }

  private static async removeNotification(notificationId: string): Promise<void> {
    try {
      console.log('🗑️ Rimozione notifica:', notificationId)
      
      // Rimuovi da localStorage locale
      const localNotifications = await this.getAdminNotifications()
      const updatedLocalNotifications = localNotifications.filter(n => n.id !== notificationId)
      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(updatedLocalNotifications))
      console.log('✅ Rimossa da localStorage locale')
      
      // Rimuovi da sessionStorage condiviso
      const sharedData = sessionStorage.getItem(this.SHARED_NOTIFICATIONS_KEY)
      if (sharedData) {
        const sharedNotifications = JSON.parse(sharedData)
        const updatedSharedNotifications = sharedNotifications.filter((n: AdminNotification) => n.id !== notificationId)
        sessionStorage.setItem(this.SHARED_NOTIFICATIONS_KEY, JSON.stringify(updatedSharedNotifications))
        console.log('✅ Rimossa da sessionStorage condiviso')
      }
      
      // Rimuovi dal server simulato
      const globalData = localStorage.getItem(this.GLOBAL_NOTIFICATIONS_KEY)
      if (globalData) {
        const globalNotifications = JSON.parse(globalData)
        const updatedGlobalNotifications = globalNotifications.filter((n: any) => n.id !== notificationId)
        localStorage.setItem(this.GLOBAL_NOTIFICATIONS_KEY, JSON.stringify(updatedGlobalNotifications))
        console.log('✅ Rimossa dal server simulato')
      }
      
      console.log('🗑️ Notifica rimossa completamente:', notificationId)
    } catch (error) {
      console.error('❌ Errore nella rimozione della notifica:', error)
    }
  }

  private static async completeChallenge(userId: string, challengeId: string): Promise<void> {
    try {
      console.log('🎯 Completamento challenge:', challengeId, 'per utente:', userId)
      
      // Importa dinamicamente per evitare dipendenze circolari
      const { ChallengeService } = await import('./challenges')
      await ChallengeService.completeChallenge(userId, challengeId)
      
      // Controlla e sblocca badge automaticamente
      const { BadgeService } = await import('./badges')
      await BadgeService.checkAndUnlockBadges(userId)
      
      console.log('✅ Challenge completata e badge controllati')
    } catch (error) {
      console.error('❌ Errore nel completamento della challenge:', error)
    }
  }

  private static async notifyUserApproval(userId: string, challengeId: string): Promise<void> {
    try {
      console.log('🔔 Creazione notifica utente per approvazione:', userId, challengeId)
      
      // Crea una notifica per l'utente
      const userNotification = {
        id: `user_notification_${Date.now()}`,
        userId: userId,
        challengeId: challengeId,
        type: 'CHALLENGE_APPROVED',
        title: '🎉 Challenge Approvata!',
        message: 'La tua verifica è stata approvata! Hai guadagnato un badge e puoi riscuotere la ricompensa.',
        isRead: false,
        createdAt: new Date()
      }

      // Salva la notifica utente
      const key = `user_notifications_${userId}`
      const existing = localStorage.getItem(key)
      const notifications = existing ? JSON.parse(existing) : []
      notifications.push(userNotification)
      localStorage.setItem(key, JSON.stringify(notifications))

      console.log('✅ Notifica utente creata:', userNotification.id)
    } catch (error) {
      console.error('❌ Errore nella notifica utente:', error)
    }
  }

  // Crea notifica utente per rifiuto
  private static async notifyUserRejection(userId: string, challengeId: string, reason: string): Promise<void> {
    try {
      console.log('🔔 Creazione notifica utente per rifiuto:', userId, challengeId)
      
      const userNotification = {
        id: `user_notification_${Date.now()}`,
        userId: userId,
        challengeId: challengeId,
        type: 'CHALLENGE_REJECTED',
        title: '❌ Challenge Rifiutata',
        message: `La tua verifica è stata rifiutata. Motivo: ${reason}. Puoi riprovare caricando una nuova foto.`,
        isRead: false,
        createdAt: new Date()
      }

      const key = `user_notifications_${userId}`
      const existing = localStorage.getItem(key)
      const notifications = existing ? JSON.parse(existing) : []
      notifications.push(userNotification)
      localStorage.setItem(key, JSON.stringify(notifications))
      
      console.log('✅ Notifica utente rifiuto creata:', userNotification.id)
    } catch (error) {
      console.error('❌ Errore nella notifica utente rifiuto:', error)
    }
  }
}
