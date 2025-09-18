import { supabase } from './supabase'
import type { AdminNotification, UserNotification } from '@/types'

export class NotificationService {
  // Ottieni tutte le notifiche admin
  static async getAdminNotifications(): Promise<AdminNotification[]> {
    try {
      console.log('🔍 Recupero notifiche admin da Supabase...')
      
      // Controlla se Supabase è configurato
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('⚠️ Supabase non configurato, ritorno array vuoto')
        return []
      }
      
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Errore nel recupero notifiche admin:', error)
        return []
      }

      console.log('✅ Notifiche admin recuperate:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ Errore nel recupero notifiche admin:', error)
      return []
    }
  }

  // Ottieni le notifiche di un utente
  static async getUserNotifications(userId: string): Promise<UserNotification[]> {
    try {
      console.log('🔍 Recupero notifiche utente da Supabase:', userId)
      
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Errore nel recupero notifiche utente:', error)
        return []
      }

      console.log('✅ Notifiche utente recuperate:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ Errore nel recupero notifiche utente:', error)
      return []
    }
  }

  // Crea una notifica admin
  static async createAdminNotification(notification: Omit<AdminNotification, 'id' | 'createdAt'>): Promise<AdminNotification | null> {
    try {
      console.log('🔔 Creazione notifica admin in Supabase...')
      
      // Controlla se Supabase è configurato
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('⚠️ Supabase non configurato, simulazione notifica admin')
        return {
          id: `mock-admin-${Date.now()}`,
          ...notification,
          createdAt: new Date()
        }
      }
      
      const { data, error } = await supabase
        .from('admin_notifications')
        .insert([notification])
        .select()
        .single()

      if (error) {
        console.error('❌ Errore nella creazione notifica admin:', error)
        return null
      }

      console.log('✅ Notifica admin creata:', data.id)
      return data
    } catch (error) {
      console.error('❌ Errore nella creazione notifica admin:', error)
      return null
    }
  }

  // Crea una notifica utente
  static async createUserNotification(notification: Omit<UserNotification, 'id' | 'createdAt'>): Promise<UserNotification | null> {
    try {
      console.log('🔔 Creazione notifica utente in Supabase...')
      
      const { data, error } = await supabase
        .from('user_notifications')
        .insert([notification])
        .select()
        .single()

      if (error) {
        console.error('❌ Errore nella creazione notifica utente:', error)
        return null
      }

      console.log('✅ Notifica utente creata:', data.id)
      return data
    } catch (error) {
      console.error('❌ Errore nella creazione notifica utente:', error)
      return null
    }
  }

  // Marca una notifica admin come letta
  static async markAdminNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      console.log('📖 Marcatura notifica admin come letta:', notificationId)
      
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) {
        console.error('❌ Errore nella marcatura notifica admin:', error)
        return false
      }

      console.log('✅ Notifica admin marcata come letta')
      return true
    } catch (error) {
      console.error('❌ Errore nella marcatura notifica admin:', error)
      return false
    }
  }

  // Marca una notifica utente come letta
  static async markUserNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      console.log('📖 Marcatura notifica utente come letta:', notificationId)
      
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) {
        console.error('❌ Errore nella marcatura notifica utente:', error)
        return false
      }

      console.log('✅ Notifica utente marcata come letta')
      return true
    } catch (error) {
      console.error('❌ Errore nella marcatura notifica utente:', error)
      return false
    }
  }

  // Rimuovi una notifica admin
  static async removeAdminNotification(notificationId: string): Promise<boolean> {
    try {
      console.log('🗑️ Rimozione notifica admin:', notificationId)
      
      const { error } = await supabase
        .from('admin_notifications')
        .delete()
        .eq('id', notificationId)

      if (error) {
        console.error('❌ Errore nella rimozione notifica admin:', error)
        return false
      }

      console.log('✅ Notifica admin rimossa')
      return true
    } catch (error) {
      console.error('❌ Errore nella rimozione notifica admin:', error)
      return false
    }
  }

  // Rimuovi una notifica utente
  static async removeUserNotification(notificationId: string): Promise<boolean> {
    try {
      console.log('🗑️ Rimozione notifica utente:', notificationId)
      
      const { error } = await supabase
        .from('user_notifications')
        .delete()
        .eq('id', notificationId)

      if (error) {
        console.error('❌ Errore nella rimozione notifica utente:', error)
        return false
      }

      console.log('✅ Notifica utente rimossa')
      return true
    } catch (error) {
      console.error('❌ Errore nella rimozione notifica utente:', error)
      return false
    }
  }

  // Ottieni il conteggio delle notifiche non lette per admin
  static async getAdminUnreadCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('admin_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)

      if (error) {
        console.error('❌ Errore nel conteggio notifiche admin:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('❌ Errore nel conteggio notifiche admin:', error)
      return 0
    }
  }

  // Ottieni il conteggio delle notifiche non lette per utente
  static async getUserUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        console.error('❌ Errore nel conteggio notifiche utente:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('❌ Errore nel conteggio notifiche utente:', error)
      return 0
    }
  }
}
