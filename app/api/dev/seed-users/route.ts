import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// WARNING: endpoint di sviluppo. Proteggilo o rimuovilo in produzione.

export async function POST() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: 'Supabase non configurato' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const users = [
    { email: 'base@example.com', password: 'Password123!', plan: 'BASE' },
    { email: 'plus@example.com', password: 'Password123!', plan: 'PLUS' },
    { email: 'pro@example.com', password: 'Password123!', plan: 'PRO' },
  ] as const

  const results: any[] = []

  for (const u of users) {
    // Crea utente
    const { data: signupData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { plan: u.plan },
    })

    if (signUpError) {
      results.push({ email: u.email, error: signUpError.message })
      continue
    }

    results.push({ email: u.email, userId: signupData.user?.id, plan: u.plan })
  }

  return NextResponse.json({ ok: true, results })
}


