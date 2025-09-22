'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  ExternalLink, 
  Globe,
  Check, 
  X, 
  Pencil,
  Save,
  Calendar,
  CreditCard,
  AlertTriangle,
  Trash2
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { isSubscriptionActive, getSubscriptionBlockReason, getTrialInfo } from '@/lib/subscription'
import { STRIPE_PRICING } from '@/lib/constants'

export default function AccountPage() {
  const { user, refreshUser } = useAuth()
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState('')
  const [showUpgradeSelector, setShowUpgradeSelector] = useState(false)
  const [upgradePlan, setUpgradePlan] = useState<'PLUS' | 'PRO' | ''>('')
  const [upgradeInterval, setUpgradeInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)
  const [canceling, setCanceling] = useState(false)

  // Dati dell'host (potrebbero venire da un database)
  const [hostProfile, setHostProfile] = useState({
    nome: 'Matteo Venneri',
    telefono: '+39 339 123 4567',
    email: 'matteovenneri84@gmail.com',
    numeroStrutture: 3,
    nomeStrutture: ['San Vito Suites', 'Roma Central B&B', 'Termini Guest House'],
    tipoStruttura: 'B&B e Guest House',
    linkBooking: 'https://booking.com/hotel/it/san-vito-suites',
    linkAirbnb: 'https://airbnb.com/rooms/san-vito-suites',
    indirizzo: 'Via San Vito, 123 - Roma',
    annoInizio: '2019',
    lingue: ['Italiano', 'Inglese', 'Spagnolo'],
    bio: 'Host esperto con passione per l\'ospitalità. Gestisco strutture nel centro di Roma da oltre 5 anni.',
    partitaIva: 'IT01234567890'
  })

  const formatEuro = (cents: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(cents / 100)
  
  const trialInfo = getTrialInfo(user)
  
  const billingInfo = {
    startDate: new Date((user as any)?.currentPeriodStart || Date.now()),
    endDate: new Date((user as any)?.currentPeriodEnd || Date.now()),
    status: (user as any)?.subscriptionStatus || 'ACTIVE'
  }

  const handleEdit = (field: string, currentValue: any) => {
    setEditingField(field)
    setTempValue(Array.isArray(currentValue) ? currentValue.join(', ') : currentValue.toString())
  }

  const handleSave = (field: string) => {
    let newValue: any = tempValue
    
    if (['lingue', 'nomeStrutture'].includes(field)) {
      newValue = tempValue.split(',').map(item => item.trim()).filter(item => item.length > 0)
    }
    
    setHostProfile(prev => ({ ...prev, [field]: newValue }))
    setEditingField(null)
    setTempValue('')
    
    console.log(`Salvato ${field}:`, newValue)
  }

  const handleCancel = () => {
    setEditingField(null)
    setTempValue('')
  }

  const handleCancelSubscription = async () => {
    if (!user?.subscriptionId && !trialInfo.isTrial) {
      alert('Nessun abbonamento o trial attivo da cancellare')
      return
    }

    setCanceling(true)
    try {
      // Se è un trial, cancelliamo direttamente senza chiamare Stripe
      if (trialInfo.isTrial && !user?.subscriptionId) {
        // Per i trial, potremmo semplicemente aggiornare lo stato dell'utente
        // o chiamare un'API specifica per i trial
        alert('✅ Trial cancellato con successo! I servizi sono stati disattivati immediatamente.')
        if (refreshUser) {
          await refreshUser()
        }
        setShowCancelConfirmation(false)
        return
      }

      // Per gli abbonamenti attivi, usiamo l'API Stripe
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: user.subscriptionId,
          userId: user.id
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Abbonamento cancellato con successo! I servizi sono stati disattivati immediatamente.')
        // Ricarica i dati dell'utente per aggiornare lo stato
        if (refreshUser) {
          await refreshUser()
        }
        setShowCancelConfirmation(false)
      } else {
        alert(`❌ Errore durante la cancellazione: ${data.error}`)
      }
    } catch (error) {
      console.error('Errore cancellazione abbonamento:', error)
      alert('❌ Errore durante la cancellazione dell\'abbonamento')
    } finally {
      setCanceling(false)
    }
  }

  const EditableField = ({ field, value, icon, multiline = false, placeholder }: {
    field: string
    value: any
    icon: React.ReactNode
    multiline?: boolean
    placeholder?: string
  }) => {
    const isEditing = editingField === field
    const displayValue = Array.isArray(value) ? value.join(', ') : value.toString()

    if (isEditing) {
      return (
        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border-2 border-blue-300">
          {icon}
          <div className="flex-1">
            {multiline ? (
              <textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full text-sm bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder={placeholder}
              />
            ) : (
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full text-sm bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={placeholder}
              />
            )}
          </div>
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSave(field)}
              className="w-8 h-8 p-0 border-green-300 text-green-600 hover:bg-green-50"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="w-8 h-8 p-0 border-red-300 text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div 
        className="flex items-center space-x-3 p-3 bg-white/70 rounded-lg hover:bg-white/90 transition-all cursor-pointer group"
        onClick={() => handleEdit(field, value)}
      >
        {icon}
        <span className="text-sm text-gray-700 flex-1">{displayValue}</span>
        <Pencil className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account</h1>
        <p className="text-gray-600 mt-1">Gestisci il tuo profilo e le impostazioni</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profilo Personale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informazioni Personali */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-500" />
                Informazioni Personali
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <EditableField
                field="nome"
                value={hostProfile.nome}
                icon={<User className="w-4 h-4 text-blue-600" />}
                placeholder="Nome completo"
              />
              <EditableField
                field="telefono"
                value={hostProfile.telefono}
                icon={<Phone className="w-4 h-4 text-green-600" />}
                placeholder="+39 123 456 7890"
              />
              <EditableField
                field="email"
                value={hostProfile.email}
                icon={<Mail className="w-4 h-4 text-purple-600" />}
                placeholder="email@example.com"
              />
              <EditableField
                field="indirizzo"
                value={hostProfile.indirizzo}
                icon={<MapPin className="w-4 h-4 text-red-600" />}
                placeholder="Via Example, 123 - Città"
              />
              <EditableField
                field="annoInizio"
                value={hostProfile.annoInizio}
                icon={<Calendar className="w-4 h-4 text-orange-600" />}
                placeholder="2019"
              />
            </CardContent>
          </Card>

          {/* Strutture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2 text-purple-500" />
                Strutture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <EditableField
                field="nomeStrutture"
                value={hostProfile.nomeStrutture}
                icon={<Building className="w-4 h-4 text-purple-600" />}
                placeholder="Nome Struttura 1, Nome Struttura 2..."
              />
              <EditableField
                field="tipoStruttura"
                value={hostProfile.tipoStruttura}
                icon={<Building className="w-4 h-4 text-purple-600" />}
                placeholder="B&B, Hotel, Casa Vacanze..."
              />
            </CardContent>
          </Card>

          {/* Link Esterni */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ExternalLink className="w-5 h-5 mr-2 text-orange-500" />
                Link Esterni
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Booking.com</span>
                  {hostProfile.linkBooking && (
                    <a
                      href={hostProfile.linkBooking}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-xs"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <EditableField
                  field="linkBooking"
                  value={hostProfile.linkBooking}
                  icon={<ExternalLink className="w-4 h-4 text-blue-600" />}
                  placeholder="https://booking.com/hotel/it/tua-struttura"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Airbnb</span>
                  {hostProfile.linkAirbnb && (
                    <a
                      href={hostProfile.linkAirbnb}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-700 text-xs"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <EditableField
                  field="linkAirbnb"
                  value={hostProfile.linkAirbnb}
                  icon={<ExternalLink className="w-4 h-4 text-pink-600" />}
                  placeholder="https://airbnb.com/rooms/tua-struttura"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lingue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2 text-indigo-500" />
                Lingue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EditableField
                field="lingue"
                value={hostProfile.lingue}
                icon={<Globe className="w-4 h-4 text-indigo-600" />}
                placeholder="Italiano, Inglese, Spagnolo..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Abbonamento */}
        <div className="space-y-6">
          {/* Abbonamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-green-500" />
                Abbonamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Piano attuale</div>
                <div className="text-2xl font-bold text-gray-900">
                  {user?.plan || 'BASE'}
                </div>
              </div>

              {/* Trial Status */}
              {trialInfo.isTrial && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2">
                    <div className="text-lg">🎉</div>
                    <div className="flex-1">
                      <div className="text-xs text-blue-600 font-medium">Prova Gratuita</div>
                      <div className="text-sm text-blue-800">
                        {trialInfo.daysRemaining} giorni rimanenti
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subscription Status */}
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="text-xs text-gray-600 font-medium mb-1">Stato</div>
                <div className="text-sm text-gray-900 font-medium">
                  {billingInfo.status?.toString().toUpperCase() || 'ACTIVE'}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => setShowUpgradeSelector(!showUpgradeSelector)}
                  disabled={!user?.plan || user.plan === 'PRO'}
                  className="w-full"
                >
                  {user?.plan === 'PRO' ? 'Piano massimo' : 'Fai Upgrade'}
                </Button>
                
                {/* Tasto per disdire l'abbonamento */}
                {(user?.subscriptionId || trialInfo.isTrial) && (
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelConfirmation(true)}
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {trialInfo.isTrial ? 'Disdici Trial' : 'Disdici Abbonamento'}
                  </Button>
                )}
                
                {showUpgradeSelector && (
                  <div className="p-4 border rounded-lg bg-white">
                    <div className="text-sm font-semibold mb-2">Scegli il piano</div>
                    <div className="space-y-2 mb-3">
                      {(user?.plan === 'BASE' ? ['PLUS', 'PRO'] : user?.plan === 'PLUS' ? ['PRO'] : [])
                        .map((p) => (
                          <button
                            key={p}
                            onClick={() => setUpgradePlan(p as 'PLUS' | 'PRO')}
                            className={`w-full p-2 rounded-lg border text-left ${
                              upgradePlan === p ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                            }`}
                          >
                            <div className="text-sm font-semibold">{p === 'PLUS' ? 'Avanzato' : 'Pro'}</div>
                            <div className="text-xs text-gray-600">
                              {formatEuro(STRIPE_PRICING[p as 'PLUS' | 'PRO'][upgradeInterval])}
                            </div>
                          </button>
                        ))}
                    </div>
                    
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => setUpgradeInterval('monthly')}
                        className={`px-3 py-1 rounded-full text-sm ${
                          upgradeInterval === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                        }`}
                      >
                        Mensile
                      </button>
                      <button
                        onClick={() => setUpgradeInterval('yearly')}
                        className={`px-3 py-1 rounded-full text-sm ${
                          upgradeInterval === 'yearly' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                        }`}
                      >
                        Annuale
                      </button>
                    </div>
                    
                    <Button
                      onClick={async () => {
                        if (!upgradePlan) return
                        const resp = await fetch('/api/stripe/checkout', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ plan: upgradePlan, interval: upgradeInterval }),
                        })
                        const data = await resp.json()
                        if (resp.ok && data.url) {
                          window.location.href = data.url
                        }
                      }}
                      className="w-full"
                    >
                      Procedi
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statistiche */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-purple-500" />
                Statistiche
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Host dal</span>
                <span className="text-sm font-medium">{hostProfile.annoInizio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Strutture</span>
                <span className="text-sm font-medium">{hostProfile.numeroStrutture}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Lingue</span>
                <span className="text-sm font-medium">{hostProfile.lingue.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal di conferma cancellazione abbonamento */}
      {showCancelConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Conferma Cancellazione</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                {trialInfo.isTrial 
                  ? 'Sei sicuro di voler disdire il tuo trial?' 
                  : 'Sei sicuro di voler disdire il tuo abbonamento?'
                }
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800 font-medium mb-2">⚠️ Attenzione:</p>
                <ul className="text-sm text-red-700 space-y-1">
                  {trialInfo.isTrial ? (
                    <>
                      <li>• Il trial verrà cancellato <strong>immediatamente</strong></li>
                      <li>• I servizi premium saranno <strong>disattivati subito</strong></li>
                      <li>• Non potrai più utilizzare le funzionalità premium</li>
                      <li>• Potrai riattivare un nuovo trial o abbonamento in qualsiasi momento</li>
                    </>
                  ) : (
                    <>
                      <li>• L'abbonamento verrà cancellato <strong>immediatamente</strong></li>
                      <li>• I servizi premium saranno <strong>disattivati subito</strong></li>
                      <li>• Non riceverai rimborsi per il periodo rimanente</li>
                      <li>• Potrai riattivare l'abbonamento in qualsiasi momento</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirmation(false)}
                className="flex-1"
                disabled={canceling}
              >
                Annulla
              </Button>
              <Button
                onClick={handleCancelSubscription}
                disabled={canceling}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {canceling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cancellando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {trialInfo.isTrial ? 'Conferma Cancellazione Trial' : 'Conferma Cancellazione'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
