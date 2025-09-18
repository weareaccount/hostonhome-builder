'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, X } from 'lucide-react'
import type { Challenge } from '@/types'

interface SimplePhotoUploadModalProps {
  challenge: Challenge
  isOpen: boolean
  onClose: () => void
  onUpload: (photoUrl: string, description: string) => Promise<void>
}

export default function SimplePhotoUploadModal({ 
  challenge, 
  isOpen, 
  onClose, 
  onUpload 
}: SimplePhotoUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadError(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Seleziona una foto prima di inviare.')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      console.log('📸 Inizio upload foto per challenge:', challenge.id)
      
      // Crea un URL locale per l'immagine caricata
      const photoUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve(e.target?.result as string)
        }
        reader.onerror = reject
        reader.readAsDataURL(selectedFile)
      })
      
      console.log('📸 Foto caricata con successo')
      
      await onUpload(photoUrl, description)
      console.log('📸 Verifica inviata con successo')
      
      alert('✅ Foto inviata con successo!')
      
      // Reset form
      setSelectedFile(null)
      setDescription('')
      onClose()
    } catch (error) {
      console.error('❌ Errore durante l\'upload:', error)
      setUploadError('Errore durante l\'upload. Riprova.')
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Camera className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Verifica Challenge
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleziona Foto
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrizione (opzionale)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Aggiungi una descrizione della foto..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {uploadError && (
            <div className="text-red-600 text-sm">
              {uploadError}
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Annulla
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUploading ? 'Invio...' : 'Invia'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
