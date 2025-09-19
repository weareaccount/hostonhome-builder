import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    console.log('🔍 Recupero verifiche admin (semplice)...')
    
    // Recupera tutte le verifiche in attesa
    const { data: verifications, error } = await supabase
      .from('challenge_verifications')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Errore recupero verifiche:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Errore nel recupero delle verifiche' 
      }, { status: 500 })
    }

    console.log('✅ Verifiche recuperate:', verifications?.length || 0)

    return NextResponse.json({ 
      success: true, 
      verifications: verifications || [],
      count: verifications?.length || 0
    })

  } catch (error) {
    console.error('❌ Errore API admin-verifications-simple:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Errore interno del server' 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, verificationId, adminId } = body
    
    console.log('🔧 Azione admin (semplice):', action, 'per verifica:', verificationId)
    
    if (!verificationId || !adminId) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID verifica e admin richiesti' 
      }, { status: 400 })
    }
    
    if (action === 'approve') {
      // Prima recupera i dati della verifica PRIMA di aggiornarla
      console.log('🔍 Recupero dati verifica per notifica:', verificationId)
      const { data: verification, error: verificationError } = await supabase
        .from('challenge_verifications')
        .select('user_id, challenge_id')
        .eq('id', verificationId)
        .single()

      if (verificationError) {
        console.error('❌ Errore nel recupero dati verifica:', verificationError)
        return NextResponse.json({ 
          success: false, 
          error: 'Errore nel recupero dati verifica: ' + verificationError.message
        }, { status: 500 })
      }

      console.log('📋 Dati verifica recuperati:', verification)

      // Approva la verifica
      const { error } = await supabase
        .from('challenge_verifications')
        .update({ 
          status: 'APPROVED',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', verificationId)

      if (error) {
        console.error('❌ Errore approvazione:', error)
        return NextResponse.json({ 
          success: false, 
          error: 'Errore nell\'approvazione: ' + error.message
        }, { status: 500 })
      }

      // Crea notifica per l'utente
      console.log('📝 Creazione notifica per utente:', verification.user_id)
      const { error: notificationError } = await supabase
        .from('user_notifications')
        .insert({
          user_id: verification.user_id,
          type: 'VERIFICATION_APPROVED',
          title: 'Verifica approvata!',
          message: 'La tua verifica è stata approvata. Hai sbloccato un nuovo badge!',
          is_read: false,
          created_at: new Date().toISOString()
        })

      if (notificationError) {
        console.error('❌ Errore nella creazione notifica:', notificationError)
      } else {
        console.log('✅ Notifica creata con successo')
      }

      console.log('✅ Verifica approvata e stato challenge aggiornato')
      return NextResponse.json({ success: true, message: 'Verifica approvata' })

    } else if (action === 'reject') {
      // Prima recupera i dati della verifica PRIMA di aggiornarla
      console.log('🔍 Recupero dati verifica per notifica (rifiuto):', verificationId)
      const { data: verification, error: verificationError } = await supabase
        .from('challenge_verifications')
        .select('user_id, challenge_id')
        .eq('id', verificationId)
        .single()

      if (verificationError) {
        console.error('❌ Errore nel recupero dati verifica:', verificationError)
        return NextResponse.json({ 
          success: false, 
          error: 'Errore nel recupero dati verifica: ' + verificationError.message
        }, { status: 500 })
      }

      console.log('📋 Dati verifica recuperati (rifiuto):', verification)

      // Rifiuta la verifica
      const { error } = await supabase
        .from('challenge_verifications')
        .update({ 
          status: 'REJECTED',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', verificationId)

      if (error) {
        console.error('❌ Errore rifiuto:', error)
        return NextResponse.json({ 
          success: false, 
          error: 'Errore nel rifiuto: ' + error.message
        }, { status: 500 })
      }

      // Crea notifica per l'utente
      console.log('📝 Creazione notifica per utente (rifiuto):', verification.user_id)
      const { error: notificationError } = await supabase
        .from('user_notifications')
        .insert({
          user_id: verification.user_id,
          type: 'VERIFICATION_REJECTED',
          title: 'Verifica rifiutata',
          message: 'La tua verifica è stata rifiutata. Riprova con una foto migliore.',
          is_read: false,
          created_at: new Date().toISOString()
        })

      if (notificationError) {
        console.error('❌ Errore nella creazione notifica (rifiuto):', notificationError)
      } else {
        console.log('✅ Notifica creata con successo (rifiuto)')
      }

      console.log('✅ Verifica rifiutata e stato challenge aggiornato')
      return NextResponse.json({ success: true, message: 'Verifica rifiutata' })
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Azione non valida' 
    }, { status: 400 })

  } catch (error) {
    console.error('❌ Errore API admin-verifications-simple POST:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Errore interno del server: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
