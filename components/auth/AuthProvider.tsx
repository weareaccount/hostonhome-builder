'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, User } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Controlla se Supabase è configurato
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase non è configurato. Crea il file .env.local con le credenziali Supabase.')
      setLoading(false)
      return
    }

    // Controlla lo stato dell'autenticazione all'avvio
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const plan = (session.user.user_metadata as any)?.plan
          setUser({
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at,
            plan,
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Supabase non è configurato. Crea il file .env.local con le credenziali.')
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    // Il redirect avverrà automaticamente tramite onAuthStateChange
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Supabase non è configurato. Crea il file .env.local con le credenziali.')
    }
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password, 
      options: { 
        data: metadata || {},
        emailRedirectTo: `${window.location.origin}/dashboard`
      } 
    })
    if (error) throw error
    
    // ✅ Se la registrazione è completata, autentica automaticamente l'utente
    if (data.user && data.session) {
      setUser({
        id: data.user.id,
        email: data.user.email!,
        created_at: data.user.created_at,
        plan: (data.user.user_metadata as any)?.plan,
      })
    }
  }

  const signOut = async () => {
    // Effettua il sign out da Supabase (se configurato), poi pulisci lo storage e reindirizza
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      }
    } finally {
      try {
        // Pulisci eventuali dati locali della sessione
        localStorage.removeItem('admin_session')
        localStorage.removeItem('pending_email')
        localStorage.removeItem('pending_password')
      } catch {}
      // Reindirizza sempre alla pagina di login utente
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
