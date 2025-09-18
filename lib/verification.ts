import type { ChallengeVerification, AdminNotification } from '@/types'
import { VerificationService as SupabaseVerificationService } from './verifications'
import { NotificationService as SupabaseNotificationService } from './notifications'

export class VerificationService {

  // Invia una verifica per approvazione
  static async submitVerification(
    challengeId: string,
    userId: string,
    photoUrl: string,
    description?: string
  ): Promise<ChallengeVerification | null> {
    try {
      console.log('🚀 Inizio submitVerification tramite Supabase:', { challengeId, userId, photoUrl })
      
      // Usa il nuovo servizio Supabase
      const verification = await SupabaseVerificationService.submitVerification(
        userId,
        challengeId,
        photoUrl,
        description || ''
      )

      if (verification) {
        console.log('✅ Verifica inviata completamente tramite Supabase:', verification.id)
        return verification
      } else {
        console.error('❌ Errore nell\'invio della verifica tramite Supabase')
        return null
      }
    } catch (error) {
      console.error('❌ Errore nell\'invio della verifica:', error)
      return null
    }
  }

  // Ottieni tutte le verifiche di un utente
  static async getUserVerifications(userId: string): Promise<ChallengeVerification[]> {
    try {
      console.log('🔍 Recupero verifiche utente da Supabase:', userId)
      
      // Usa il nuovo servizio Supabase
      const verifications = await SupabaseVerificationService.getUserVerifications(userId)
      
      console.log('✅ Verifiche utente recuperate da Supabase:', verifications.length)
      return verifications
    } catch (error) {
      console.error('❌ Errore nel caricamento delle verifiche:', error)
      return []
    }
  }

  // Ottieni tutte le notifiche admin
  static async getAdminNotifications(): Promise<AdminNotification[]> {
    try {
      console.log('🔍 Recupero notifiche admin da Supabase...')
      
      // Usa il nuovo servizio Supabase
      const notifications = await SupabaseNotificationService.getAdminNotifications()
      
      console.log('✅ Notifiche admin recuperate da Supabase:', notifications.length)
      return notifications
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
      console.log('✅ Approvazione verifica tramite Supabase:', verificationId, 'da admin:', adminId)

      // Usa il nuovo servizio Supabase
      const success = await SupabaseVerificationService.approveVerification(verificationId, adminId)

      if (success) {
        console.log('✅ Approvazione completata tramite Supabase')
        return true
      } else {
        console.error('❌ Errore nell\'approvazione tramite Supabase')
        return false
      }
    } catch (error) {
      console.error('❌ Errore nell\'approvazione:', error)
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
      console.log('❌ Rifiuto verifica tramite Supabase:', verificationId, 'Motivo:', reason)

      // Usa il nuovo servizio Supabase
      const success = await SupabaseVerificationService.rejectVerification(verificationId, adminId, reason)

      if (success) {
        console.log('✅ Rifiuto completato tramite Supabase')
        return true
      } else {
        console.error('❌ Errore nel rifiuto tramite Supabase')
        return false
      }
    } catch (error) {
      console.error('❌ Errore nel rifiuto:', error)
      return false
    }
  }

  // Marca notifica come letta
  static async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      console.log('📖 Marcatura notifica come letta:', notificationId)
      
      // Usa il nuovo servizio Supabase
      const success = await SupabaseNotificationService.markAdminNotificationAsRead(notificationId)
      
      if (success) {
        console.log('✅ Notifica marcata come letta')
        return true
      } else {
        console.error('❌ Errore nella marcatura della notifica')
        return false
      }
    } catch (error) {
      console.error('❌ Errore nell\'aggiornamento della notifica:', error)
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










}
