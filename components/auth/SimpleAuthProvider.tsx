'use client'

import React, { createContext, useContext, useState } from 'react'

interface SimpleAuthContextType {
  user: { id: string; email: string; created_at: string } | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined)

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string; created_at: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    // Simula login
    setTimeout(() => {
      setUser({
        id: '1',
        email: email,
        created_at: new Date().toISOString()
      })
      setLoading(false)
    }, 1000)
  }

  const signUp = async (email: string, password: string) => {
    setLoading(true)
    // Simula registrazione
    setTimeout(() => {
      setUser({
        id: '1',
        email: email,
        created_at: new Date().toISOString()
      })
      setLoading(false)
    }, 1000)
  }

  const signOut = async () => {
    setUser(null)
  }

  return (
    <SimpleAuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </SimpleAuthContext.Provider>
  )
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext)
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider')
  }
  return context
}
