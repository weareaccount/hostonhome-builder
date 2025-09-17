'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  Calendar,
  User,
  Globe,
  Image,
  Video,
  File,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

interface ContentItem {
  id: string
  title: string
  type: 'template' | 'guide' | 'badge' | 'challenge'
  status: 'published' | 'draft' | 'archived'
  author: string
  createdAt: Date
  updatedAt: Date
  views: number
  downloads: number
  category: string
  description: string
}

export default function AdminContentPage() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'template' | 'guide' | 'badge' | 'challenge'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all')

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockContent: ContentItem[] = [
        {
          id: '1',
          title: 'Template Canva per Post Social',
          type: 'template',
          status: 'published',
          author: 'Admin',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-02-20'),
          views: 1247,
          downloads: 89,
          category: 'Social Media',
          description: 'Template personalizzati per condividere sui social network'
        },
        {
          id: '2',
          title: 'Mini-guida Fotografia per Host',
          type: 'guide',
          status: 'published',
          author: 'Admin',
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-02-15'),
          views: 892,
          downloads: 156,
          category: 'Fotografia',
          description: 'Guida completa per scattare foto professionali della tua struttura'
        },
        {
          id: '3',
          title: 'Badge Primi Passi',
          type: 'badge',
          status: 'published',
          author: 'Admin',
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-10'),
          views: 2341,
          downloads: 0,
          category: 'Badge',
          description: 'Badge per i primi passi nel mondo dell\'ospitalità digitale'
        },
        {
          id: '4',
          title: 'Template Messaggi WhatsApp',
          type: 'template',
          status: 'draft',
          author: 'Admin',
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-25'),
          views: 0,
          downloads: 0,
          category: 'Comunicazione',
          description: 'Template predefiniti per rispondere rapidamente ai clienti'
        },
        {
          id: '5',
          title: 'Guida SEO per Host',
          type: 'guide',
          status: 'published',
          author: 'Admin',
          createdAt: new Date('2024-01-25'),
          updatedAt: new Date('2024-02-10'),
          views: 567,
          downloads: 78,
          category: 'SEO',
          description: 'Consigli personalizzati per migliorare la SEO del tuo sito'
        },
        {
          id: '6',
          title: 'Challenge Condividi Sito',
          type: 'challenge',
          status: 'published',
          author: 'Admin',
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-05'),
          views: 3456,
          downloads: 0,
          category: 'Challenge',
          description: 'Invia il link del tuo sito a 10 persone per aumentare la visibilità'
        }
      ]
      
      setContent(mockContent)
    } catch (error) {
      console.error('Errore nel caricamento dei contenuti:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || item.type === typeFilter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'template': return <FileText className="w-4 h-4 text-blue-600" />
      case 'guide': return <File className="w-4 h-4 text-green-600" />
      case 'badge': return <CheckCircle className="w-4 h-4 text-yellow-600" />
      case 'challenge': return <AlertCircle className="w-4 h-4 text-purple-600" />
      default: return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'draft': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'archived': return <AlertCircle className="w-4 h-4 text-red-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const stats = {
    total: content.length,
    published: content.filter(c => c.status === 'published').length,
    draft: content.filter(c => c.status === 'draft').length,
    totalViews: content.reduce((sum, c) => sum + c.views, 0),
    totalDownloads: content.reduce((sum, c) => sum + c.downloads, 0)
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Contenuti Totali</div>
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
                <div className="text-2xl font-bold text-gray-900">{stats.published}</div>
                <div className="text-sm text-gray-600">Pubblicati</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.draft}</div>
                <div className="text-sm text-gray-600">Bozze</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Visualizzazioni</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <File className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalDownloads}</div>
                <div className="text-sm text-gray-600">Download</div>
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
                placeholder="Cerca contenuti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tutti i tipi</option>
              <option value="template">Template</option>
              <option value="guide">Guide</option>
              <option value="badge">Badge</option>
              <option value="challenge">Challenge</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tutti gli stati</option>
              <option value="published">Pubblicati</option>
              <option value="draft">Bozze</option>
              <option value="archived">Archiviati</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Content List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Gestione Contenuti ({filteredContent.length})</span>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Contenuto
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Caricamento contenuti...</p>
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-24 h-24 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun contenuto trovato</h3>
              <p className="text-gray-600">Prova a modificare i filtri di ricerca.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredContent.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-semibold text-gray-900">{item.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {item.type.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{item.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Creato il {item.createdAt.toLocaleDateString('it-IT')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{item.views} visualizzazioni</span>
                          </div>
                          {item.downloads > 0 && (
                            <div className="flex items-center space-x-1">
                              <File className="w-3 h-3" />
                              <span>{item.downloads} download</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
