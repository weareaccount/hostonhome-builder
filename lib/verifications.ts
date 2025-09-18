import { supabase } from './supabase'
import { NotificationService } from './notifications'
import type { ChallengeVerification, AdminNotification } from '@/types'

export class VerificationService {
  // Invia una verifica challenge
  static async submitVerification(
    userId: string,
    challengeId: string,
    photoUrl: string,
    description: string = ''
  ): Promise<ChallengeVerification | null> {
    try {
      console.log('📝 Invio verifica challenge:', challengeId, 'per utente:', userId)

      const verification: Omit<ChallengeVerification, 'id' | 'submittedAt'> = {
        challengeId,
        userId,
        photoUrl,
        photoDescription: description,
        status: 'PENDING'
      }

      console.log('📝 Verifica creata:', verification)

      // Salva la verifica in Supabase
      const { data, error } = await supabase
        .from('challenge_verifications')
        .insert([verification])
        .select()
        .single()

      if (error) {
        console.error('❌ Errore nel salvataggio verifica:', error)
        return null
      }

      console.log('💾 Verifica salvata in Supabase:', data.id)

      // Aggiorna lo stato della challenge a PENDING_VERIFICATION
      const { ChallengeService } = await import('./challenges')
      await ChallengeService.updateChallengeStatus(userId, challengeId, 'PENDING_VERIFICATION')
      console.log('🔄 Stato challenge aggiornato a PENDING_VERIFICATION')

      // Crea notifica per admin
      await this.createAdminNotification(data)
      console.log('🔔 Notifica admin creata')

      console.log('✅ Verifica inviata completamente:', data.id)
      return data
    } catch (error) {
      console.error('❌ Errore nell\'invio della verifica:', error)
      return null
    }
  }

  // Ottieni tutte le verifiche di un utente
  static async getUserVerifications(userId: string): Promise<ChallengeVerification[]> {
    try {
      console.log('🔍 Recupero verifiche utente da Supabase:', userId)
      
      const { data, error } = await supabase
        .from('challenge_verifications')
        .select('*')
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false })

      if (error) {
        console.error('❌ Errore nel recupero verifiche utente:', error)
        return []
      }

      console.log('✅ Verifiche utente recuperate:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ Errore nel recupero verifiche utente:', error)
      return []
    }
  }

  // Ottieni tutte le verifiche (per admin)
  static async getAllVerifications(): Promise<ChallengeVerification[]> {
    try {
      console.log('🔍 Recupero tutte le verifiche da Supabase...')
      
      const { data, error } = await supabase
        .from('challenge_verifications')
        .select('*')
        .order('submitted_at', { ascending: false })

      if (error) {
        console.error('❌ Errore nel recupero verifiche:', error)
        return []
      }

      console.log('✅ Verifiche recuperate:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ Errore nel recupero verifiche:', error)
      return []
    }
  }

  // Approva una verifica
  static async approveVerification(
    verificationId: string,
    adminId: string
  ): Promise<boolean> {
    try {
      console.log('✅ Approvazione verifica:', verificationId, 'da admin:', adminId)

      // Aggiorna lo stato della verifica
      const { data, error } = await supabase
        .from('challenge_verifications')
        .update({
          status: 'APPROVED',
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminId
        })
        .eq('id', verificationId)
        .select()
        .single()

      if (error) {
        console.error('❌ Errore nell\'approvazione verifica:', error)
        return false
      }

      console.log('✅ Verifica approvata:', data.id)

      // Aggiorna lo stato della challenge a COMPLETED
      const { ChallengeService } = await import('./challenges')
      await ChallengeService.updateChallengeStatus(data.user_id, data.challenge_id, 'COMPLETED')
      console.log('🔄 Stato challenge aggiornato a COMPLETED')

      // Controlla e sblocca badge
      const { BadgeService } = await import('./badges')
      await BadgeService.checkAndUnlockBadges(data.user_id)
      console.log('🎉 Badge controllati e sbloccati')

      // Crea notifica per l'utente
      await NotificationService.createUserNotification({
        userId: data.user_id,
        challengeId: data.challenge_id,
        type: 'CHALLENGE_APPROVED',
        title: '🎉 Challenge Approvata!',
        message: 'La tua verifica è stata approvata! Hai guadagnato un badge e puoi riscuotere la ricompensa.',
        isRead: false
      })

      console.log('✅ Verifica approvata completamente')
      return true
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
      console.log('❌ Rifiuto verifica:', verificationId, 'da admin:', adminId, 'Motivo:', reason)

      // Aggiorna lo stato della verifica
      const { data, error } = await supabase
        .from('challenge_verifications')
        .update({
          status: 'REJECTED',
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminId,
          rejection_reason: reason
        })
        .eq('id', verificationId)
        .select()
        .single()

      if (error) {
        console.error('❌ Errore nel rifiuto verifica:', error)
        return false
      }

      console.log('❌ Verifica rifiutata:', data.id)

      // Aggiorna lo stato della challenge a REJECTED
      const { ChallengeService } = await import('./challenges')
      await ChallengeService.updateChallengeStatus(data.user_id, data.challenge_id, 'REJECTED')
      console.log('🔄 Stato challenge aggiornato a REJECTED')

      // Crea notifica per l'utente
      await NotificationService.createUserNotification({
        userId: data.user_id,
        challengeId: data.challenge_id,
        type: 'CHALLENGE_REJECTED',
        title: '❌ Challenge Rifiutata',
        message: `La tua verifica è stata rifiutata. Motivo: ${reason}. Puoi riprovare caricando una nuova foto.`,
        isRead: false
      })

      console.log('✅ Verifica rifiutata completamente')
      return true
    } catch (error) {
      console.error('❌ Errore nel rifiuto:', error)
      return false
    }
  }

  // Crea notifica admin per una verifica
  private static async createAdminNotification(verification: ChallengeVerification): Promise<void> {
    try {
      console.log('🔔 Creazione notifica admin per verifica:', verification.id)

      const notification: Omit<AdminNotification, 'id' | 'createdAt'> = {
        type: 'CHALLENGE_VERIFICATION',
        userId: verification.userId,
        challengeId: verification.challengeId,
        verificationId: verification.id,
        title: 'Nuova verifica challenge',
        message: `L'utente ${verification.userId.slice(0, 8)} ha inviato una foto per verificare il completamento della challenge.`,
        photoUrl: verification.photoUrl,
        isRead: false
      }

      console.log('📝 Notifica creata:', notification)

      // Salva la notifica in Supabase
      await NotificationService.createAdminNotification(notification)

      console.log('✅ Notifica admin creata con successo:', verification.id)
    } catch (error) {
      console.error('❌ Errore nella creazione della notifica:', error)
    }
  }

  // Ottieni le notifiche admin
  static async getAdminNotifications(): Promise<AdminNotification[]> {
    return await NotificationService.getAdminNotifications()
  }

  // Rimuovi una notifica admin
  static async removeNotification(notificationId: string): Promise<boolean> {
    return await NotificationService.removeAdminNotification(notificationId)
  }
}
