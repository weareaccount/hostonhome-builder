'use client';

import React, { useState, useEffect } from 'react';
import { AdminGuard, adminLogout } from '@/components/auth/AdminGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Users, 
  Globe, 
  Search, 
  Eye, 
  Activity,
  Calendar,
  CreditCard,
  BarChart3,
  Shield,
  Lock,
  Crown,
  User,
  Building,
  LogOut,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  UserCheck,
  LineChart
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  plan: 'BASE' | 'PLUS' | 'PRO';
  last_login?: string;
  sites_count: number;
  subscription_status: 'active' | 'expired' | 'trial';
  sites: SiteData[];
}

interface SiteData {
  id: string;
  name: string;
  slug: string;
  is_published: boolean;
  created_at: string;
  last_updated: string;
  sections_count: number;
  layout_type: string;
  theme: any;
}

// Ora useremo dati reali tramite API

function AdminDashboardContent() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Paginazione
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(6);
  
  // Filtri avanzati
  const [filters, setFilters] = useState({
    plan: 'ALL',
    subscription_status: 'ALL',
    sites_count: 'ALL',
    created_period: 'ALL'
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Analytics
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSites: 0,
    publishedSites: 0,
    activeSubscriptions: 0,
    monthlyGrowth: 0,
    revenue: 0
  });

  useEffect(() => {
    // Carica i dati degli utenti
    loadUsersData();
  }, []);

  const loadUsersData = async () => {
    setIsLoadingData(true);
    try {
      // Ottieni la sessione admin
      const sessionData = localStorage.getItem('admin_session');
      if (!sessionData) {
        throw new Error('Sessione admin non trovata');
      }

      const session = JSON.parse(sessionData);
      
      // Chiama l'API per ottenere i dati degli utenti reali
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${session.sessionId}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Errore API: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
        calculateAnalytics(data.users);
      } else {
        throw new Error(data.error || 'Errore nel caricamento dati');
      }
    } catch (error) {
      console.error('Errore nel caricamento degli utenti:', error);
      // Mostra un errore all'utente
      alert('Errore nel caricamento dei dati utenti. Verifica la connessione.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const calculateAnalytics = (usersData: UserData[]) => {
    const totalUsers = usersData.length;
    const activeUsers = usersData.filter(u => u.subscription_status === 'active').length;
    const totalSites = usersData.reduce((acc, user) => acc + user.sites_count, 0);
    const publishedSites = usersData.reduce((acc, user) => 
      acc + user.sites.filter(site => site.is_published).length, 0
    );
    const activeSubscriptions = usersData.filter(u => u.subscription_status === 'active').length;
    const monthlyGrowth = 12.5; // Calcolabile con dati storici
    const revenue = activeSubscriptions * 29.99; // Base sui piani

    setAnalytics({
      totalUsers,
      activeUsers,
      totalSites,
      publishedSites,
      activeSubscriptions,
      monthlyGrowth,
      revenue
    });
  };

  // Funzione di filtraggio
  const applyFilters = (usersData: UserData[]) => {
    let filtered = usersData;

    // Filtro per piano
    if (filters.plan !== 'ALL') {
      filtered = filtered.filter(user => user.plan === filters.plan);
    }

    // Filtro per stato abbonamento
    if (filters.subscription_status !== 'ALL') {
      filtered = filtered.filter(user => user.subscription_status === filters.subscription_status);
    }

    // Filtro per numero siti
    if (filters.sites_count !== 'ALL') {
      if (filters.sites_count === '0') {
        filtered = filtered.filter(user => user.sites_count === 0);
      } else if (filters.sites_count === '1-3') {
        filtered = filtered.filter(user => user.sites_count >= 1 && user.sites_count <= 3);
      } else if (filters.sites_count === '4+') {
        filtered = filtered.filter(user => user.sites_count >= 4);
      }
    }

    // Filtro per periodo creazione
    if (filters.created_period !== 'ALL') {
      const now = new Date();
      const dateThreshold = new Date();
      
      if (filters.created_period === '7d') {
        dateThreshold.setDate(now.getDate() - 7);
      } else if (filters.created_period === '30d') {
        dateThreshold.setDate(now.getDate() - 30);
      } else if (filters.created_period === '90d') {
        dateThreshold.setDate(now.getDate() - 90);
      }
      
      filtered = filtered.filter(user => new Date(user.created_at) >= dateThreshold);
    }

    return filtered;
  };

  // Applica filtri e ricerca
  const filteredUsers = applyFilters(users).filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.sites.some(site => 
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Calcola paginazione
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'PRO': return 'text-purple-600 bg-purple-100';
      case 'PLUS': return 'text-blue-600 bg-blue-100';
      case 'BASE': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'trial': return 'text-yellow-600 bg-yellow-100';
      case 'expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const viewUserSite = (siteSlug: string) => {
    // Visualizza il sito pubblicato
    window.open(`/sites/${siteSlug}`, '_blank');
  };


  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento dashboard amministratori...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard Amministratori</h1>
                <p className="text-sm text-gray-500">Gestione utenti e siti</p>
              </div>
            </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span>Pannello Amministratori</span>
                </div>
                <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                  Dashboard Utente
                </Button>
                <Button variant="outline" onClick={adminLogout} className="text-red-600 border-red-600 hover:bg-red-50">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout Admin
                </Button>
              </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utenti Totali</p>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Siti Creati</p>
                <p className="text-3xl font-bold text-gray-900">
                  {users.reduce((acc, user) => acc + user.sites_count, 0)}
                </p>
              </div>
              <Globe className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Siti Pubblicati</p>
                <p className="text-3xl font-bold text-gray-900">
                  {users.reduce((acc, user) => 
                    acc + user.sites.filter(site => site.is_published).length, 0
                  )}
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Abbonamenti Attivi</p>
                <p className="text-3xl font-bold text-gray-900">
                  {users.filter(user => user.subscription_status === 'active').length}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cerca utenti, email o nomi siti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Filtri
            </Button>
          </div>
        </Card>

        {/* Users List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredUsers.map((userData) => (
            <Card key={userData.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{userData.email}</h3>
                    <p className="text-sm text-gray-500">
                      Registrato il {formatDate(userData.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(userData.plan)}`}>
                    {userData.plan}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(userData.subscription_status)}`}>
                    {userData.subscription_status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-900">{userData.sites_count}</p>
                  <p className="text-xs text-gray-500">Siti</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {userData.sites.filter(site => site.is_published).length}
                  </p>
                  <p className="text-xs text-gray-500">Pubblicati</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {userData.last_login ? formatDate(userData.last_login) : 'Mai'}
                  </p>
                  <p className="text-xs text-gray-500">Ultimo accesso</p>
                </div>
              </div>

              {/* User Sites */}
              <div className="space-y-2 mb-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Siti ({userData.sites.length})
                </h4>
                {userData.sites.map((site) => (
                  <div key={site.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 text-sm">{site.name}</p>
                        <span className={`w-2 h-2 rounded-full ${site.is_published ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {site.slug} • {site.sections_count} sezioni • {site.layout_type}
                      </p>
                      <p className="text-xs text-gray-400">
                        Aggiornato: {formatDate(site.last_updated)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewUserSite(site.slug)}
                        className="text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Vedi
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedUser(userData)}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dettagli Completi
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun utente trovato</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Prova a modificare i termini di ricerca.' : 'Non ci sono ancora utenti registrati.'}
            </p>
          </Card>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Dettagli Utente</h2>
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  ✕ Chiudi
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Informazioni Utente</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>ID:</strong> {selectedUser.id}</p>
                    <p><strong>Piano:</strong> {selectedUser.plan}</p>
                    <p><strong>Stato:</strong> {selectedUser.subscription_status}</p>
                    <p><strong>Registrato:</strong> {formatDate(selectedUser.created_at)}</p>
                    <p><strong>Ultimo accesso:</strong> {selectedUser.last_login ? formatDate(selectedUser.last_login) : 'Mai'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Statistiche</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Siti totali:</strong> {selectedUser.sites_count}</p>
                    <p><strong>Siti pubblicati:</strong> {selectedUser.sites.filter(s => s.is_published).length}</p>
                    <p><strong>Sezioni totali:</strong> {selectedUser.sites.reduce((acc, site) => acc + site.sections_count, 0)}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Siti Dettagliati</h3>
                <div className="space-y-4">
                  {selectedUser.sites.map((site) => (
                    <div key={site.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{site.name}</h4>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => viewUserSite(site.slug)}>
                            Visualizza
                          </Button>
                          <Button size="sm" onClick={() => editUserSite(site.id)}>
                            Modifica
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <p><strong>Slug:</strong> {site.slug}</p>
                        </div>
                        <div>
                          <p><strong>Layout:</strong> {site.layout_type}</p>
                        </div>
                        <div>
                          <p><strong>Sezioni:</strong> {site.sections_count}</p>
                        </div>
                        <div>
                          <p><strong>Stato:</strong> {site.is_published ? 'Pubblicato' : 'Bozza'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}
