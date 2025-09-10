'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from './AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { STRIPE_PRICING } from '@/lib/constants'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Sparkles, ArrowRight } from 'lucide-react'
import { sendWelcomeEmail } from '@/lib/email'

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [plan, setPlan] = useState<'BASE' | 'PLUS' | 'PRO' | ''>('')
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()
  
  const { signIn, signUp, user } = useAuth()

  const formatEuro = (cents: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(cents / 100)

  const yearlySavingsInfo = useMemo(() => {
    const entries: Array<{ key: 'BASE' | 'PLUS' | 'PRO'; saveEuro: number; savePct: number }> = ['BASE','PLUS','PRO']
      .map((k) => {
        const monthly = STRIPE_PRICING[k as 'BASE' | 'PLUS' | 'PRO'].monthly
        const yearly = STRIPE_PRICING[k as 'BASE' | 'PLUS' | 'PRO'].yearly
        const save = Math.max(0, monthly * 12 - yearly)
        const pct = monthly * 12 > 0 ? Math.round((save / (monthly * 12)) * 100) : 0
        return { key: k as 'BASE' | 'PLUS' | 'PRO', saveEuro: save, savePct: pct }
      })
    const max = entries.reduce((a, b) => (b.saveEuro > a.saveEuro ? b : a), entries[0])
    return { entries, max }
  }, [])

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
    const registered = params.get('registered')
    
    // ✅ Mostra messaggio di successo se l'utente è stato registrato
    if (registered === 'true') {
      setError('') // Pulisci eventuali errori precedenti
      setSuccessMessage('✅ Account creato con successo! Ora puoi accedere con le tue credenziali.')
      // Nascondi il messaggio dopo 5 secondi
      setTimeout(() => {
        setSuccessMessage('')
      }, 5000)
    }

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
                subscriptionStatus: data.status || 'trialing',
                currentPeriodStart: data.periodStart || null,
                currentPeriodEnd: data.periodEnd || null,
              })
              
              // ✅ Invia email di benvenuto
              try {
                const planName = selectedPlan || plan || 'BASE'
                await sendWelcomeEmail(storedEmail, planName, 7)
                console.log('✅ Email di benvenuto inviata a:', storedEmail)
              } catch (emailError) {
                console.error('❌ Errore invio email di benvenuto:', emailError)
                // Non bloccare il flusso se l'email fallisce
              }
              
              window.sessionStorage.removeItem('pending_email')
              window.sessionStorage.removeItem('pending_password')
              
              // ✅ Se l'utente è già autenticato, vai alla dashboard
              if (user) {
                router.replace('/dashboard')
              } else {
                // ✅ Altrimenti reindirizza al login per completare l'autenticazione
                router.replace('/login?registered=true')
              }
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
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colonna sinistra: claim e benefit */}
        <div className="hidden lg:flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <Image src="/logo-hostonhome.png" alt="HostOnHome" width={160} height={36} priority />
            <span className="sr-only">HostOnHome</span>
          </div>
          <h1 className="text-3xl xl:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
            Crea il tuo sito personalizzato,
            visibile su Google.
          </h1>
          <p className="text-gray-600 text-base mb-6">
            Inizia a ricevere prenotazioni senza commissioni, pagando solo il costo di un semplice dominio.
          </p>
          
          {/* ✅ Banner Trial Period Promozionale */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🎉</div>
              <div>
                <div className="text-lg font-bold text-green-900">7 GIORNI GRATIS</div>
                <div className="text-sm text-green-700">
                  Prova tutti i piani senza impegno. Nessun pagamento richiesto durante il trial.
                </div>
              </div>
            </div>
          </div>
          
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2 text-gray-700"><Check className="w-4 h-4 text-green-600 mt-0.5"/>Tema professionale e sezioni pronte</li>
            <li className="flex items-start gap-2 text-gray-700"><Check className="w-4 h-4 text-green-600 mt-0.5"/>Editor semplice, anteprima in tempo reale</li>
            <li className="flex items-start gap-2 text-gray-700"><Check className="w-4 h-4 text-green-600 mt-0.5"/>Nessuna commissione sulle prenotazioni</li>
            <li className="flex items-start gap-2 text-gray-700"><Check className="w-4 h-4 text-green-600 mt-0.5"/>7 giorni di prova gratuita per tutti i piani</li>
          </ul>
        </div>

        {/* Colonna destra: Card form */}
        <div className="w-full">
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Image src="/logo-hostonhome.png" alt="HostOnHome" width={140} height={32} />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Accedi al tuo account' : 'Crea un nuovo account'}
            </h2>
            {!isLogin && (
              <p className="text-gray-600 text-sm mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500"/>
                Crea il tuo sito e inizia a ricevere prenotazioni oggi stesso.
              </p>
            )}

            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Indirizzo email"
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full"
                />
              </div>

              <AnimatePresence>
              {!isLogin && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }} className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>Fatturazione</span>
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-full p-1">
                      <button type="button" onClick={() => setInterval('monthly')} className={`px-3 py-1 rounded-full ${interval==='monthly' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}>Mensile</button>
                      <button type="button" onClick={() => setInterval('yearly')} className={`px-3 py-1 rounded-full ${interval==='yearly' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}>Annuale</button>
                    </div>
                    {interval==='yearly' && (
                      <span className="ml-1 text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                        Risparmi fino a {yearlySavingsInfo.max.savePct}%
                      </span>
                    )}
                  </div>

                  {/* ✅ Banner Trial Period */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🎉</div>
                      <div>
                        <div className="text-sm font-bold text-blue-900">7 GIORNI GRATIS</div>
                        <div className="text-xs text-blue-700">
                          Prova tutti i piani senza impegno. Nessun pagamento richiesto durante il trial.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(['BASE','PLUS','PRO'] as const).map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setPlan(k)}
                        className={`text-left rounded-xl border p-4 transition-all ${plan===k ? 'border-blue-600 ring-2 ring-blue-100 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                      >
                        <div className="text-sm font-semibold text-gray-900 mb-1">{k === 'BASE' ? 'Base' : k === 'PLUS' ? 'Avanzato' : 'Pro'}</div>
                        <div className="text-gray-700 mb-1">
                          {formatEuro(STRIPE_PRICING[k][interval])}
                          {interval==='yearly' && yearlySavingsInfo.entries.find(e => e.key===k)?.saveEuro ? (
                            <span className="ml-2 text-xs text-green-700">- {formatEuro(yearlySavingsInfo.entries.find(e => e.key===k)!.saveEuro)}</span>
                          ) : null}
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          ✅ 7 giorni gratis
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-xs text-gray-600">
                    Seleziona un piano per iniziare la tua prova gratuita di 7 giorni.
                  </p>
                </motion.div>
              )}
              </AnimatePresence>

              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}
              
              {successMessage && (
                <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-lg border border-green-200">
                  {successMessage}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2">
                {loading ? 'Caricamento...' : (isLogin ? 'Accedi' : 'Inizia prova gratuita')}
                {!loading && <ArrowRight className="w-4 h-4"/>}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
                </button>
              </div>

              <div className="text-center text-xs text-gray-500">
                Registrandoti accetti i Termini e l'Informativa Privacy.
                {!isLogin && (
                  <div className="mt-2 text-xs text-blue-600">
                    Al termine dei 7 giorni gratuiti, l'abbonamento si attiverà automaticamente.
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
