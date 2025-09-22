'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { ProjectService } from '@/lib/projects'
import type { Project } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  Edit, 
  Trash, 
  Eye, 
  Pencil, 
  Save, 
  X,
  FolderOpen,
  Calendar,
  Layout,
  Palette
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PLAN_LIMITS, STRIPE_PRICING } from '@/lib/constants'
import { isSubscriptionActive, getSubscriptionBlockReason } from '@/lib/subscription'

export default function ProjectsPage() {
  const { user, refreshUser } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  
  // State per editing nome progetto
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [tempProjectName, setTempProjectName] = useState('')

  const canCreateProject = () => {
    if (!user) return false
    const plan = String((user as any)?.plan || '').toUpperCase()
    
    if (plan === 'BASE') {
      return projects.length < 1
    }
    if (plan === 'PLUS') {
      return projects.length < 2
    }
    if (plan === 'PRO') {
      return projects.length < 3
    }
    
    return isSubscriptionActive(user)
  }

  useEffect(() => {
    if (user) {
      loadProjects()
    }
  }, [user])

  const loadProjects = async () => {
    try {
      setProjectsLoading(true)
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
      
      setProjects(prevProjects => [newProject, ...prevProjects])
      router.push(`/dashboard/sites/${newProject.id}/builder`)
    } catch (error: any) {
      console.error('Errore nella creazione del progetto:', error)
      alert(`Errore nella creazione del progetto: ${error?.message || 'operazione non riuscita'}`)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Sei sicuro di voler eliminare questo progetto?')) {
      try {
        setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId))
        await ProjectService.deleteProject(projectId)
        console.log('✅ Progetto eliminato con successo')
      } catch (error) {
        console.error('❌ Errore nell\'eliminazione del progetto:', error)
        alert('Errore nell\'eliminazione del progetto. Riprova.')
        await loadProjects()
      }
    }
  }

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

  const formatEuro = (cents: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(cents / 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progetti</h1>
          <p className="text-gray-600 mt-1">Gestisci i tuoi siti web</p>
        </div>
        <Button 
          onClick={handleCreateProject}
          disabled={!canCreateProject()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuovo Progetto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Progetti Totali</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Layout className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sezioni Totali</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.reduce((acc, project) => acc + project.sections.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Palette className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Piano Attuale</p>
                <p className="text-lg font-bold text-gray-900">
                  {user?.plan || 'BASE'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      {projectsLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento progetti...</p>
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun progetto ancora</h3>
            <p className="text-gray-600 mb-6">Inizia creando il tuo primo sito web</p>
            <Button onClick={handleCreateProject}>Crea il tuo primo progetto</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* Header con nome editabile */}
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">Limite piano {user?.plan}</h3>
            <p className="text-sm text-gray-600 mb-4">
              Con il piano <span className="font-medium">{user?.plan}</span> puoi creare solamente{' '}
              <span className="font-medium">
                {user?.plan === 'BASE' ? '1 sito' : user?.plan === 'PLUS' ? '2 siti' : '3 siti'}
              </span>.
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
    </div>
  )
}
