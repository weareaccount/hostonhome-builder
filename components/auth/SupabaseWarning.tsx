'use client'

import React from 'react'
import { AlertTriangle } from 'lucide-react'

export function SupabaseWarning() {
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (isSupabaseConfigured) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md shadow-lg">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-yellow-800">
            Supabase non configurato
          </h3>
          <p className="text-sm text-yellow-700 mt-1">
            Per utilizzare tutte le funzionalità, configura Supabase seguendo la guida in{' '}
            <code className="bg-yellow-100 px-1 rounded text-xs">SUPABASE_SETUP.md</code>
          </p>
          <div className="mt-3 text-xs text-yellow-600">
            <p>1. Crea un progetto su supabase.com</p>
            <p>2. Crea il file .env.local con le credenziali</p>
            <p>3. Esegui lo schema SQL nel database</p>
          </div>
        </div>
      </div>
    </div>
  )
}
