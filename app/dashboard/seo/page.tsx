'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  Globe, 
  TrendingUp, 
  Eye, 
  Link, 
  Image, 
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  BarChart3
} from 'lucide-react'

export default function SEOPage() {
  const [seoData, setSeoData] = useState({
    title: '',
    description: '',
    keywords: '',
    ogImage: '',
    canonicalUrl: '',
    robots: 'index, follow',
    sitemap: false,
    analytics: {
      googleAnalytics: '',
      googleSearchConsole: false,
      facebookPixel: ''
    }
  })

  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState('')

  const handleEdit = (field: string, currentValue: any) => {
    setEditingField(field)
    setTempValue(Array.isArray(currentValue) ? currentValue.join(', ') : currentValue.toString())
  }

  const handleSave = (field: string) => {
    let newValue: any = tempValue
    
    if (field === 'keywords') {
      newValue = tempValue.split(',').map(item => item.trim()).filter(item => item.length > 0)
    }
    
    setSeoData(prev => ({ ...prev, [field]: newValue }))
    setEditingField(null)
    setTempValue('')
    
    console.log(`Salvato ${field}:`, newValue)
  }

  const handleCancel = () => {
    setEditingField(null)
    setTempValue('')
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
        <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border-2 border-blue-300">
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
              <CheckCircle className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="w-8 h-8 p-0 border-red-300 text-red-600 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div 
        className="flex items-start space-x-3 p-3 bg-white/70 rounded-lg hover:bg-white/90 transition-all cursor-pointer group"
        onClick={() => handleEdit(field, value)}
      >
        {icon}
        <div className="flex-1">
          <span className="text-sm text-gray-700 block">
            {displayValue || <span className="text-gray-400 italic">Non impostato</span>}
          </span>
          <span className="text-xs text-gray-500">Clicca per modificare</span>
        </div>
      </div>
    )
  }

  const seoScore = 0 // Nessun dato mock
  const seoIssues: any[] = [] // Nessun problema mock

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">SEO</h1>
        <p className="text-gray-600 mt-1">Ottimizza il tuo sito per i motori di ricerca</p>
      </div>

      {/* SEO Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
            Punteggio SEO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold text-gray-400">{seoScore}</div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gray-300 h-3 rounded-full transition-all"
                  style={{ width: `${seoScore}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">Configura le impostazioni SEO per iniziare</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
            Problemi SEO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {seoIssues.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <CheckCircle className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-500 text-sm">Nessun problema SEO rilevato</p>
                <p className="text-gray-400 text-xs mt-1">Configura le impostazioni per iniziare l'analisi</p>
              </div>
            ) : (
              seoIssues.map((issue, index) => (
                <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${
                  issue.type === 'error' ? 'bg-red-50 border border-red-200' :
                  issue.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-green-50 border border-green-200'
                }`}>
                  {issue.type === 'error' ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : issue.type === 'warning' ? (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  <span className={`text-sm ${
                    issue.type === 'error' ? 'text-red-700' :
                    issue.type === 'warning' ? 'text-yellow-700' :
                    'text-green-700'
                  }`}>
                    {issue.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meta Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2 text-blue-500" />
              Meta Tags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Title</label>
              <EditableField
                field="title"
                value={seoData.title}
                icon={<FileText className="w-4 h-4 text-blue-600" />}
                placeholder="Titolo della pagina"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
              <EditableField
                field="description"
                value={seoData.description}
                icon={<FileText className="w-4 h-4 text-green-600" />}
                multiline
                placeholder="Descrizione della pagina"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Keywords</label>
              <EditableField
                field="keywords"
                value={seoData.keywords}
                icon={<Search className="w-4 h-4 text-purple-600" />}
                placeholder="parola1, parola2, parola3"
              />
            </div>
          </CardContent>
        </Card>

        {/* Open Graph */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2 text-purple-500" />
              Open Graph
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">OG Image</label>
              <EditableField
                field="ogImage"
                value={seoData.ogImage}
                icon={<Image className="w-4 h-4 text-orange-600" />}
                placeholder="/images/og-image.jpg"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Canonical URL</label>
              <EditableField
                field="canonicalUrl"
                value={seoData.canonicalUrl}
                icon={<Link className="w-4 h-4 text-blue-600" />}
                placeholder="https://tuosito.com"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Robots</label>
              <EditableField
                field="robots"
                value={seoData.robots}
                icon={<Settings className="w-4 h-4 text-gray-600" />}
                placeholder="index, follow"
              />
            </div>
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Google Analytics</label>
              <EditableField
                field="analytics.googleAnalytics"
                value={seoData.analytics.googleAnalytics}
                icon={<BarChart3 className="w-4 h-4 text-blue-600" />}
                placeholder="GA-XXXXXXXXX"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Facebook Pixel</label>
              <EditableField
                field="analytics.facebookPixel"
                value={seoData.analytics.facebookPixel}
                icon={<Eye className="w-4 h-4 text-blue-600" />}
                placeholder="FB-XXXXXXXXX"
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">Google Search Console</span>
              </div>
              <Button size="sm" variant="outline">
                Configura
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sitemap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Link className="w-5 h-5 mr-2 text-indigo-500" />
              Sitemap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">Sitemap.xml</span>
                </div>
                <Button size="sm" variant="outline">
                  Genera
                </Button>
              </div>
              
              <div className="text-sm text-gray-600">
                <p className="mb-2">La sitemap aiuta i motori di ricerca a:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Scoprire tutte le pagine del tuo sito</li>
                  <li>Capire la struttura del sito</li>
                  <li>Aggiornare l'indice più rapidamente</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2 text-gray-500" />
            Azioni
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button>
              <CheckCircle className="w-4 h-4 mr-2" />
              Salva Impostazioni SEO
            </Button>
            <Button variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analizza SEO
            </Button>
            <Button variant="outline">
              <Globe className="w-4 h-4 mr-2" />
              Testa Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
