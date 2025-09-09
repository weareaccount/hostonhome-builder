'use client';

import React, { useState, useEffect } from 'react';
import { AdminGuard, adminLogout } from '@/components/auth/AdminGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronLeft,
  ChevronRight,
  Filter
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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [hasMore, setHasMore] = useState(false);
  const [planFilter, setPlanFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [periodFilter, setPeriodFilter] = useState<string>(''); // 7d | 30d | 90d | 365d
  const [minSites, setMinSites] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Auto load when pagination or filters change
  useEffect(() => {
    loadUsersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, planFilter, statusFilter, periodFilter, minSites, debouncedSearch]);

  const loadUsersData = async () => {
    setIsLoadingData(true);
    try {
      // Ottieni la sessione admin
      const sessionData = localStorage.getItem('admin_session');
      if (!sessionData) {
        throw new Error('Sessione admin non trovata');
      }

      const session = JSON.parse(sessionData);
      
      // Costruisci query params per paginazione e filtri
      const query = new URLSearchParams({
        page: String(page),
        perPage: String(perPage),
        search: debouncedSearch,
        plan: planFilter,
        status: statusFilter,
        period: periodFilter,
        minSites: String(minSites || 0)
      });

      // Chiama l'API per ottenere i dati degli utenti reali
      const response = await fetch(`/api/admin/users?${query.toString()}`, {
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
        setHasMore(Boolean(data.hasMore));
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

  // I risultati sono filtrati lato server; manteniamo comunque un filtro leggero lato client
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.sites.some(site => 
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 h-auto py-3 sm:h-16 sm:py-0">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div className="flex items-center">
                <img src="/logo-hostonhome.png" alt="HostOnHome" width={140} height={28} style={{ display: 'block' }} />
                <span className="sr-only">Dashboard Amministratori</span>
              </div>
            </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span>Pannello Amministratori</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard'}>
                  Dashboard Utente
                </Button>
                <Button variant="outline" size="sm" onClick={adminLogout} className="text-red-600 border-red-600 hover:bg-red-50">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout Admin
                </Button>
              </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utenti Totali</p>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
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
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
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
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
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
          </motion.div>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 sm:p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cerca utenti, email o nomi siti..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(v => !v)} className={showFilters ? 'bg-blue-50 border-blue-200' : ''}>
                <Filter className="w-4 h-4 mr-2" /> Filtri
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Per pagina</span>
                <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="border rounded-md px-3 py-2 text-sm bg-white">
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 border-t pt-4">
                <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }} className="border rounded-md px-3 py-2 text-sm bg-white">
                  <option value="">Tutti i piani</option>
                  <option value="BASE">BASE</option>
                  <option value="PLUS">PLUS</option>
                  <option value="PRO">PRO</option>
                </select>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="border rounded-md px-3 py-2 text-sm bg-white">
                  <option value="">Tutti gli stati</option>
                  <option value="active">Attivo</option>
                  <option value="trial">Trial</option>
                  <option value="expired">Scaduto</option>
                </select>
                <select value={periodFilter} onChange={(e) => { setPeriodFilter(e.target.value); setPage(1); }} className="border rounded-md px-3 py-2 text-sm bg-white">
                  <option value="">Qualsiasi periodo</option>
                  <option value="7d">Ultimi 7 giorni</option>
                  <option value="30d">Ultimi 30 giorni</option>
                  <option value="90d">Ultimi 90 giorni</option>
                  <option value="365d">Ultimo anno</option>
                </select>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Min siti</span>
                  <input type="number" min={0} value={minSites} onChange={(e) => { setMinSites(Number(e.target.value)); setPage(1); }} className="w-24 border rounded-md px-2 py-2 text-sm" />
                </div>
              </div>
            )}

            {/* Paginator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Pagina {page}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage(1)}>Prima</Button>
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Input
                  value={page}
                  onChange={(e) => {
                    const v = parseInt(e.target.value || '1', 10);
                    if (!Number.isNaN(v) && v >= 1) setPage(v);
                  }}
                  className="w-16 text-center"
                />
                <Button variant="outline" disabled={!hasMore} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Users List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <AnimatePresence>
          {filteredUsers.map((userData) => (
            <motion.div key={userData.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <Card className="p-6 hover:shadow-lg transition-shadow">
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
            </motion.div>
          ))}
          </AnimatePresence>
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
