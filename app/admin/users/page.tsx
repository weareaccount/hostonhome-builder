'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Search, 
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

interface Project {
  id: string
  name: string
  slug: string
  sections: any[]
  theme: any
  layout_type: string
  created_at: string
  updated_at: string
}

interface User {
  id: string
  name: string
  email: string
  phone?: string
  status: 'active' | 'inactive' | 'pending'
  role: 'user' | 'premium' | 'admin'
  joinedAt: Date
  lastActive: Date
  challengesCompleted: number
  badgesEarned: number
  sitesCreated: number
  projects: Project[]
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all')
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'premium' | 'admin'>('all')
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      
      // Usa l'API admin per ottenere utenti con progetti
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      
      if (data.success) {
        if (data.users && data.users.length > 0) {
          const usersWithProjects = data.users.map((userData: any) => ({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            phone: Math.random() > 0.5 ? `+39 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}` : undefined,
            status: userData.status,
            role: userData.role,
            joinedAt: new Date(userData.joinedAt),
            lastActive: new Date(userData.lastActive),
            challengesCompleted: userData.completedChallenges,
            badgesEarned: Math.floor(userData.completedChallenges / 4), // Ogni 4 challenge = 1 badge
            sitesCreated: userData.projectsCount,
            projects: userData.projects || []
          }))
          
          setUsers(usersWithProjects)
        } else {
          // Nessun utente trovato
          console.log('ℹ️ Nessun utente trovato nel database:', data.message)
          setUsers([])
        }
      } else {
        console.error('Errore nel caricamento degli utenti:', data.error)
        setUsers([])
      }
    } catch (error) {
      console.error('Errore nel caricamento degli utenti:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesStatus && matchesRole
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'inactive': return <XCircle className="w-4 h-4 text-red-600" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'premium': return 'bg-blue-100 text-blue-800'
      case 'user': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleUserExpansion = (userId: string) => {
    const newExpanded = new Set(expandedUsers)
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId)
    } else {
      newExpanded.add(userId)
    }
    setExpandedUsers(newExpanded)
  }

  const openProjectPreview = (projectSlug: string) => {
    window.open(`/dashboard/sites/${projectSlug}/preview`, '_blank')
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    premium: users.filter(u => u.role === 'premium').length,
    newThisMonth: users.filter(u => u.joinedAt > new Date(Date.now() - 2592000000)).length
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Utenti Totali</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
                <div className="text-sm text-gray-600">Attivi</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.premium}</div>
                <div className="text-sm text-gray-600">Premium</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.newThisMonth}</div>
                <div className="text-sm text-gray-600">Nuovi Questo Mese</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-blue-600" />
            <span>Filtri e Ricerca</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca utenti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tutti gli stati</option>
              <option value="active">Attivi</option>
              <option value="inactive">Inattivi</option>
              <option value="pending">In attesa</option>
            </select>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tutti i ruoli</option>
              <option value="user">Utenti</option>
              <option value="premium">Premium</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Lista Utenti ({filteredUsers.length})</span>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Esporta CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Caricamento utenti...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-24 h-24 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {users.length === 0 ? 'Nessun utente registrato' : 'Nessun utente trovato'}
              </h3>
              <p className="text-gray-600">
                {users.length === 0 
                  ? 'Non ci sono ancora utenti registrati nel sistema. Gli utenti appariranno qui una volta che inizieranno a utilizzare la piattaforma.'
                  : 'Prova a modificare i filtri di ricerca.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-lg">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-semibold text-gray-900">{user.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                            {user.status.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {user.role.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Iscritto il {user.joinedAt.toLocaleDateString('it-IT')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Challenge completate</div>
                        <div className="font-semibold">{user.challengesCompleted}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Badge guadagnati</div>
                        <div className="font-semibold">{user.badgesEarned}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Siti creati</div>
                        <div className="font-semibold">{user.sitesCreated}</div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleUserExpansion(user.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Sezione progetti espandibile */}
                  {expandedUsers.has(user.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Progetti dell'utente ({user.projects.length})
                        </h4>
                      </div>
                      
                      {user.projects.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-sm">Nessun progetto creato</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {user.projects.map((project) => (
                            <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-900 truncate">{project.name}</h5>
                                <span className="text-xs text-gray-500">{project.sections.length} sezioni</span>
                              </div>
                              
                              <div className="text-xs text-gray-600 mb-3">
                                <p>Slug: {project.slug}</p>
                                <p>Tema: {project.theme?.accent || 'N/A'}</p>
                                <p>Layout: {project.layout_type || 'N/A'}</p>
                                <p>Creato: {new Date(project.created_at).toLocaleDateString('it-IT')}</p>
                              </div>
                              
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => openProjectPreview(project.slug)}
                                  className="flex-1"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Anteprima
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => window.open(`/dashboard/sites/${project.slug}/builder`, '_blank')}
                                  className="flex-1"
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Modifica
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
