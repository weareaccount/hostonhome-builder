'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { ProjectService } from '@/lib/projects'
import type { Project } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  Eye, 
  TrendingUp, 
  Users, 
  Calendar,
  ArrowUpRight,
  FolderOpen,
  Target,
  Trophy,
  Bell,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { isSubscriptionActive, getSubscriptionBlockReason, getTrialInfo } from '@/lib/subscription'
import { STRIPE_PRICING } from '@/lib/constants'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)

  // Gestione abbonamento
  const trialInfo = getTrialInfo(user)
  const subscriptionActive = isSubscriptionActive(user)
  const subscriptionBlockReason = getSubscriptionBlockReason(user)
  
  const formatEuro = (cents: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(cents / 100)
  
  const billingInfo = {
    startDate: new Date((user as any)?.currentPeriodStart || Date.now()),
    endDate: new Date((user as any)?.currentPeriodEnd || Date.now()),
    status: (user as any)?.subscriptionStatus || 'ACTIVE'
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
      router.push(`/dashboard/sites/${newProject.id}/builder`)
    } catch (error: any) {
      console.error('Errore nella creazione del progetto:', error)
      alert(`Errore nella creazione del progetto: ${error?.message || 'operazione non riuscita'}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Accesso Negato</h2>
        <p className="text-gray-600 mt-2">Effettua il login per accedere alla dashboard.</p>
        <Link href="/login">
          <Button className="mt-6">Accedi</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 lg:p-8 text-white">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="text-center lg:text-left">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">Benvenuto, {user.email}!</h1>
            <p className="text-blue-100 text-base lg:text-lg">Gestisci i tuoi progetti e monitora le tue performance</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">{user.email?.charAt(0).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progetti Totali</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+2 questo mese</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Challenge Completate</p>
                <p className="text-2xl font-bold text-gray-900">9/10</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>90% completato</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Badge Sbloccati</p>
                <p className="text-2xl font-bold text-gray-900">2/3</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-yellow-600">
              <Trophy className="w-4 h-4 mr-1" />
              <span>Ottimo progresso!</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Piano Attuale</p>
                <p className="text-2xl font-bold text-gray-900">BASE</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-purple-600">
              <Calendar className="w-4 h-4 mr-1" />
              <span>Attivo</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2 text-blue-600" />
              Azioni Rapide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleCreateProject}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crea Nuovo Progetto
            </Button>
            <Link href="/dashboard/projects" className="block">
              <Button variant="outline" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                Gestisci Progetti
              </Button>
            </Link>
            <Link href="/dashboard/challenges" className="block">
              <Button variant="outline" className="w-full">
                <Target className="w-4 h-4 mr-2" />
                Vedi Challenge
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2 text-green-600" />
              Progetti Recenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Caricamento progetti...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Nessun progetto ancora</p>
                <Button onClick={handleCreateProject} size="sm">
                  Crea il tuo primo progetto
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 3).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <FolderOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{project.name}</p>
                        <p className="text-sm text-gray-500">{project.sections.length} sezioni</p>
                      </div>
                    </div>
                    <Link href={`/dashboard/sites/${project.slug}/builder`}>
                      <Button size="sm" variant="outline">
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
                {projects.length > 3 && (
                  <Link href="/dashboard/projects">
                    <Button variant="outline" className="w-full">
                      Vedi tutti i progetti
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sezione Abbonamento */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <CardTitle className="flex items-center text-xl">
            <CreditCard className="w-6 h-6 mr-3 text-green-600" />
            Stato Abbonamento
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Piano Attuale */}
            <div className="lg:col-span-1">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {user?.plan || 'BASE'}
                </h3>
                <p className="text-gray-600 mb-4">Piano Attuale</p>
                
                {/* Trial Status */}
                {trialInfo.isTrial && (
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="text-2xl">🎉</div>
                      <div className="text-sm font-medium text-blue-600">Prova Gratuita</div>
                    </div>
                    <div className="text-lg font-bold text-blue-800">
                      {trialInfo.daysRemaining} giorni rimanenti
                    </div>
                  </div>
                )}
                
                {/* Subscription Status */}
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {subscriptionActive ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-sm font-medium text-gray-600">Stato</span>
                  </div>
                  <div className={`text-lg font-bold ${
                    subscriptionActive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {billingInfo.status?.toString().toUpperCase() || 'ACTIVE'}
                  </div>
                </div>
              </div>
            </div>

            {/* Dettagli Fatturazione */}
            <div className="lg:col-span-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Dettagli Fatturazione</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Inizio Periodo</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {billingInfo.startDate.toLocaleDateString('it-IT')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Fine Periodo</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {billingInfo.endDate.toLocaleDateString('it-IT')}
                  </span>
                </div>
                
                {user?.plan && user.plan !== 'BASE' && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Costo Mensile</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatEuro(STRIPE_PRICING[user.plan as 'PLUS' | 'PRO']?.monthly || 0)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Azioni */}
            <div className="lg:col-span-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Azioni</h4>
              <div className="space-y-3">
                {user?.plan === 'BASE' && (
                  <Link href="/dashboard/account" className="block">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Fai Upgrade
                    </Button>
                  </Link>
                )}
                
                <Link href="/dashboard/account" className="block">
                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Gestisci Abbonamento
                  </Button>
                </Link>
                
                {subscriptionActive && (
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-800">
                        Servizi Attivi
                      </span>
                    </div>
                  </div>
                )}
                
                {!subscriptionActive && subscriptionBlockReason && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-red-800">
                        {subscriptionBlockReason}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Challenge Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-orange-600" />
            Progresso Challenge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Completamento Generale</span>
              <span className="text-sm font-bold text-gray-900">90%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full" style={{ width: '90%' }}></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">9</div>
                <div className="text-sm text-gray-600">Completate</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">1</div>
                <div className="text-sm text-gray-600">In Corso</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">2</div>
                <div className="text-sm text-gray-600">Badge Sbloccati</div>
              </div>
            </div>
            <div className="text-center pt-4">
              <Link href="/dashboard/challenges">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                  <Target className="w-4 h-4 mr-2" />
                  Vedi Tutte le Challenge
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}