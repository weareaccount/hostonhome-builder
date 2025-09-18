import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test connessione Supabase...')
    
    // Test connessione base
    const { data, error } = await supabaseAdmin
      .from('challenge_verifications')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Errore connessione Supabase:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        hint: error.hint
      }, { status: 500 })
    }

    console.log('✅ Connessione Supabase OK')
    
    // Test inserimento
    const testVerification = {
      user_id: 'test-user-id',
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
        connection: 'OK'
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
      message: 'Supabase configurato correttamente',
      testId: insertData.id
    })

  } catch (error) {
    console.error('❌ Errore test Supabase:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 })
  }
}
