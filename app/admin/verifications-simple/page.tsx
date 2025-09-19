'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, User, Camera } from 'lucide-react'

interface Verification {
  id: string
  user_id: string
  challenge_id: string
  photo_url: string
  photo_description: string
  status: string
  created_at: string
  admin_notifications: {
    id: string
    title: string
    message: string
    photo_url: string
    is_read: boolean
    created_at: string
  }[]
}

export default function AdminVerificationsSimple() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  const loadVerifications = async () => {
    try {
      console.log('🔍 Caricamento verifiche...')
      setLoading(true)
      
      const response = await fetch('/api/admin-verifications')
      const data = await response.json()
      
      if (data.success) {
        console.log('✅ Verifiche caricate:', data.count)
        console.log('📋 Dati verifiche:', data.verifications)
        setVerifications(data.verifications)
      } else {
        console.error('❌ Errore:', data.error)
        alert('Errore nel caricamento delle verifiche')
      }
    } catch (error) {
      console.error('❌ Errore caricamento:', error)
      alert('Errore nel caricamento delle verifiche')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (verificationId: string, action: 'approve' | 'reject') => {
    try {
      setProcessing(verificationId)
      console.log(`🔧 ${action} verifica:`, verificationId)
      
      const response = await fetch('/api/admin-verifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action,
          verificationId: verificationId,
          adminId: 'admin-matteo-venneri' // ID admin fisso per ora
        })
      })

      const result = await response.json()
      
      if (result.success) {
        const actionText = action === 'approve' ? 'approvata' : 'rifiutata'
        alert(`✅ Verifica ${actionText} con successo!`)
        await loadVerifications() // Ricarica la lista
      } else {
        alert(`❌ Errore nell'${action}: ${result.error}`)
      }
    } catch (error) {
      console.error(`❌ Errore ${action}:`, error)
      alert(`❌ Errore nell'${action} della verifica`)
    } finally {
      setProcessing(null)
    }
  }

  useEffect(() => {
    loadVerifications()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Caricamento verifiche...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verifiche Challenge</h1>
          <p className="text-gray-600">Gestisci le verifiche inviate dagli utenti</p>
          <button
            onClick={loadVerifications}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Ricarica
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">In Attesa</p>
                <p className="text-2xl font-bold text-gray-900">{verifications.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Approvate</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Rifiutate</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Verifiche List */}
        {verifications.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <div className="text-gray-400 mb-4">
              <Camera className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna verifica in attesa</h3>
            <p className="text-gray-600">Non ci sono verifiche da esaminare al momento.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {verifications.map((verification) => (
              <div key={verification.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-start space-x-6">
                  {/* Foto */}
                  <div className="flex-shrink-0">
                    <div className="h-32 w-32 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {verification.photo_url ? (
                        <img
                          src={verification.photo_url}
                          alt="Verifica"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <div className={`${verification.photo_url ? 'hidden' : ''} text-center text-gray-500`}>
                        <Camera className="h-8 w-8 mx-auto mb-2" />
                        <span className="text-xs">Foto non disponibile</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Utente: {verification.user_id.slice(0, 8)}...
                      </span>
                      <span className="text-sm text-gray-600">
                        Challenge: {verification.challenge_id}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {verification.admin_notifications[0]?.title || 'Verifica Challenge'}
                    </h3>
                    
                    <p className="text-gray-600 mb-4">
                      {verification.admin_notifications[0]?.message || 'Verifica in attesa di approvazione'}
                    </p>
                    
                    {verification.photo_description && (
                      <p className="text-sm text-gray-500 mb-4">
                        <strong>Descrizione:</strong> {verification.photo_description}
                      </p>
                    )}
                    
                    <p className="text-sm text-gray-500">
                      Inviata il: {new Date(verification.created_at).toLocaleString('it-IT')}
                    </p>
                  </div>
                  
                  {/* Azioni */}
                  <div className="flex-shrink-0 flex space-x-3">
                    <button
                      onClick={() => handleAction(verification.id, 'approve')}
                      disabled={processing === verification.id}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Approva</span>
                    </button>
                    
                    <button
                      onClick={() => handleAction(verification.id, 'reject')}
                      disabled={processing === verification.id}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Rifiuta</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
