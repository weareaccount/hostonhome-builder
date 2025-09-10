'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { ProjectService } from '@/lib/projects'
import type { Project } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash, Eye, User, Phone, Building, MapPin, ExternalLink, Settings, Star, Calendar, Check, X, Pencil, Save, ChevronDown, ChevronRight, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PLAN_LIMITS, STRIPE_PRICING } from '@/lib/constants'
import { isSubscriptionActive, getSubscriptionBlockReason, getTrialInfo } from '@/lib/subscription'

export default function Dashboard() {
  const { user, loading, signOut, refreshUser } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [showHostProfile, setShowHostProfile] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState('')
  
  // State per editing nome progetto
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [tempProjectName, setTempProjectName] = useState('')
  
  const canCreateProject = useMemo(() => {
    if (!user) return false
    const plan = String((user as any)?.plan || '').toUpperCase()
    // Piano BASE: consenti sempre la creazione del primo sito
    if (plan === 'BASE') {
      return projects.length < 1
    }
    // Piano PLUS: fino a 2 siti (non richiede stato attivo per sviluppo)
    if (plan === 'PLUS') {
      return projects.length < 2
    }
    // Piano PRO: massimo 3 siti
    if (plan === 'PRO') {
      return projects.length < 3
    }
    // Altri piani (se presenti) richiedono abbonamento attivo
    return isSubscriptionActive(user)
  }, [user, projects])

  
  const [expandedSections, setExpandedSections] = useState({
    contacts: true,
    structures: false,
    booking: false,
    languages: false,
    billing: true,
  })
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showUpgradeSelector, setShowUpgradeSelector] = useState(false)
  const [upgradePlan, setUpgradePlan] = useState<'PLUS' | 'PRO' | ''>('')
  const [upgradeInterval, setUpgradeInterval] = useState<'monthly' | 'yearly'>('monthly')

  const formatEuro = (cents: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(cents / 100)
  
  // ✅ Informazioni sul trial
  const trialInfo = useMemo(() => getTrialInfo(user), [user])
  
  
  // ✅ Sincronizzazione automatica SEMPRE all'avvio della dashboard
  useEffect(() => {
    const autoSyncSubscription = async () => {
      if (!user) return
      
      // ✅ Controlla se abbiamo già sincronizzato in questa sessione
      const syncKey = `sync_${user.id}_${Date.now()}`
      const lastSync = sessionStorage.getItem('lastSync')
      const now = Date.now()
      
      // Se abbiamo sincronizzato negli ultimi 30 secondi, non sincronizzare di nuovo
      if (lastSync && (now - parseInt(lastSync)) < 30000) {
        console.log('⏭️ Sincronizzazione saltata (già fatta di recente)')
        return
      }
      
      console.log('🔄 Sincronizzazione automatica abbonamento...')
      try {
        const response = await fetch('/api/sync-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            customerId: (user as any).stripeCustomerId,
            userEmail: user.email
          })
        })
        
        const data = await response.json()
        if (data.success) {
          console.log('✅ Abbonamento sincronizzato automaticamente')
          // ✅ Salva il timestamp della sincronizzazione
          sessionStorage.setItem('lastSync', now.toString())
          // ✅ Ricarica i dati dell'utente invece di ricaricare la pagina
          await refreshUser()
        } else {
          console.log('⚠️ Sincronizzazione automatica fallita:', data.error)
        }
      } catch (error: any) {
        console.log('⚠️ Errore sincronizzazione automatica:', error.message)
      }
    }
    
    // ✅ Sincronizza SEMPRE dopo 1 secondo dall'avvio
    const timeout = setTimeout(autoSyncSubscription, 1000)
    return () => clearTimeout(timeout)
  }, [user])
  
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

  const handleEdit = (field: string, currentValue: any) => {
    setEditingField(field)
    setTempValue(Array.isArray(currentValue) ? currentValue.join(', ') : currentValue.toString())
  }

  const handleSave = (field: string) => {
    let newValue: any = tempValue
    
    // Gestisce array (lingue, nomeStrutture)
    if (['lingue', 'nomeStrutture'].includes(field)) {
      newValue = tempValue.split(',').map(item => item.trim()).filter(item => item.length > 0)
    }
    
    setHostProfile(prev => ({ ...prev, [field]: newValue }))
    setEditingField(null)
    setTempValue('')
    
    // Qui potresti salvare nel database
    console.log(`Salvato ${field}:`, newValue)
  }

  const handleCancel = () => {
    setEditingField(null)
    setTempValue('')
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Componente per sezione collassabile
  const CollapsibleSection = ({ 
    title, 
    icon, 
    isExpanded, 
    onToggle, 
    children, 
    className = "" 
  }: {
    title: string
    icon: React.ReactNode
    isExpanded: boolean
    onToggle: () => void
    children: React.ReactNode
    className?: string
  }) => (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {icon}
          <h4 className="font-semibold text-gray-900">{title}</h4>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400 transition-transform" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400 transition-transform" />
        )}
      </button>
      <div className={`transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div className="p-4 pt-0 space-y-3">
          {children}
        </div>
      </div>
    </div>
  )

  // Componente per campo editabile
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

  useEffect(() => {
    if (user) {
      // Carica prima i progetti locali per feedback immediato
      const localProjects = ProjectService.getLocalProjects()
        .filter(p => p.user_id === user.id)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      
      console.log('📁 Dashboard: progetti locali per utente', user.id, ':', localProjects.length)
      
      if (localProjects.length > 0) {
        setProjects(localProjects)
        setProjectsLoading(false)
        console.log('✅ Dashboard: progetti locali caricati:', localProjects.length)
      }
      
      // Poi carica i progetti da Supabase
      loadProjects()
    }
  }, [user])

  // Aggiorna i progetti quando la pagina viene caricata (per tornare dalla creazione)
  useEffect(() => {
    if (user && projects.length === 0) {
      loadProjects(true) // Force refresh per assicurarsi di avere i progetti più recenti
    }
  }, [user])

  // Aggiorna i progetti quando la pagina viene caricata (per tornare dal builder)
  useEffect(() => {
    if (user) {
      // Controlla se ci sono progetti locali più recenti
      const localProjects = ProjectService.getLocalProjects()
        .filter(p => p.user_id === user.id)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      
      if (localProjects.length > 0) {
        // Se ci sono progetti locali, aggiorna la lista
        setProjects(localProjects)
      }
    }
  }, [user])

  const loadProjects = async (forceRefresh = false) => {
    try {
      setProjectsLoading(true)
      
      // Se abbiamo già progetti e non è un refresh forzato, carica prima quelli locali
      if (!forceRefresh && projects.length > 0) {
        const localProjects = ProjectService.getLocalProjects()
          .filter(p => p.user_id === user!.id)
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        
        if (localProjects.length > 0) {
          setProjects(localProjects)
          setProjectsLoading(false)
          
          // Poi sincronizza in background
          setTimeout(async () => {
            try {
              const userProjects = await ProjectService.getUserProjects(user!.id)
              setProjects(userProjects)
            } catch (error) {
              console.warn('⚠️ Sincronizzazione background fallita:', error)
            }
          }, 100)
          return
        }
      }
      
      // Altrimenti carica normalmente
      const userProjects = await ProjectService.getUserProjects(user!.id)
      setProjects(userProjects)
    } catch (error) {
      console.error('Errore nel caricamento dei progetti:', error)
    } finally {
      setProjectsLoading(false)
    }
  }

  const handleCreateProject = async () => {
    const plan = String((user as any)?.plan || '').toUpperCase()
    if (plan === 'BASE') {
      if (projects.length >= 1) {
        setShowUpgradeModal(true)
        return
      }
      // Per il primo sito in BASE, non richiedere stato attivo
    } else {
      if (plan === 'PLUS') {
        if (projects.length >= 2) {
          setShowUpgradeModal(true)
          return
        }
        // Consenti creazione (nessun controllo stato attivo in dev)
      } else if (plan === 'PRO') {
        // PRO: massimo 3
        if (projects.length >= 3) {
          alert('Limite piano PRO: puoi creare al massimo 3 siti.')
          return
        }
      } else {
        if (!isSubscriptionActive(user)) {
          alert(getSubscriptionBlockReason(user))
          return
        }
      }
    }
    try {
      const newProject = await ProjectService.createProject(user!.id, {
        name: 'Nuovo Progetto',
        slug: `progetto-${Date.now()}`,
        sections: [],
        theme: {
          accent: 'BLUE',
          font: 'INTER'
        },
        layout_type: 'ELEGANTE'
      })
      
      // Aggiorna la lista dei progetti nella dashboard
      setProjects(prevProjects => [newProject, ...prevProjects])
      
      // Reindirizza al builder del nuovo progetto con il layout selezionato
      router.push(`/dashboard/sites/${newProject.id}/builder`)
    } catch (error: any) {
      console.error('Errore nella creazione del progetto:', error)
      alert(`Errore nella creazione del progetto: ${error?.message || 'operazione non riuscita'}`)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Sei sicuro di voler eliminare questo progetto?')) {
      try {
        // Aggiorna l'UI immediatamente rimuovendo il progetto dalla lista
        setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId))
        
        // Poi elimina il progetto in background
        await ProjectService.deleteProject(projectId)
        console.log('✅ Progetto eliminato con successo')
      } catch (error) {
        console.error('❌ Errore nell\'eliminazione del progetto:', error)
        alert('Errore nell\'eliminazione del progetto. Riprova.')
        // In caso di errore, ricarica i progetti per ripristinare lo stato
        await loadProjects()
      }
    }
  }

  // Funzioni per editing nome progetto
  const handleEditProjectName = (projectId: string, currentName: string) => {
    setEditingProject(projectId)
    setTempProjectName(currentName)
  }

  const handleSaveProjectName = async (projectId: string) => {
    if (!tempProjectName.trim()) {
      alert('Il nome del progetto non può essere vuoto')
      return
    }

    try {
      const project = projects.find(p => p.id === projectId)
      if (project) {
        await ProjectService.updateProject(projectId, {
          ...project,
          name: tempProjectName.trim()
        })
        await loadProjects()
        setEditingProject(null)
        setTempProjectName('')
      }
    } catch (error) {
      console.error('Errore nel salvataggio del nome progetto:', error)
      alert('Errore nel salvataggio del nome progetto')
    }
  }

  const handleCancelProjectEdit = () => {
    setEditingProject(null)
    setTempProjectName('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento dashboard...</p>
        </div>
      </div>
    )
  }

  // TEMPORANEO: Disabilita autenticazione per test
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex items-center">
                  <img src="/logo-hostonhome.png" alt="HostOnHome" width={160} height={28} style={{ display: 'block' }} />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Modalità Test - Non autenticato</span>
                <Link href="/login">
                  <Button variant="outline">Accedi</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid xl:grid-cols-4 gap-8">
            {/* Area Personale Host - Sidebar */}
            <div className="xl:col-span-1">
              <div className="space-y-4">
                {/* Profilo Header Editabile */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <span className="text-2xl font-bold">MV</span>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold">Matteo Venneri</h2>
                        <p className="text-blue-100">Host dal 2019</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Menu Sezioni Collassabili */}
                <div className="space-y-3">
                  {/* Telefono */}
                  <CollapsibleSection
                    title="Telefono"
                    icon={<Phone className="w-5 h-5 text-blue-600" />}
                    isExpanded={expandedSections.contacts}
                    onToggle={() => toggleSection('contacts')}
                  >
                    <EditableField
                      field="telefono"
                      value={hostProfile.telefono}
                      icon={<Phone className="w-4 h-4 text-blue-600" />}
                      placeholder="+39 123 456 7890"
                    />
                  </CollapsibleSection>

                  {/* Indirizzo */}
                  <CollapsibleSection
                    title="Indirizzo"
                    icon={<MapPin className="w-5 h-5 text-green-600" />}
                    isExpanded={expandedSections.structures}
                    onToggle={() => toggleSection('structures')}
                  >
                    <EditableField
                      field="indirizzo"
                      value={hostProfile.indirizzo}
                      icon={<MapPin className="w-4 h-4 text-green-600" />}
                      placeholder="Via Example, 123 - Città"
                    />
                  </CollapsibleSection>

                  {/* Strutture */}
                  <CollapsibleSection
                    title={`Strutture (${hostProfile.nomeStrutture.length})`}
                    icon={<Building className="w-5 h-5 text-purple-600" />}
                    isExpanded={expandedSections.booking}
                    onToggle={() => toggleSection('booking')}
                  >
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
                  </CollapsibleSection>

                  {/* Hota collegate */}
                  <CollapsibleSection
                    title="Hota collegate"
                    icon={<ExternalLink className="w-5 h-5 text-orange-600" />}
                    isExpanded={expandedSections.booking}
                    onToggle={() => toggleSection('booking')}
                  >
                    <div className="space-y-3">
                      {/* Booking.com editabile */}
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
                      
                      {/* Airbnb editabile */}
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
                    </div>
                  </CollapsibleSection>

                  {/* Lingue */}
                  <CollapsibleSection
                    title="Lingue"
                    icon={<User className="w-5 h-5 text-indigo-600" />}
                    isExpanded={expandedSections.languages}
                    onToggle={() => toggleSection('languages')}
                  >
                    <EditableField
                      field="lingue"
                      value={hostProfile.lingue}
                      icon={<User className="w-4 h-4 text-indigo-600" />}
                      placeholder="Italiano, Inglese, Spagnolo..."
                    />
                  </CollapsibleSection>
                </div>
              </div>
            </div>
            
            {/* Area Progetti - Destra */}
            <div className="xl:col-span-3">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">I Tuoi Progetti</h2>
                <Button 
                  onClick={handleCreateProject} 
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuovo Progetto</span>
                </Button>
              </div>


              {/* Progetti di esempio per test */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 group cursor-pointer hover:bg-blue-50 p-2 -m-2 rounded-lg transition-colors">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          Progetto Test
                        </h3>
                        <div className="flex items-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Pencil className="w-3 h-3 text-blue-600 mr-1" />
                          <span className="text-xs text-blue-600 font-medium">Clicca per modificare</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button variant="outline" size="sm" title="Modifica progetto">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          title="Visualizza anteprima sito"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          title="Elimina progetto"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">3</div>
                        <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">Sezioni</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-sm font-bold text-purple-600">HOST ON HOME</div>
                        <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">Tema</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Tema</span>
                        <span className="font-medium text-gray-900">BLUE / INTER</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Aggiornato</span>
                        <span className="font-medium text-gray-900">03/09/2025</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-gray-500">URL</span>
                        <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">
                          progetto-test
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Se Supabase non è configurato, mostra un messaggio informativo
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex items-center">
                  <img src="/logo-hostonhome.png" alt="HostOnHome" width={160} height={28} style={{ display: 'block' }} />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Ciao, {user.email}</span>
                <Button variant="outline" onClick={signOut}>
                  Esci
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm">⚠️</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                  Supabase non configurato
                </h2>
                <p className="text-yellow-700 mb-4">
                  Per utilizzare la dashboard e salvare i tuoi progetti, devi configurare Supabase.
                </p>
                <div className="bg-white rounded-md p-4 border border-yellow-200">
                  <h3 className="font-medium text-gray-900 mb-2">Passi per configurare:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    <li>Crea un progetto su <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a></li>
                    <li>Crea il file <code className="bg-gray-100 px-1 rounded">.env.local</code> nella root del progetto</li>
                    <li>Aggiungi le credenziali Supabase al file</li>
                    <li>Esegui lo schema SQL nel database Supabase</li>
                    <li>Riavvia il server di sviluppo</li>
                  </ol>
                </div>
                <p className="text-sm text-yellow-600 mt-4">
                  Vedi il file <code className="bg-yellow-100 px-1 rounded">SUPABASE_SETUP.md</code> per istruzioni dettagliate.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 h-auto py-3 sm:h-16 sm:py-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img src="/logo-hostonhome.png" alt="HostOnHome" width={140} height={28} style={{ display: 'block' }} />
                <span className="sr-only">Dashboard</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-gray-700 max-w-[40vw] truncate">Ciao, {user.email}</span>
              <Button variant="outline" size="sm" onClick={signOut}>
                Esci
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showUpgradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-2">Limite piano BASE</h3>
              <p className="text-sm text-gray-600 mb-4">
                Con il piano <span className="font-medium">BASE</span> puoi creare solamente <span className="font-medium">1 sito</span>.
                Per aggiungere altri siti, effettua l'upgrade del piano.
              </p>
              <div className="space-y-2 mb-4">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={async () => {
                    const resp = await fetch('/api/stripe/checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ plan: 'PLUS', interval: 'monthly' }),
                    })
                    const data = await resp.json()
                    if (resp.ok && data.url) window.location.href = data.url
                  }}
                >
                  Passa ad Avanzato (€{(STRIPE_PRICING.PLUS.monthly/100).toFixed(2)}/mese)
                </Button>
                <Button
                  className="w-full"
                  onClick={async () => {
                    const resp = await fetch('/api/stripe/checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ plan: 'PRO', interval: 'monthly' }),
                    })
                    const data = await resp.json()
                    if (resp.ok && data.url) window.location.href = data.url
                  }}
                >
                  Passa a Pro (€{(STRIPE_PRICING.PRO.monthly/100).toFixed(2)}/mese)
                </Button>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>Chiudi</Button>
              </div>
            </div>
          </div>
        )}
        {/* Dashboard Layout Responsive */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Area Personale Host - Sidebar */}
          <div className="xl:col-span-1">
            <div className="space-y-4">
              {/* Profilo Header Editabile */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xl backdrop-blur-sm">
                      {hostProfile.nome.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Nome editabile */}
                      {editingField === 'nome' ? (
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <input
                            type="text"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="text-lg font-bold bg-white/20 border border-white/30 rounded px-2 py-1 flex-1 min-w-[160px] max-w-full text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                            placeholder="Nome completo"
                          />
                          <div className="flex items-center gap-2 shrink-0">
                            <Button size="sm" onClick={() => handleSave('nome')} className="bg-green-600 hover:bg-green-700 text-white">
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button size="sm" onClick={handleCancel} className="bg-red-600 hover:bg-red-700 text-white">
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="group cursor-pointer mb-2" 
                          onClick={() => handleEdit('nome', hostProfile.nome)}
                        >
                          <h3 className="text-lg font-bold truncate group-hover:text-blue-200 transition-colors">
                            {hostProfile.nome}
                            <Pencil className="w-3 h-3 ml-2 inline opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h3>
                        </div>
                      )}
                      
                      {/* Anno inizio editabile */}
                      {editingField === 'annoInizio' ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-blue-100 text-sm">Host dal</span>
                          <input
                            type="text"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="bg-white/20 border border-white/30 rounded px-2 py-1 text-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 w-20 min-w-[72px]"
                            placeholder="2019"
                          />
                          <div className="flex items-center gap-2 shrink-0">
                            <Button size="sm" onClick={() => handleSave('annoInizio')} className="bg-green-600 hover:bg-green-700 text-white">
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button size="sm" onClick={handleCancel} className="bg-red-600 hover:bg-red-700 text-white">
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="group cursor-pointer" 
                          onClick={() => handleEdit('annoInizio', hostProfile.annoInizio)}
                        >
                          <p className="text-blue-100 text-sm group-hover:text-white transition-colors">
                            Host dal {hostProfile.annoInizio}
                            <Pencil className="w-3 h-3 ml-1 inline opacity-0 group-hover:opacity-100 transition-opacity" />
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Menu Sezioni Collassabili */}
              <div className="space-y-3">
                {/* Telefono */}
                <CollapsibleSection
                  title="Telefono"
                  icon={<Phone className="w-5 h-5 text-blue-600" />}
                  isExpanded={expandedSections.contacts}
                  onToggle={() => toggleSection('contacts')}
                >
                  <EditableField
                    field="telefono"
                    value={hostProfile.telefono}
                    icon={<Phone className="w-4 h-4 text-blue-600" />}
                    placeholder="+39 123 456 7890"
                  />
                </CollapsibleSection>

                {/* Indirizzo */}
                <CollapsibleSection
                  title="Indirizzo"
                  icon={<MapPin className="w-5 h-5 text-green-600" />}
                  isExpanded={expandedSections.structures}
                  onToggle={() => toggleSection('structures')}
                >
                  <EditableField
                    field="indirizzo"
                    value={hostProfile.indirizzo}
                    icon={<MapPin className="w-4 h-4 text-green-600" />}
                    placeholder="Via Example, 123 - Città"
                  />
                </CollapsibleSection>

                {/* Strutture */}
                <CollapsibleSection
                  title={`Strutture (${hostProfile.nomeStrutture.length})`}
                  icon={<Building className="w-5 h-5 text-purple-600" />}
                  isExpanded={expandedSections.booking}
                  onToggle={() => toggleSection('booking')}
                >
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
                </CollapsibleSection>

                {/* Hota collegate */}
                <CollapsibleSection
                  title="Hota collegate"
                  icon={<ExternalLink className="w-5 h-5 text-orange-600" />}
                  isExpanded={expandedSections.booking}
                  onToggle={() => toggleSection('booking')}
                >
                  <div className="space-y-3">
                    {/* Booking.com editabile */}
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
                    
                    {/* Airbnb editabile */}
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
                  </div>
                </CollapsibleSection>

                {/* Lingue */}
                <CollapsibleSection
                  title="Lingue"
                  icon={<User className="w-5 h-5 text-indigo-600" />}
                  isExpanded={expandedSections.languages}
                  onToggle={() => toggleSection('languages')}
                >
                  <EditableField
                    field="lingue"
                    value={hostProfile.lingue}
                    icon={<User className="w-4 h-4 text-indigo-600" />}
                    placeholder="Italiano, Inglese, Spagnolo..."
                  />
                </CollapsibleSection>
              </div>
            </div>
          </div>
          
          {/* Area Progetti - Destra */}
          <div className="xl:col-span-3">
              {/* Abbonamento / Billing */}
              <Card className="mb-8 border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Abbonamento</span>
                    {user?.plan && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        Piano: {user.plan}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="col-span-2">
                      <div className="text-sm text-gray-500 mb-1">Piano attuale</div>
                      <div className="text-3xl font-extrabold tracking-tight">
                        {user?.plan || 'Nessun piano'}
                      </div>
                      {user?.plan && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                            <Star className="w-5 h-5 text-blue-500 mt-0.5" />
                            <div>
                              <div className="text-xs uppercase tracking-wide text-gray-500">Limiti</div>
                              <div className="text-sm text-gray-900 font-medium">
                                {(() => {
                                  const limits = PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS];
                                  const sectionsText = (limits.sections >= 999 || user.plan === 'PRO')
                                    ? 'Sezioni illimitate'
                                    : `${limits.sections} sezioni`;
                                  return sectionsText;
                                })()}
                              </div>
                            </div>
                          </div>
                          {/* ✅ Trial Status Banner */}
                          {trialInfo.isTrial && (
                            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 flex items-start gap-3">
                              <div className="text-2xl">🎉</div>
                              <div className="flex-1">
                                <div className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Prova Gratuita Attiva</div>
                                <div className="text-sm text-blue-900 font-medium mb-2">
                                  {trialInfo.daysRemaining} giorni rimanenti
                                </div>
                                <div className="text-xs text-blue-700">
                                  Al termine del trial, l'abbonamento si attiverà automaticamente.
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* ✅ Abbonamento Disdetto Banner */}
                          {(user as any)?.subscriptionStatus === 'CANCELED' && (
                            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 flex items-start gap-3">
                              <div className="text-2xl">📋</div>
                              <div className="flex-1">
                                <div className="text-xs uppercase tracking-wide text-orange-600 font-semibold">Abbonamento Disdetto</div>
                                <div className="text-sm text-orange-900 font-medium mb-2">
                                  Il tuo abbonamento è stato disdetto con successo.
                                </div>
                                <div className="text-xs text-orange-700">
                                  I servizi continueranno fino alla fine del periodo di fatturazione corrente.
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* ✅ Payment Issue Banner */}
                          {!isSubscriptionActive(user) && !trialInfo.isTrial && (user as any)?.subscriptionStatus !== 'CANCELED' && (
                            <div className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 flex items-start gap-3">
                              <div className="text-2xl">⚠️</div>
                              <div className="flex-1">
                                <div className="text-xs uppercase tracking-wide text-red-600 font-semibold">Servizi Sospesi</div>
                                <div className="text-sm text-red-900 font-medium mb-2">
                                  {getSubscriptionBlockReason(user)}
                                </div>
                                <div className="text-xs text-red-700">
                                  Completa il pagamento per riattivare tutti i servizi.
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-purple-500 mt-0.5" />
                            <div>
                              <div className="text-xs uppercase tracking-wide text-gray-500">Periodo</div>
                              <div className="text-sm text-gray-900 font-medium">
                                {user?.subscriptionStatus ? (
                                  <>
                                    {user?.subscriptionStatus?.toString().toUpperCase()} ·
                                    {' '}dal { (user as any)?.currentPeriodStart ? new Date((user as any).currentPeriodStart).toLocaleDateString('it-IT') : '—' }
                                    {' '}al { (user as any)?.currentPeriodEnd ? new Date((user as any).currentPeriodEnd).toLocaleDateString('it-IT') : '—' }
                                  </>
                                ) : '—'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-stretch gap-3 w-full max-w-full lg:justify-self-end">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowUpgradeSelector((s) => !s)
                          }}
                          disabled={!user?.plan || user.plan === 'PRO'}
                        >
                          {user?.plan === 'PRO' ? 'Piano massimo' : 'Fai Upgrade'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={async () => {
                            if (!user?.id) {
                              alert('ID utente non trovato')
                              return
                            }
                            
                            try {
                              const resp = await fetch('/api/test-subscription', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId: user.id }),
                              })
                              
                              const data = await resp.json()
                              console.log('🔍 Test abbonamento:', data)
                              
                              if (data.success) {
                                alert(`✅ Test completato!

📊 STATO UTENTE:
• Email: ${data.user.email}
• Status: ${data.user.subscriptionStatus}
• Customer ID: ${data.user.stripeCustomerId}
• Subscription ID: ${data.user.stripeSubscriptionId}
• Period End: ${data.user.currentPeriodEnd}
• Cancel At Period End: ${data.user.cancelAtPeriodEnd}

💳 STRIPE:
• Customer: ${data.stripe?.customer?.id}
• Abbonamenti: ${data.stripe?.subscriptions?.length || 0}

Controlla la console per dettagli completi.`)
                              } else {
                                alert(`❌ Errore test: ${data.error}`)
                              }
                            } catch (error: any) {
                              alert(`❌ Errore: ${error.message}`)
                            }
                          }}
                          className="bg-purple-500 text-white hover:bg-purple-600"
                        >
                          🔍 Test
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            const subscriptionId = user?.stripeSubscriptionId
                            if (!subscriptionId) {
                              alert('Nessuna sottoscrizione attiva')
                              return
                            }
                            if (!confirm(`⚠️ ATTENZIONE: Disdetta Abbonamento

Se disdici l'abbonamento:
• I tuoi siti web CESSERANNO di funzionare alla fine del periodo di fatturazione
• Non potrai più modificare o pubblicare i tuoi siti
• I dati saranno conservati per 30 giorni dopo la disdetta
• Dopo 30 giorni, tutti i dati verranno eliminati definitivamente

Sei sicuro di voler procedere con la disdetta?`)) return
                            const resp = await fetch('/api/stripe/cancel-subscription', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ 
                                subscriptionId,
                                userId: user?.id 
                              }),
                            })
                            const data = await resp.json()
                            if (!resp.ok || !data.success) {
                              alert(data.error || 'Errore durante la disdetta')
                            } else {
                              alert(`✅ Abbonamento disdetto con successo!

📅 Il tuo abbonamento terminerà alla fine del periodo di fatturazione corrente.

⚠️ IMPORTANTE:
• I tuoi siti continueranno a funzionare fino alla fine del periodo
• Potrai ancora modificare i tuoi siti fino alla scadenza
• Dopo la scadenza, i siti non saranno più accessibili
• I dati saranno conservati per 30 giorni dopo la scadenza

💡 Per riattivare l'abbonamento, contatta il supporto.`)
                              // ✅ Ricarica i dati dell'utente per aggiornare lo stato
                              await refreshUser()
                            }
                          }}
                        >
                          Disdici
                        </Button>
                      </div>

                      <AnimatePresence>
                      {showUpgradeSelector && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="w-full sm:max-w-[420px] md:max-w-[420px] p-4 border rounded-xl bg-white shadow-sm box-border overflow-hidden"
                        >
                          <div className="text-sm font-semibold mb-2">Scegli il piano di upgrade</div>
                          <div className="grid grid-cols-1 gap-3 mb-3 w-full">
                            {(user?.plan === 'BASE' ? ['PLUS', 'PRO'] : user?.plan === 'PLUS' ? ['PRO'] : [])
                              .map((p) => (
                                <motion.button
                                  key={p}
                                  type="button"
                                  onClick={() => setUpgradePlan(p as 'PLUS' | 'PRO')}
                                  className={`rounded-xl border transition-all text-left w-full p-3 flex items-center justify-between gap-3 min-h-[56px] ${
                                    upgradePlan === p ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' : 'border-gray-200 bg-white hover:border-gray-300'
                                  }`}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold truncate">{p === 'PLUS' ? 'Avanzato' : 'Pro'}</div>
                                    <div className="text-xs text-gray-600 mt-0.5 truncate">{formatEuro(STRIPE_PRICING[p as 'PLUS' | 'PRO'][upgradeInterval])}</div>
                                  </div>
                                  {upgradePlan === p && (
                                    <Check className="w-4 h-4 text-blue-600" />
                                  )}
                                </motion.button>
                              ))}
                          </div>

                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <motion.button
                              type="button"
                              onClick={() => setUpgradeInterval('monthly')}
                              className={`px-3 py-1.5 rounded-full text-sm border transition ${upgradeInterval==='monthly' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
                              whileTap={{ scale: 0.98 }}
                            >
                              Mensile
                            </motion.button>
                            <motion.button
                              type="button"
                              onClick={() => setUpgradeInterval('yearly')}
                              className={`px-3 py-1.5 rounded-full text-sm border transition ${upgradeInterval==='yearly' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
                              whileTap={{ scale: 0.98 }}
                            >
                              Annuale
                            </motion.button>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              onClick={async () => {
                                if (!upgradePlan) {
                                  alert('Seleziona un piano per procedere')
                                  return
                                }
                                const resp = await fetch('/api/stripe/checkout', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ plan: upgradePlan, interval: upgradeInterval }),
                                })
                                const data = await resp.json()
                                if (resp.ok && data.url) {
                                  window.location.href = data.url
                                } else {
                                  alert(data.error || 'Checkout non disponibile')
                                }
                              }}
                            >
                              Procedi
                            </Button>
                            <Button variant="outline" onClick={() => setShowUpgradeSelector(false)}>Annulla</Button>
                          </div>
                        </motion.div>
                      )}
                      </AnimatePresence>
                    </div>
                  </div>
                </CardContent>
              </Card>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">I Tuoi Progetti</h2>
              <Button 
                onClick={() => {
                  const plan = String((user as any)?.plan || '').toUpperCase()
                  if (plan === 'BASE' && projects.length >= 1) {
                    setShowUpgradeModal(true)
                    return
                  }
                  if (plan === 'PLUS' && projects.length >= 2) {
                    setShowUpgradeModal(true)
                    return
                  }
                  if (plan === 'PRO' && projects.length >= 3) {
                    alert('Limite piano PRO: puoi creare al massimo 3 siti.')
                    return
                  }
                  if (plan !== 'BASE' && plan !== 'PLUS' && plan !== 'PRO') {
                    if (!isSubscriptionActive(user)) {
                      alert(getSubscriptionBlockReason(user))
                      return
                    }
                  }
                  handleCreateProject()
                }} 
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="w-4 h-4" />
                <span>Nuovo Progetto</span>
              </Button>
            </div>


        {projectsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Caricamento progetti...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun progetto ancora</h3>
            <p className="text-gray-600 mb-6">Inizia creando il tuo primo sito web</p>
            <Button onClick={handleCreateProject}>Crea il tuo primo progetto</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                {/* Header con nome editabile */}
                <div className="p-6">
                  {editingProject === project.id ? (
                    <div className="mb-4">
                      <input
                        type="text"
                        value={tempProjectName}
                        onChange={(e) => setTempProjectName(e.target.value)}
                        className="w-full text-lg font-semibold text-gray-900 bg-white border-2 border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 mb-3"
                        placeholder="Nome del progetto"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveProjectName(project.id)
                          } else if (e.key === 'Escape') {
                            handleCancelProjectEdit()
                          }
                        }}
                      />
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveProjectName(project.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Salva
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelProjectEdit}
                          className="border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Annulla
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start mb-4">
                      <div 
                        className="flex-1 group cursor-pointer hover:bg-blue-50 p-2 -m-2 rounded-lg transition-colors"
                        onClick={() => handleEditProjectName(project.id, project.name)}
                      >
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {project.name}
                        </h3>
                        <div className="flex items-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Pencil className="w-3 h-3 text-blue-600 mr-1" />
                          <span className="text-xs text-blue-600 font-medium">Clicca per modificare</span>
                        </div>
                      </div>
                      
                      {/* Bottoni azione */}
                      <div className="flex space-x-2 ml-4">
                        <Link href={`/dashboard/sites/${project.slug}/builder`}>
                          <Button variant="outline" size="sm" title="Modifica progetto">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          title="Visualizza anteprima sito"
                          onClick={() => {
                            window.open(`/dashboard/sites/${project.slug}/preview`, '_blank');
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Elimina progetto"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Statistiche principali */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{project.sections.length}</div>
                      <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">Sezioni</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm font-bold text-purple-600">{project.layout_type}</div>
                      <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">Layout</div>
                    </div>
                  </div>
                  
                  {/* Info dettagliate */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Tema</span>
                      <span className="font-medium text-gray-900">{project.theme.accent} / {project.theme.font}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Aggiornato</span>
                      <span className="font-medium text-gray-900">{new Date(project.updated_at).toLocaleDateString('it-IT')}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-gray-500">URL</span>
                      <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">
                        {project.slug}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
          </div>
        </div>
      </main>
    </div>
  )
}
