import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Lista degli email degli amministratori autorizzati
const ADMIN_EMAILS = [
  'admin@hostonhome.com',
  'matteo@hostonhome.com',
  'support@hostonhome.com'
];

export async function GET(request: Request) {
  try {
    // Verifica autenticazione admin tramite sessione
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query params for pagination and filters
    const url = new URL(request.url);
    const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1);
    const perPage = Math.min(Math.max(parseInt(url.searchParams.get('perPage') || '20', 10), 1), 100);
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();
    const planFilter = (url.searchParams.get('plan') || '').toUpperCase(); // BASE | PLUS | PRO | ''
    const statusFilter = (url.searchParams.get('status') || '').toLowerCase(); // active | trial | expired | ''
    const period = url.searchParams.get('period') || ''; // 7d | 30d | 90d | 365d | ''
    const minSites = parseInt(url.searchParams.get('minSites') || '0', 10);

    // Verifica se abbiamo la configurazione Supabase
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      // Se Supabase non è configurato, ritorna dati demo per sviluppo
      return NextResponse.json({
        success: true,
        users: [
          {
            id: 'demo-user-1',
            email: 'demo@example.com',
            created_at: new Date().toISOString(),
            plan: 'BASE',
            last_login: new Date().toISOString(),
            sites_count: 0,
            subscription_status: 'trial',
            sites: []
          }
        ],
        total: 1,
        page,
        perPage,
        hasMore: false,
        message: 'Modalità demo - Supabase non configurato'
      });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Per ora, accetta qualsiasi token che inizia con 'admin_' come valido
    // (in produzione dovresti implementare una verifica più sicura)
    const token = authHeader.substring(7);
    if (!token.startsWith('admin_')) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Ottieni gli utenti autenticati paginati
    const { data: usersPage, error: usersError } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    
    if (usersError) {
      console.error('Errore nel recupero utenti:', usersError);
      throw usersError;
    }

    // Ottieni tutti i progetti dal database per gli utenti della pagina corrente
    const userIds = (usersPage?.users || []).map(u => u.id);
    const { data: pageProjects, error: projectsError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .in('user_id', userIds.length > 0 ? userIds : ['__none__'])
      .order('updated_at', { ascending: false });

    if (projectsError) {
      console.error('Errore nel recupero progetti:', projectsError);
    }

    // Mappa gli utenti con i loro progetti
    const usersMapped = (usersPage?.users || []).map(authUser => {
      // Trova tutti i progetti di questo utente
      const userProjects = (pageProjects || []).filter(project => project.user_id === authUser.id);
      
      // Trasforma i dati dei progetti per la dashboard admin
      const sites = userProjects.map(project => ({
        id: project.id,
        name: project.name,
        slug: project.slug,
        is_published: Boolean(project.is_published), // Il campo potrebbe non esistere
        created_at: project.created_at,
        last_updated: project.updated_at,
        sections_count: Array.isArray(project.sections) ? project.sections.length : 0,
        layout_type: project.layout_type || 'ELEGANTE',
        theme: project.theme || { accent: 'BLUE', font: 'INTER' }
      }));

      return {
        id: authUser.id,
        email: authUser.email || '',
        created_at: authUser.created_at,
        plan: authUser.user_metadata?.plan || 'BASE',
        last_login: authUser.last_sign_in_at,
        sites_count: sites.length,
        subscription_status: determineSubscriptionStatus(authUser),
        sites: sites
      };
    });

    // Applica i filtri richiesti lato server
    let filteredUsers = usersMapped;

    if (search) {
      filteredUsers = filteredUsers.filter(u =>
        u.email.toLowerCase().includes(search) ||
        u.sites.some(s => s.name?.toLowerCase().includes(search) || s.slug?.toLowerCase().includes(search))
      );
    }
    if (planFilter) {
      filteredUsers = filteredUsers.filter(u => (u.plan || 'BASE').toUpperCase() === planFilter);
    }
    if (statusFilter) {
      filteredUsers = filteredUsers.filter(u => u.subscription_status === statusFilter);
    }
    if (period) {
      const now = new Date();
      const threshold = new Date(now);
      if (period === '7d') threshold.setDate(now.getDate() - 7);
      if (period === '30d') threshold.setDate(now.getDate() - 30);
      if (period === '90d') threshold.setDate(now.getDate() - 90);
      if (period === '365d') threshold.setDate(now.getDate() - 365);
      filteredUsers = filteredUsers.filter(u => new Date(u.created_at) >= threshold);
    }
    if (!Number.isNaN(minSites) && minSites > 0) {
      filteredUsers = filteredUsers.filter(u => u.sites_count >= minSites);
    }

    // hasMore: controlla se esiste ancora un'altra pagina (senza filtri)
    let hasMore = false;
    try {
      const { data: nextPage } = await supabaseAdmin.auth.admin.listUsers({ page: page + 1, perPage });
      hasMore = Boolean(nextPage?.users && nextPage.users.length > 0);
    } catch {}

    return NextResponse.json({
      success: true,
      users: filteredUsers,
      total: filteredUsers.length,
      page,
      perPage,
      hasMore
    });

  } catch (error) {
    console.error('Error in admin users API:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Funzione helper per determinare lo stato dell'abbonamento
function determineSubscriptionStatus(user: any): 'active' | 'trial' | 'expired' {
  // Logica per determinare lo stato dell'abbonamento
  // Questa dovrebbe essere integrata con Stripe o il sistema di pagamento utilizzato
  
  const plan = user.user_metadata?.plan;
  const createdAt = new Date(user.created_at);
  const now = new Date();
  const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

  // Logica di esempio:
  if (plan === 'BASE' && daysSinceCreation > 30) {
    return 'expired';
  } else if (plan === 'BASE') {
    return 'trial';
  } else {
    return 'active';
  }
}

// API per ottenere statistiche aggregate
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.action === 'stats') {
      // Verifica autenticazione admin
      const authHeader = request.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Verifica admin access
      const token = authHeader.substring(7);
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
      
      if (authError || !user || !ADMIN_EMAILS.includes(user.email || '')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Ottieni statistiche
      const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers();
      const { data: allProjects } = await supabaseAdmin.from('projects').select('*');

      const stats = {
        total_users: allUsers?.users.length || 0,
        total_sites: allProjects?.length || 0,
        published_sites: allProjects?.filter(p => p.is_published).length || 0,
        active_subscriptions: allUsers?.users.filter(u => 
          u.user_metadata?.plan && u.user_metadata.plan !== 'BASE'
        ).length || 0,
        plans_distribution: {
          BASE: allUsers?.users.filter(u => (u.user_metadata?.plan || 'BASE') === 'BASE').length || 0,
          PLUS: allUsers?.users.filter(u => u.user_metadata?.plan === 'PLUS').length || 0,
          PRO: allUsers?.users.filter(u => u.user_metadata?.plan === 'PRO').length || 0,
        },
        recent_signups: allUsers?.users.filter(u => {
          const signupDate = new Date(u.created_at);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return signupDate > weekAgo;
        }).length || 0
      };

      return NextResponse.json({ success: true, stats });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error in admin stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
