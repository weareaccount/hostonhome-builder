'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { 
  X, 
  Camera, 
  Upload, 
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import type { Challenge } from '@/types'

interface PhotoUploadModalProps {
  challenge: Challenge
  isOpen: boolean
  onClose: () => void
  onUpload: (photoUrl: string, description: string) => Promise<void>
}

export default function PhotoUploadModal({ 
  challenge, 
  isOpen, 
  onClose, 
  onUpload 
}: PhotoUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validazione file
      if (!file.type.startsWith('image/')) {
        setUploadError('Seleziona un file immagine valido')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setUploadError('Il file deve essere inferiore a 5MB')
        return
      }

      setSelectedFile(file)
      setUploadError(null)
      
      // Crea preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      console.error('❌ Nessun file selezionato')
      setUploadError('Seleziona una foto prima di inviare.')
      return
    }

    console.log('📸 Inizio upload foto per challenge:', challenge.id)
    setIsUploading(true)
    setUploadError(null)

    try {
      // Simula upload (in produzione userai un servizio reale come Cloudinary)
      console.log('📸 Simulazione upload foto...')
      const photoUrl = await simulatePhotoUpload(selectedFile)
      console.log('📸 Foto caricata con successo:', photoUrl.substring(0, 50) + '...')
      
      console.log('📸 Invio verifica all\'admin...')
      await onUpload(photoUrl, description)
      console.log('📸 Verifica inviata con successo')
      
      // Mostra messaggio di successo
      alert('✅ Foto inviata con successo!\n\nLa tua verifica è stata inviata all\'admin per l\'approvazione. Riceverai una notifica quando sarà esaminata.')
      
      // Reset form
      setSelectedFile(null)
      setPreviewUrl(null)
      setDescription('')
      onClose()
    } catch (error) {
      console.error('❌ Errore durante l\'upload:', error)
      setUploadError('Errore durante l\'upload. Riprova.')
    } finally {
      setIsUploading(false)
    }
  }

  const simulatePhotoUpload = async (file: File): Promise<string> => {
    console.log('📸 Simulazione upload per file:', file.name, 'size:', file.size)
    
    // Simula delay di upload
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Crea un URL locale per l'immagine caricata
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          console.log('📸 FileReader completato, risultato length:', result?.length || 0)
          resolve(result)
        }
        reader.onerror = (error) => {
          console.error('❌ Errore FileReader:', error)
          reject(error)
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error('❌ Errore nella simulazione upload:', error)
        reject(error)
      }
    })
  }

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null)
      setPreviewUrl(null)
      setDescription('')
      setUploadError(null)
      onClose()
    }
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Camera className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Verifica Challenge</h3>
                  <p className="text-sm text-gray-600">{challenge.title}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={isUploading}
                className="w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Istruzioni */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Come verificare la challenge</h4>
                    <p className="text-sm text-blue-800">
                      Carica una foto che dimostri il completamento della challenge "{challenge.title}".
                      La foto verrà esaminata dall'admin e riceverai una notifica con il risultato.
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Area */}
              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    selectedFile 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isUploading}
                  />
                  
                  {previewUrl ? (
                    <div className="space-y-3">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg mx-auto"
                      />
                      <div className="flex items-center justify-center space-x-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Foto selezionata</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Clicca per caricare una foto</p>
                        <p className="text-sm text-gray-500">PNG, JPG fino a 5MB</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Descrizione */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrizione (opzionale)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descrivi cosa mostra la foto e come dimostra il completamento della challenge..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                    disabled={isUploading}
                  />
                </div>

                {/* Error */}
                {uploadError && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{uploadError}</span>
                  </div>
                )}
              </div>

              {/* Test Button */}
              <div className="border-t border-gray-200 pt-4">
                <Button
                  variant="outline"
                  onClick={handleTestUpload}
                  disabled={isUploading}
                  className="w-full text-xs text-purple-600 hover:text-purple-700"
                >
                  🧪 Test Upload (per admin)
                </Button>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isUploading}
                  className="flex-1"
                >
                  Annulla
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Caricamento...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Invia per Verifica
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
