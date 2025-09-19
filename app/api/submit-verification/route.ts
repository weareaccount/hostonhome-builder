import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { userId, challengeId, photoUrl, description } = await request.json()
    
    console.log('📤 Nuova verifica ricevuta:', { userId, challengeId, photoUrl })
    
    // 1. Salva la verifica nella tabella challenge_verifications
    const { data: verification, error: verificationError } = await supabase
      .from('challenge_verifications')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        photo_url: photoUrl,
        photo_description: description || '',
        status: 'PENDING',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (verificationError) {
      console.error('❌ Errore salvataggio verifica:', verificationError)
      return NextResponse.json({ 
        success: false, 
        error: 'Errore nel salvataggio della verifica' 
      }, { status: 500 })
    }

    console.log('✅ Verifica salvata:', verification.id)
    console.log('📋 Dettagli verifica salvata:', {
      id: verification.id,
      user_id: verification.user_id,
      challenge_id: verification.challenge_id,
      status: verification.status,
      submitted_at: verification.submitted_at
    })

    // 2. Crea notifica per admin
    const { error: notificationError } = await supabase
      .from('admin_notifications')
      .insert({
        type: 'CHALLENGE_VERIFICATION',
        user_id: userId,
        challenge_id: challengeId,
        verification_id: verification.id,
        title: 'Nuova verifica challenge',
        message: `L'utente ha inviato una foto per verificare il completamento della challenge.`,
        photo_url: photoUrl,
        is_read: false,
        created_at: new Date().toISOString()
      })

    if (notificationError) {
      console.error('❌ Errore creazione notifica:', notificationError)
      // Non blocchiamo il processo se la notifica fallisce
    } else {
      console.log('✅ Notifica admin creata')
    }

    return NextResponse.json({ 
      success: true, 
      verificationId: verification.id,
      message: 'Verifica inviata con successo' 
    })

  } catch (error) {
    console.error('❌ Errore API submit-verification:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Errore interno del server' 
    }, { status: 500 })
  }
}
