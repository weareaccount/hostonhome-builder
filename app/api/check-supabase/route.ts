import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Check configurazione Supabase...')
    
    // Controlla le variabili d'ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    const config = {
      supabaseUrl: supabaseUrl ? '✅ Configurato' : '❌ Mancante',
      supabaseAnonKey: supabaseAnonKey ? '✅ Configurato' : '❌ Mancante',
      supabaseServiceKey: supabaseServiceKey ? '✅ Configurato' : '❌ Mancante',
      urlValue: supabaseUrl || 'NON_CONFIGURATO',
      anonKeyLength: supabaseAnonKey?.length || 0,
      serviceKeyLength: supabaseServiceKey?.length || 0
    }
    
    console.log('📋 Configurazione:', config)
    
    return NextResponse.json({
      success: true,
      message: 'Configurazione Supabase verificata',
      config
    })

  } catch (error) {
    console.error('❌ Errore check Supabase:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 })
  }
}
