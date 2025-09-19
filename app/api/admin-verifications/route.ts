import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    console.log('🔍 Recupero verifiche admin...')
    
    // Recupera tutte le verifiche in attesa
    const { data: verifications, error } = await supabase
      .from('challenge_verifications')
      .select(`
        *,
        admin_notifications!inner(
          id,
          title,
          message,
          photo_url,
          is_read,
          created_at
        )
      `)
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
    console.error('❌ Errore API admin-verifications:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Errore interno del server' 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { action, verificationId, adminId } = await request.json()
    
    console.log('🔧 Azione admin:', action, 'per verifica:', verificationId)
    
    if (action === 'approve') {
      // Approva la verifica
      const { error } = await supabase
        .from('challenge_verifications')
        .update({ 
          status: 'APPROVED',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', verificationId)

      if (error) {
        console.error('❌ Errore approvazione:', error)
        return NextResponse.json({ 
          success: false, 
          error: 'Errore nell\'approvazione' 
        }, { status: 500 })
      }

      // Crea notifica per l'utente
      const { data: verification } = await supabase
        .from('challenge_verifications')
        .select('user_id, challenge_id')
        .eq('id', verificationId)
        .single()

      if (verification) {
        await supabase
          .from('user_notifications')
          .insert({
            user_id: verification.user_id,
            type: 'VERIFICATION_APPROVED',
            title: 'Verifica approvata!',
            message: 'La tua verifica è stata approvata. Hai sbloccato un nuovo badge!',
            is_read: false,
            created_at: new Date().toISOString()
          })
      }

      console.log('✅ Verifica approvata')
      return NextResponse.json({ success: true, message: 'Verifica approvata' })

    } else if (action === 'reject') {
      // Rifiuta la verifica
      const { error } = await supabase
        .from('challenge_verifications')
        .update({ 
          status: 'REJECTED',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', verificationId)

      if (error) {
        console.error('❌ Errore rifiuto:', error)
        return NextResponse.json({ 
          success: false, 
          error: 'Errore nel rifiuto' 
        }, { status: 500 })
      }

      // Crea notifica per l'utente
      const { data: verification } = await supabase
        .from('challenge_verifications')
        .select('user_id, challenge_id')
        .eq('id', verificationId)
        .single()

      if (verification) {
        await supabase
          .from('user_notifications')
          .insert({
            user_id: verification.user_id,
            type: 'VERIFICATION_REJECTED',
            title: 'Verifica rifiutata',
            message: 'La tua verifica è stata rifiutata. Riprova con una foto migliore.',
            is_read: false,
            created_at: new Date().toISOString()
          })
      }

      console.log('✅ Verifica rifiutata')
      return NextResponse.json({ success: true, message: 'Verifica rifiutata' })
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Azione non valida' 
    }, { status: 400 })

  } catch (error) {
    console.error('❌ Errore API admin-verifications POST:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Errore interno del server' 
    }, { status: 500 })
  }
}
