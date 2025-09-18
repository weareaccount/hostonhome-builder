'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock,
  User,
  Calendar,
  Camera,
  AlertCircle
} from 'lucide-react'
import { VerificationService } from '@/lib/verification'
import type { AdminNotification } from '@/types'

export default function AdminVerificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNotification, setSelectedNotification] = useState<AdminNotification | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    // Carica notifiche iniziali
    loadNotifications()

    // Sincronizza con storage globale all'avvio
    syncWithGlobalStorage()

    // Polling per aggiornare le notifiche ogni 3 secondi
    const interval = setInterval(() => {
      loadNotifications()
      syncWithGlobalStorage()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const syncWithGlobalStorage = async () => {
    try {
      console.log('🔄 Sincronizzazione automatica...')
      
      // Usa il nuovo metodo di sincronizzazione forzata
      await VerificationService.forceSyncNotifications()
      
      // Ricarica le notifiche per aggiornare l'interfaccia
      await loadNotifications()
      
      console.log('✅ Sincronizzazione automatica completata')
    } catch (error) {
      console.error('❌ Errore nella sincronizzazione automatica:', error)
    }
  }

  const loadNotifications = async () => {
    try {
      setLoading(true)
      console.log('🔄 Caricamento notifiche admin...')
      
      // Prova prima il metodo globale
      let data = await VerificationService.getGlobalNotificationsOnly()
      console.log('📋 Notifiche dal server simulato:', data)
      
      // Se non ci sono notifiche globali, prova il metodo combinato
      if (data.length === 0) {
        console.log('🔄 Nessuna notifica globale, provo metodo combinato...')
        data = await VerificationService.getAdminNotifications()
        console.log('📋 Notifiche combinate:', data)
      }
      
      setNotifications(data)
      console.log('✅ Notifiche caricate:', data.length)
    } catch (error) {
      console.error('❌ Errore nel caricamento delle notifiche:', error)
    } finally {
      setLoading(false)
    }
  }

  const forceLoadGlobalNotifications = async () => {
    try {
      setLoading(true)
      console.log('🔄 Forzando caricamento notifiche globali...')
      
      const data = await VerificationService.getGlobalNotificationsOnly()
      console.log('📋 Notifiche globali forzate:', data)
      
      setNotifications(data)
      
      if (data.length > 0) {
        alert(`✅ Trovate ${data.length} notifiche globali!`)
      } else {
        alert('❌ Nessuna notifica globale trovata')
      }
    } catch (error) {
      console.error('❌ Errore nel caricamento forzato:', error)
      alert('❌ Errore nel caricamento delle notifiche')
    } finally {
      setLoading(false)
    }
  }

  const showAllNotifications = async () => {
    try {
      setLoading(true)
      console.log('🔄 Mostrando tutte le notifiche senza deduplicazione...')
      
      const allData = await VerificationService.getAdminNotifications()
      console.log('📋 Tutte le notifiche:', allData)
      
      setNotifications(allData)
      
      alert(`📋 Mostrate ${allData.length} notifiche totali (con deduplicazione)`)
    } catch (error) {
      console.error('❌ Errore nel caricamento completo:', error)
      alert('❌ Errore nel caricamento delle notifiche')
    } finally {
      setLoading(false)
    }
  }

  const debugNotifications = async () => {
    console.log('🔍 DEBUG: Controllo completo sistema notifiche...')
    
    // Contatore globale
    const globalCount = VerificationService.getGlobalNotificationCount()
    console.log('📊 Contatore globale notifiche:', globalCount)
    
    // localStorage locale
    const localData = localStorage.getItem('admin_notifications')
    console.log('📦 localStorage locale:', localData)
    
    // sessionStorage condiviso
    const sharedData = sessionStorage.getItem('shared_admin_notifications')
    console.log('📦 sessionStorage condiviso:', sharedData)
    
    // storage globale simulato
    const globalData = localStorage.getItem('global_admin_notifications')
    console.log('📦 storage globale:', globalData)
    
    // Parsing e visualizzazione
    if (localData) {
      try {
        const parsed = JSON.parse(localData)
        console.log('📋 Notifiche localStorage:', parsed)
      } catch (e) {
        console.error('❌ Errore parsing localStorage:', e)
      }
    }
    
    if (sharedData) {
      try {
        const parsed = JSON.parse(sharedData)
        console.log('📋 Notifiche sessionStorage:', parsed)
      } catch (e) {
        console.error('❌ Errore parsing sessionStorage:', e)
      }
    }
    
    if (globalData) {
      try {
        const parsed = JSON.parse(globalData)
        console.log('📋 Notifiche storage globale:', parsed)
      } catch (e) {
        console.error('❌ Errore parsing storage globale:', e)
      }
    }
    
    // Mostra anche le notifiche combinate
    const combined = await VerificationService.getAdminNotifications()
    console.log('🔔 Notifiche combinate finali:', combined)
    
    // Conta le notifiche in ogni storage
    let localCount = 0
    let sharedCount = 0
    let globalCount = 0
    
    if (localData) {
      try {
        localCount = JSON.parse(localData).length
      } catch (e) {
        console.error('❌ Errore parsing locale:', e)
      }
    }
    
    if (sharedData) {
      try {
        sharedCount = JSON.parse(sharedData).length
      } catch (e) {
        console.error('❌ Errore parsing condiviso:', e)
      }
    }
    
    if (globalData) {
      try {
        globalCount = JSON.parse(globalData).length
      } catch (e) {
        console.error('❌ Errore parsing globale:', e)
      }
    }
    
    // Forza sincronizzazione
    await VerificationService.forceSyncNotifications()
    console.log('🔄 Sincronizzazione forzata completata')
    
    // Mostra alert con i conteggi
    alert(`🔍 DEBUG NOTIFICHE:
    
📊 Contatore globale: ${globalCount}
📦 Storage locale: ${localCount} notifiche
📦 Storage condiviso: ${sharedCount} notifiche  
📦 Storage globale: ${globalCount} notifiche
📊 Totale: ${localCount + sharedCount + globalCount} notifiche

✅ Notifiche combinate: ${combined.length}`)
  }

  const clearAllNotifications = () => {
    VerificationService.clearAllNotifications()
    loadNotifications()
    alert('🧹 Tutte le notifiche sono state pulite!')
  }

  const testGlobalNotifications = async () => {
    console.log('🧪 Test notifiche globali...')
    const globalNotifications = await VerificationService.getGlobalNotificationsOnly()
    console.log('📋 Notifiche globali trovate:', globalNotifications)
    
    if (globalNotifications.length > 0) {
      setNotifications(globalNotifications)
      alert(`✅ Trovate ${globalNotifications.length} notifiche globali!`)
    } else {
      alert('❌ Nessuna notifica globale trovata')
    }
  }

  const createTestNotification = async () => {
    await VerificationService.createTestNotification()
    await loadNotifications()
    alert('🧪 Notifica di test creata! Controlla se appare nella lista.')
  }

  const handleApprove = async (notification: AdminNotification) => {
    setProcessing(notification.id)
    try {
      console.log('✅ Approvazione verifica:', notification.verificationId)
      
      const success = await VerificationService.approveVerification(
        notification.verificationId,
        'admin-user-id' // In produzione userai l'ID dell'admin loggato
      )
      
      if (success) {
        alert('✅ Verifica approvata con successo!\n\nL\'utente è stato notificato e può riscuotere la ricompensa.')
        await loadNotifications()
        setShowModal(false)
        setSelectedNotification(null)
        console.log('✅ Verifica approvata e notifiche ricaricate')
      } else {
        alert('❌ Errore nell\'approvazione della verifica')
        console.log('❌ Errore nell\'approvazione')
      }
    } catch (error) {
      console.error('❌ Errore nell\'approvazione:', error)
      alert('❌ Errore nell\'approvazione della verifica')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (notification: AdminNotification, reason: string) => {
    setProcessing(notification.id)
    try {
      console.log('❌ Rifiuto verifica:', notification.verificationId, 'Motivo:', reason)
      
      const success = await VerificationService.rejectVerification(
        notification.verificationId,
        'admin-user-id',
        reason
      )
      
      if (success) {
        alert('❌ Verifica rifiutata.\n\nL\'utente è stato notificato e può riprovare caricando una nuova foto.')
        await loadNotifications()
        setShowModal(false)
        setSelectedNotification(null)
        console.log('✅ Verifica rifiutata e notifiche ricaricate')
      } else {
        alert('❌ Errore nel rifiuto della verifica')
        console.log('❌ Errore nel rifiuto')
      }
    } catch (error) {
      console.error('❌ Errore nel rifiuto:', error)
      alert('❌ Errore nel rifiuto della verifica')
    } finally {
      setProcessing(null)
    }
  }

  const handleViewNotification = async (notification: AdminNotification) => {
    setSelectedNotification(notification)
    setShowModal(true)
    
    // Marca come letta
    await VerificationService.markNotificationAsRead(notification.id)
    await loadNotifications()
  }

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    pending: notifications.length
  }

  return (
    <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-600">Totale Notifiche</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.unread}</div>
                  <div className="text-sm text-gray-600">Non Lette</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
                  <div className="text-sm text-gray-600">In Attesa</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-blue-600" />
                <span>Notifiche Verifiche</span>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={debugNotifications}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  🔍 Debug
                </Button>
                <Button 
                  onClick={forceLoadGlobalNotifications}
                  variant="outline"
                  size="sm"
                  className="text-xs text-purple-600 hover:text-purple-700"
                >
                  🔄 Forza Caricamento
                </Button>
                <Button 
                  onClick={showAllNotifications}
                  variant="outline"
                  size="sm"
                  className="text-xs text-orange-600 hover:text-orange-700"
                >
                  📋 Mostra Tutte
                </Button>
                <Button 
                  onClick={testGlobalNotifications}
                  variant="outline"
                  size="sm"
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  🧪 Test Globale
                </Button>
                <Button 
                  onClick={createTestNotification}
                  variant="outline"
                  size="sm"
                  className="text-xs text-green-600 hover:text-green-700"
                >
                  ➕ Test Notifica
                </Button>
                <Button 
                  onClick={clearAllNotifications}
                  variant="outline"
                  size="sm"
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  🧹 Pulisci
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Caricamento notifiche...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna notifica</h3>
                <p className="text-gray-600 mb-4">Non ci sono verifiche in attesa di approvazione.</p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Prova a:</p>
                  <div className="flex justify-center space-x-2">
                    <Button 
                      onClick={forceLoadGlobalNotifications}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      🔄 Forza Caricamento
                    </Button>
                    <Button 
                      onClick={createTestNotification}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      ➕ Crea Test
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                      notification.isRead 
                        ? 'bg-white border-gray-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                            {notification.photoUrl ? (
                              <img
                                src={notification.photoUrl}
                                alt="Verifica foto"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200"><svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <User className="w-3 h-3" />
                                <span>User ID: {notification.userId}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(notification.createdAt).toLocaleDateString('it-IT')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewNotification(notification)}
                            className="flex items-center space-x-2"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Verifica</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      {/* Verification Modal */}
      <AnimatePresence>
        {showModal && selectedNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Camera className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Verifica Challenge</h3>
                    <p className="text-sm text-gray-600">Esamina la foto e approva o rifiuta</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 p-0"
                >
                  ×
                </Button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
              {/* Photo */}
              <div className="text-center">
                {selectedNotification.photoUrl ? (
                  <img
                    src={selectedNotification.photoUrl}
                    alt="Verifica foto"
                    className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = '<div class="w-full max-w-md mx-auto rounded-lg shadow-lg bg-gray-200 h-64 flex items-center justify-center"><div class="text-center"><svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><p class="text-gray-500">Immagine non disponibile</p></div></div>';
                    }}
                  />
                ) : (
                  <div className="w-full max-w-sm mx-auto rounded-lg shadow-lg bg-gray-200 h-48 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <p className="text-gray-500">Immagine non disponibile</p>
                    </div>
                  </div>
                )}
              </div>

                {/* Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Informazioni Verifica</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Utente:</span>
                      <span className="font-medium">{selectedNotification.userId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Challenge:</span>
                      <span className="font-medium">{selectedNotification.challengeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data invio:</span>
                      <span className="font-medium">
                        {new Date(selectedNotification.createdAt).toLocaleString('it-IT')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600 mb-3 text-center">Scegli un'azione:</p>
                  <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="flex-1"
                    disabled={processing === selectedNotification.id}
                  >
                    Annulla
                  </Button>
                  <Button
                    onClick={() => handleReject(selectedNotification, 'Foto non conforme ai requisiti')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    disabled={processing === selectedNotification.id}
                  >
                    {processing === selectedNotification.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Elaborazione...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Rifiuta
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedNotification)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    disabled={processing === selectedNotification.id}
                  >
                    {processing === selectedNotification.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Elaborazione...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approva
                      </>
                    )}
                  </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
