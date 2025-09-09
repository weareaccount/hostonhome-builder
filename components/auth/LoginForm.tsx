'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { STRIPE_PRICING } from '@/lib/constants'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [plan, setPlan] = useState<'BASE' | 'PLUS' | 'PRO' | ''>('')
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  
  const { signIn, signUp, user } = useAuth()

  // Redirect se l'utente è già loggato
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  // Se si ritorna dal checkout con successo, completa la registrazione
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const checkoutStatus = params.get('checkout')
    const sessionId = params.get('session_id')
    const selectedPlan = params.get('plan') as 'BASE' | 'PLUS' | 'PRO' | null
    const selectedInterval = (params.get('interval') as 'monthly' | 'yearly' | null) || 'monthly'
    const storedEmail = params.get('email') || window.sessionStorage.getItem('pending_email') || ''
    const storedPassword = window.sessionStorage.getItem('pending_password') || ''

    if (checkoutStatus === 'success' && sessionId) {
      ;(async () => {
        try {
          const resp = await fetch('/api/stripe/verify-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          })
          const data = await resp.json()
          if (data.valid) {
            // Completa la registrazione
            if (storedEmail && storedPassword) {
              await signUp(storedEmail, storedPassword, {
                plan: selectedPlan || plan || 'BASE',
                stripeCustomerId: data.customerId || null,
                stripeSubscriptionId: data.subscriptionId || null,
                subscriptionStatus: data.status || 'active',
                currentPeriodStart: data.periodStart || null,
                currentPeriodEnd: data.periodEnd || null,
              })
              window.sessionStorage.removeItem('pending_email')
              window.sessionStorage.removeItem('pending_password')
              router.replace('/dashboard')
            }
          } else {
            setError('Verifica pagamento fallita. Riprova.')
          }
        } catch (e: any) {
          setError(e.message)
        }
      })()
    }
  }, [router, signUp])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        await signIn(email, password)
        // Il redirect avverrà automaticamente tramite useEffect
      } else {
        if (!plan) {
          throw new Error('Seleziona un piano di abbonamento per registrarti')
        }
        // Prima di creare l'account, avvia il checkout Stripe
        window.sessionStorage.setItem('pending_email', email)
        window.sessionStorage.setItem('pending_password', password)
        const resp = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan,
            interval,
            metadata: { email },
            // Dopo pagamento torneremo alla login, dove completiamo signup
            successUrl: `${window.location.origin}/login?checkout=success&plan=${plan}&interval=${interval}&email=${encodeURIComponent(email)}`,
            cancelUrl: `${window.location.origin}/login?checkout=cancel`,
          }),
        })
        if (!resp.ok) {
          const { error } = await resp.json()
          throw new Error(error || 'Impossibile iniziare il checkout')
        }
        const { url } = await resp.json()
        window.location.href = url
        return
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Se Supabase non è configurato, mostra un messaggio informativo
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Configurazione Richiesta
            </h2>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Supabase non configurato
                </h3>
                <p className="text-yellow-700 mb-4">
                  Per utilizzare l'autenticazione e salvare i tuoi progetti, devi configurare Supabase.
                </p>
                <div className="bg-white rounded-md p-4 border border-yellow-200">
                  <h4 className="font-medium text-gray-900 mb-2">Passi per configurare:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    <li>Crea un progetto su <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a></li>
                    <li>Crea il file <code className="bg-gray-100 px-1 rounded">.env.local</code> nella root del progetto</li>
                    <li>Aggiungi le credenziali Supabase al file</li>
                    <li>Esegui lo schema SQL nel database Supabase</li>
                    <li>Riavvia il server di sviluppo</li>
                  </ol>
                </div>
                <p className="text-sm text-yellow-600 mt-4">
                  Vedi il file <code className="bg-yellow-100 px-1 rounded">SUPABASE_SETUP.md</code> per istruzioni dettagliate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Accedi al tuo account' : 'Crea un nuovo account'}
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Indirizzo email"
              className="mb-3"
            />
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="mb-3"
            />
          </div>

          {!isLogin && (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <button
                  type="button"
                  className={`px-4 py-2 rounded border ${plan === 'BASE' ? 'border-blue-600 text-blue-700' : 'border-gray-300 text-gray-700'}`}
                  onClick={() => setPlan('BASE')}
                >
                  Base — €{(STRIPE_PRICING.BASE[interval] / 100).toFixed(2)}
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded border ${plan === 'PLUS' ? 'border-blue-600 text-blue-700' : 'border-gray-300 text-gray-700'}`}
                  onClick={() => setPlan('PLUS')}
                >
                  Avanzato — €{(STRIPE_PRICING.PLUS[interval] / 100).toFixed(2)}
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded border ${plan === 'PRO' ? 'border-blue-600 text-blue-700' : 'border-gray-300 text-gray-700'}`}
                  onClick={() => setPlan('PRO')}
                >
                  Pro — €{(STRIPE_PRICING.PRO[interval] / 100).toFixed(2)}
                </button>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <label className={`cursor-pointer ${interval === 'monthly' ? 'font-semibold' : ''}`}>
                  <input type="radio" name="interval" value="monthly" checked={interval==='monthly'} onChange={() => setInterval('monthly')} className="mr-2"/>
                  Mensile
                </label>
                <label className={`cursor-pointer ${interval === 'yearly' ? 'font-semibold' : ''}`}>
                  <input type="radio" name="interval" value="yearly" checked={interval==='yearly'} onChange={() => setInterval('yearly')} className="mr-2"/>
                  Annuale
                </label>
              </div>
              <p className="text-center text-sm text-gray-600">Seleziona un piano per procedere con la registrazione.</p>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Caricamento...' : (isLogin ? 'Accedi' : 'Registrati')}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-500"
            >
              {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
