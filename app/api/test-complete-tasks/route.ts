import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    const { userId, challengeIds } = await request.json()
    
    if (!userId || !challengeIds || !Array.isArray(challengeIds)) {
      return NextResponse.json({ 
        success: false, 
        error: 'userId e challengeIds (array) sono richiesti' 
      }, { status: 400 })
    }

    console.log('🧪 Test completamento task per utente:', userId)
    console.log('🧪 Task da completare:', challengeIds)

    // Crea verifiche APPROVED per le task specificate
    const verifications = challengeIds.map(challengeId => ({
      challenge_id: challengeId,
      user_id: userId,
      photo_url: 'https://example.com/test-photo.jpg',
      photo_description: 'Test photo for challenge completion',
      status: 'APPROVED',
      submitted_at: new Date().toISOString(),
      reviewed_at: new Date().toISOString(),
      reviewed_by: 'test-admin'
    }))

    const { error } = await supabase
      .from('challenge_verifications')
      .insert(verifications)

    if (error) {
      console.error('❌ Errore nel completamento test task:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Errore nel completamento test task: ' + error.message 
      }, { status: 500 })
    }

    console.log('✅ Task completate per test:', challengeIds)
    return NextResponse.json({ 
      success: true, 
      message: `Task ${challengeIds.join(', ')} completate per test per utente ${userId}` 
    })

  } catch (error) {
    console.error('❌ Errore API test-complete-tasks POST:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Errore interno del server' 
    }, { status: 500 })
  }
}
