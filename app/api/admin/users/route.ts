import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variabili Supabase mancanti')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Admin: Connessione diretta a Supabase per recuperare utenti...')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Configurazione Supabase mancante',
        users: [],
        totalUsers: 0,
        totalProjects: 0,
        activeUsers: 0
      }, { status: 500 })
    }
    
    // Recupera tutti gli utenti da Supabase Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Errore nel recupero utenti Auth:', authError)
      return NextResponse.json({
        success: false,
        error: 'Errore nel recupero utenti da Supabase',
        users: [],
        totalUsers: 0,
        totalProjects: 0,
        activeUsers: 0
      }, { status: 500 })
    }
    
    console.log('👥 Utenti trovati in Supabase Auth:', authUsers?.users?.length || 0)
    
    if (!authUsers?.users || authUsers.users.length === 0) {
      return NextResponse.json({
        success: true,
        users: [],
        totalUsers: 0,
        totalProjects: 0,
        activeUsers: 0,
        message: 'Nessun utente trovato in Supabase'
      })
    }
    
    // Recupera anche i progetti per ogni utente
    const usersWithProjects = await Promise.all(
      authUsers.users.map(async (user) => {
        try {
          // Recupera progetti dell'utente
          const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', user.id)
          
          if (projectsError) {
            console.error(`❌ Errore nel recupero progetti per ${user.id}:`, projectsError)
          }
          
          // Recupera verifiche dell'utente per calcolare statistiche
          const { data: verifications, error: verificationsError } = await supabase
            .from('challenge_verifications')
            .select('*')
            .eq('user_id', user.id)
          
          if (verificationsError) {
            console.error(`❌ Errore nel recupero verifiche per ${user.id}:`, verificationsError)
          }
          
          const completedChallenges = verifications?.filter(v => v.status === 'APPROVED').length || 0
          const pendingChallenges = verifications?.filter(v => v.status === 'PENDING').length || 0
          
          return {
            id: user.id,
            email: user.email || 'N/A',
            name: user.user_metadata?.full_name || user.user_metadata?.name || `Utente ${user.id.slice(0, 8)}`,
            phone: user.phone || undefined,
            status: user.email_confirmed_at ? 'active' : 'inactive',
            role: projects && projects.length > 2 ? 'premium' : 'user',
            joinedAt: new Date(user.created_at),
            lastActive: new Date(user.last_sign_in_at || user.created_at),
            challengesCompleted: completedChallenges,
            badgesEarned: Math.floor(completedChallenges / 4),
            sitesCreated: projects?.length || 0,
            projects: projects || [],
            emailConfirmed: !!user.email_confirmed_at,
            lastSignIn: user.last_sign_in_at ? new Date(user.last_sign_in_at) : null
          }
        } catch (error) {
          console.error(`❌ Errore nel processamento utente ${user.id}:`, error)
          return {
            id: user.id,
            email: user.email || 'N/A',
            name: `Utente ${user.id.slice(0, 8)}`,
            phone: undefined,
            status: 'inactive',
            role: 'user',
            joinedAt: new Date(user.created_at),
            lastActive: new Date(user.created_at),
            challengesCompleted: 0,
            badgesEarned: 0,
            sitesCreated: 0,
            projects: [],
            emailConfirmed: false,
            lastSignIn: null
          }
        }
      })
    )
    
    // Ordina per ultima attività
    usersWithProjects.sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime())
    
    const totalUsers = usersWithProjects.length
    const activeUsers = usersWithProjects.filter(u => u.status === 'active').length
    const totalProjects = usersWithProjects.reduce((sum, user) => sum + user.sitesCreated, 0)
    
    console.log('✅ Admin: Utenti caricati con successo da Supabase')
    console.log(`📊 Statistiche: ${totalUsers} utenti totali, ${activeUsers} attivi, ${totalProjects} progetti`)
    
    return NextResponse.json({
      success: true,
      users: usersWithProjects,
      totalUsers,
      totalProjects,
      activeUsers,
      message: `Caricati ${totalUsers} utenti da Supabase`
    })
    
  } catch (error) {
    console.error('❌ Errore nell\'API admin/users:', error)
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server',
      users: [],
      totalUsers: 0,
      totalProjects: 0,
      activeUsers: 0
    }, { status: 500 })
  }
}