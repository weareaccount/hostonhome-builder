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
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const data = await VerificationService.getAdminNotifications()
      setNotifications(data)
    } catch (error) {
      console.error('Errore nel caricamento delle notifiche:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (notification: AdminNotification) => {
    setProcessing(notification.id)
    try {
      const success = await VerificationService.approveVerification(
        notification.verificationId,
        'admin-user-id' // In produzione userai l'ID dell'admin loggato
      )
      
      if (success) {
        await loadNotifications()
        setShowModal(false)
        setSelectedNotification(null)
      }
    } catch (error) {
      console.error('Errore nell\'approvazione:', error)
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (notification: AdminNotification, reason: string) => {
    setProcessing(notification.id)
    try {
      const success = await VerificationService.rejectVerification(
        notification.verificationId,
        'admin-user-id',
        reason
      )
      
      if (success) {
        await loadNotifications()
        setShowModal(false)
        setSelectedNotification(null)
      }
    } catch (error) {
      console.error('Errore nel rifiuto:', error)
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
            <CardTitle className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-blue-600" />
              <span>Notifiche Verifiche</span>
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
                <p className="text-gray-600">Non ci sono verifiche in attesa di approvazione.</p>
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
                            <img
                              src={notification.photoUrl}
                              alt="Verifica foto"
                              className="w-full h-full object-cover"
                            />
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
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
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
              <div className="p-6 space-y-6">
                {/* Photo */}
                <div className="text-center">
                  <img
                    src={selectedNotification.photoUrl}
                    alt="Verifica foto"
                    className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                  />
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
