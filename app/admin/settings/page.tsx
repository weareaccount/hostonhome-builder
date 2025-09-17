'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Settings, 
  Save, 
  RefreshCw,
  Shield,
  Bell,
  Globe,
  Database,
  Mail,
  Key,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Cloud
} from 'lucide-react'

interface SystemSettings {
  general: {
    siteName: string
    siteDescription: string
    maintenanceMode: boolean
    allowRegistrations: boolean
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    adminAlerts: boolean
    userAlerts: boolean
  }
  security: {
    twoFactorAuth: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    passwordMinLength: number
  }
  integrations: {
    stripeEnabled: boolean
    emailService: string
    analyticsEnabled: boolean
    backupEnabled: boolean
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'HostOnHome Builder',
      siteDescription: 'Piattaforma per creare siti web per host',
      maintenanceMode: false,
      allowRegistrations: true
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      adminAlerts: true,
      userAlerts: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8
    },
    integrations: {
      stripeEnabled: true,
      emailService: 'SendGrid',
      analyticsEnabled: true,
      backupEnabled: true
    }
  })
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      // In produzione, qui caricheresti le impostazioni dal database
      setLastSaved(new Date())
    } catch (error) {
      console.error('Errore nel caricamento delle impostazioni:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await new Promise(resolve => setTimeout(resolve, 2000))
      // In produzione, qui salveresti le impostazioni nel database
      setLastSaved(new Date())
      console.log('Impostazioni salvate:', settings)
    } catch (error) {
      console.error('Errore nel salvataggio:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Sei sicuro di voler ripristinare le impostazioni predefinite?')) {
      loadSettings()
    }
  }

  const systemStatus = {
    database: 'online',
    email: 'online',
    storage: 'online',
    analytics: 'online',
    lastBackup: new Date(Date.now() - 86400000),
    uptime: '99.9%'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Impostazioni Sistema</h1>
          <p className="text-gray-600">Configurazione e gestione del sistema HostOnHome Builder</p>
        </div>
        <div className="flex items-center space-x-3">
          {lastSaved && (
            <div className="text-sm text-gray-500">
              Ultimo salvataggio: {lastSaved.toLocaleTimeString('it-IT')}
            </div>
          )}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salva Impostazioni
              </>
            )}
          </Button>
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <Server className="w-5 h-5 text-green-600" />
            <span>Stato Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Servizi</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email Service</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Storage</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Analytics</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Statistiche</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Uptime</span>
                  <span className="text-sm font-medium">{systemStatus.uptime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ultimo Backup</span>
                  <span className="text-sm font-medium">
                    {systemStatus.lastBackup.toLocaleDateString('it-IT')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Versione</span>
                  <span className="text-sm font-medium">v2.1.0</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Azioni</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Cloud className="w-4 h-4 mr-2" />
                  Backup Manuale
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Riavvia Servizi
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Database className="w-4 h-4 mr-2" />
                  Ottimizza DB
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-blue-600" />
              <span>Impostazioni Generali</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Sito
              </label>
              <input
                type="text"
                value={settings.general.siteName}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  general: { ...prev.general, siteName: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrizione Sito
              </label>
              <textarea
                value={settings.general.siteDescription}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  general: { ...prev.general, siteDescription: e.target.value }
                }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Modalità Manutenzione</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.general.maintenanceMode}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, maintenanceMode: e.target.checked }
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Permetti Registrazioni</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.general.allowRegistrations}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, allowRegistrations: e.target.checked }
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-red-600" />
              <span>Sicurezza</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Autenticazione a Due Fattori</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.twoFactorAuth}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, twoFactorAuth: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeout Sessione (minuti)
              </label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tentativi Login Massimi
              </label>
              <input
                type="number"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, maxLoginAttempts: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lunghezza Minima Password
              </label>
              <input
                type="number"
                value={settings.security.passwordMinLength}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, passwordMinLength: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-yellow-600" />
              <span>Notifiche</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Notifiche Email</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, emailNotifications: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Notifiche Push</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.pushNotifications}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, pushNotifications: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Avvisi Admin</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.adminAlerts}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, adminAlerts: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Avvisi Utenti</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.userAlerts}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, userAlerts: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Integrations Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Key className="w-5 h-5 text-purple-600" />
              <span>Integrazioni</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Stripe Abilitato</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.integrations.stripeEnabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    integrations: { ...prev.integrations, stripeEnabled: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Servizio Email
              </label>
              <select
                value={settings.integrations.emailService}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  integrations: { ...prev.integrations, emailService: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="SendGrid">SendGrid</option>
                <option value="Mailgun">Mailgun</option>
                <option value="AWS SES">AWS SES</option>
                <option value="SMTP">SMTP</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Analytics Abilitato</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.integrations.analyticsEnabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    integrations: { ...prev.integrations, analyticsEnabled: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Backup Automatico</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.integrations.backupEnabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    integrations: { ...prev.integrations, backupEnabled: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span>Zona Pericolosa</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Ripristina Impostazioni Predefinite</h4>
              <p className="text-sm text-red-700 mb-3">
                Questa azione ripristinerà tutte le impostazioni ai valori predefiniti. 
                Questa azione non può essere annullata.
              </p>
              <Button
                variant="outline"
                onClick={handleReset}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Ripristina Impostazioni
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
