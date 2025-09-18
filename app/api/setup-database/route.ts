import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Setup database Supabase...')
    

    // Crea le tabelle una per una
    const queries = [
      `CREATE TABLE IF NOT EXISTS public.challenge_verifications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        challenge_id TEXT NOT NULL,
        photo_url TEXT NOT NULL,
        photo_description TEXT,
        status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        reviewed_at TIMESTAMP WITH TIME ZONE,
        reviewed_by UUID REFERENCES auth.users(id),
        rejection_reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS public.admin_notifications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        type TEXT NOT NULL CHECK (type IN ('CHALLENGE_VERIFICATION', 'USER_REGISTRATION', 'SUBSCRIPTION_UPDATE')),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        challenge_id TEXT,
        verification_id UUID REFERENCES public.challenge_verifications(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        photo_url TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS public.user_notifications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('CHALLENGE_APPROVED', 'CHALLENGE_REJECTED', 'BADGE_UNLOCKED', 'SUBSCRIPTION_UPDATE')),
        challenge_id TEXT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`
    ]

    // Esegui le query una per una
    for (const query of queries) {
      const { error } = await supabaseAdmin.rpc('exec_sql', { sql: query })
      if (error) {
        console.error('❌ Errore nella creazione tabella:', error)
        return NextResponse.json({
          success: false,
          error: error.message,
          hint: error.hint,
          query: query.substring(0, 100) + '...'
        }, { status: 500 })
      }
    }

    console.log('✅ Tabelle create con successo')

    // Test inserimento
    const testVerification = {
      user_id: '00000000-0000-0000-0000-000000000000',
      challenge_id: 'test-challenge',
      photo_url: 'test-photo-url',
      photo_description: 'Test verification',
      status: 'PENDING'
    }

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('challenge_verifications')
      .insert([testVerification])
      .select()
      .single()

    if (insertError) {
      console.error('❌ Errore inserimento test:', insertError)
      return NextResponse.json({
        success: false,
        error: insertError.message,
        hint: insertError.hint,
        schema: 'Created'
      }, { status: 500 })
    }

    console.log('✅ Inserimento test OK:', insertData.id)

    // Cancella il test
    await supabaseAdmin
      .from('challenge_verifications')
      .delete()
      .eq('id', insertData.id)

    return NextResponse.json({
      success: true,
      message: 'Database configurato correttamente',
      testId: insertData.id
    })

  } catch (error) {
    console.error('❌ Errore setup database:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 })
  }
}
