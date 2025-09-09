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
  LineChart,
  List,
  Grid3X3,
  ArrowUpDown,
  MoreVertical,
  Download,
  RefreshCw
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  plan: 'BASE' | 'PLUS' | 'PRO';
  last_login?: string;
  subscription_status: 'active' | 'trial' | 'expired' | 'none';
  sites_count: number;
  sites: SiteData[];
}

interface SiteData {
  id: string;
  name: string;
  slug: string;
  is_published: boolean;
  sections_count: number;
  layout_type: string;
  last_updated: string;
  theme: any;
}

function AdminDashboardContent() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Paginazione
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(20);
  
  // Vista
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
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
    loadUsersData();
  }, []);

  const loadUsersData = async () => {
    setIsLoadingData(true);
    try {
      const sessionData = localStorage.getItem('admin_session');
      if (!sessionData) {
        throw new Error('Sessione admin non trovata');
      }

      const session = JSON.parse(sessionData);
      
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
    const monthlyGrowth = 12.5;
    const revenue = activeSubscriptions * 29.99;

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

  const applyFilters = (usersData: UserData[]) => {
    let filtered = usersData;

    if (filters.plan !== 'ALL') {
      filtered = filtered.filter(user => user.plan === filters.plan);
    }

    if (filters.subscription_status !== 'ALL') {
      filtered = filtered.filter(user => user.subscription_status === filters.subscription_status);
    }

    if (filters.sites_count !== 'ALL') {
      if (filters.sites_count === '0') {
        filtered = filtered.filter(user => user.sites_count === 0);
      } else if (filters.sites_count === '1-3') {
        filtered = filtered.filter(user => user.sites_count >= 1 && user.sites_count <= 3);
      } else if (filters.sites_count === '4+') {
        filtered = filtered.filter(user => user.sites_count >= 4);
      }
    }

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

  const filteredUsers = applyFilters(users).filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.sites.some(site => 
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
    window.open(`/sites/${siteSlug}`, '_blank');
  };

  const resetFilters = () => {
    setFilters({
      plan: 'ALL',
      subscription_status: 'ALL',
      sites_count: 'ALL',
      created_period: 'ALL'
    });
    setCurrentPage(1);
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
                <p className="text-sm text-gray-500">Gestione utenti e analisi piattaforma</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Overview */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Analisi Piattaforma</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Utenti Totali</p>
                  <p className="text-3xl font-bold text-blue-900">{analytics.totalUsers}</p>
                  <p className="text-xs text-blue-600 mt-1">+{analytics.monthlyGrowth}% questo mese</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Siti Creati</p>
                  <p className="text-3xl font-bold text-green-900">{analytics.totalSites}</p>
                  <p className="text-xs text-green-600 mt-1">{analytics.publishedSites} pubblicati</p>
                </div>
                <Globe className="w-8 h-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-purple-50 to-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Abbonamenti Attivi</p>
                  <p className="text-3xl font-bold text-purple-900">{analytics.activeSubscriptions}</p>
                  <p className="text-xs text-purple-600 mt-1">{Math.round((analytics.activeSubscriptions/analytics.totalUsers)*100)}% conversion</p>
                </div>
                <CreditCard className="w-8 h-8 text-purple-600" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-yellow-50 to-yellow-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Revenue Mensile</p>
                  <p className="text-3xl font-bold text-yellow-900">€{analytics.revenue.toFixed(0)}</p>
                  <p className="text-xs text-yellow-600 mt-1">+15% vs mese scorso</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
            </Card>
          </div>
        </div>

        {/* Search and Controls */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Top Row: Search, View Controls, Actions */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cerca utenti, email o nomi siti..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-md">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="rounded-r-none"
                  >
                    <List className="w-4 h-4 mr-1" />
                    Tabella
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-l-none"
                  >
                    <Grid3X3 className="w-4 h-4 mr-1" />
                    Griglia
                  </Button>
                </div>

                {/* Items per page */}
                <select 
                  value={usersPerPage} 
                  onChange={(e) => {
                    setUsersPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white"
                >
                  <option value={10}>10 per pagina</option>
                  <option value={20}>20 per pagina</option>
                  <option value={50}>50 per pagina</option>
                  <option value={100}>100 per pagina</option>
                </select>

                <Button variant="outline" size="sm" onClick={loadUsersData}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Aggiorna
                </Button>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? 'bg-blue-50 border-blue-200' : ''}
                >
                  <Filter className="w-4 h-4 mr-1" />
                  Filtri {Object.values(filters).filter(v => v !== 'ALL').length > 0 && `(${Object.values(filters).filter(v => v !== 'ALL').length})`}
                </Button>
                
                {Object.values(filters).some(v => v !== 'ALL') && (
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reset
                  </Button>
                )}
              </div>
            </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Piano</label>
                  <select 
                    value={filters.plan} 
                    onChange={(e) => setFilters({...filters, plan: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
                  >
                    <option value="ALL">Tutti i piani</option>
                    <option value="BASE">Base</option>
                    <option value="PLUS">Plus</option>
                    <option value="PRO">Pro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stato Abbonamento</label>
                  <select 
                    value={filters.subscription_status} 
                    onChange={(e) => setFilters({...filters, subscription_status: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
                  >
                    <option value="ALL">Tutti gli stati</option>
                    <option value="active">Attivo</option>
                    <option value="trial">Trial</option>
                    <option value="expired">Scaduto</option>
                    <option value="none">Nessuno</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Numero Siti</label>
                  <select 
                    value={filters.sites_count} 
                    onChange={(e) => setFilters({...filters, sites_count: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
                  >
                    <option value="ALL">Qualsiasi numero</option>
                    <option value="0">0 siti</option>
                    <option value="1-3">1-3 siti</option>
                    <option value="4+">4+ siti</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registrato</label>
                  <select 
                    value={filters.created_period} 
                    onChange={(e) => setFilters({...filters, created_period: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
                  >
                    <option value="ALL">Qualsiasi periodo</option>
                    <option value="7d">Ultimi 7 giorni</option>
                    <option value="30d">Ultimi 30 giorni</option>
                    <option value="90d">Ultimi 90 giorni</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            Mostrando {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} di {filteredUsers.length} utenti
          </div>
          <div className="text-sm text-gray-600">
            Pagina {currentPage} di {totalPages}
          </div>
        </div>

        {/* Users Display */}
        {viewMode === 'table' ? (
          /* Table View */
          <Card className="mb-8 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Piano/Stato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Siti
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registrato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ultimo Accesso
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map((userData) => (
                    <tr key={userData.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{userData.email}</div>
                            <div className="text-xs text-gray-500">ID: {userData.id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(userData.plan)}`}>
                            {userData.plan}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(userData.subscription_status)}`}>
                            {userData.subscription_status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{userData.sites_count} totali</div>
                          <div className="text-xs text-gray-500">
                            {userData.sites.filter(site => site.is_published).length} pubblicati
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(userData.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {userData.last_login ? formatDate(userData.last_login) : 'Mai'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {userData.sites.length > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewUserSite(userData.sites[0].slug)}
                              className="text-xs"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Vedi Sito
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUser(userData)}
                            className="text-xs"
                          >
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {currentUsers.map((userData) => (
              <Card key={userData.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{userData.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPlanColor(userData.plan)}`}>
                          {userData.plan}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(userData.subscription_status)}`}>
                          {userData.subscription_status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p className="font-medium">{userData.sites_count}</p>
                    <p className="text-xs">Siti</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500">Pubblicati</p>
                    <p className="font-medium">{userData.sites.filter(site => site.is_published).length}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Registrato</p>
                    <p className="font-medium">{formatDate(userData.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ultimo accesso</p>
                    <p className="font-medium">{userData.last_login ? formatDate(userData.last_login) : 'Mai'}</p>
                  </div>
                </div>

                {/* User Sites */}
                {userData.sites.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Siti ({userData.sites.length})
                    </h4>
                    {userData.sites.slice(0, 2).map((site) => (
                      <div key={site.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-900 text-sm">{site.name}</p>
                            <span className={`w-2 h-2 rounded-full ${site.is_published ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {site.slug} • {site.sections_count} sezioni • {site.layout_type}
                          </p>
                        </div>
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
                    ))}
                    {userData.sites.length > 2 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{userData.sites.length - 2} altri siti
                      </p>
                    )}
                  </div>
                )}

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
        )}

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{indexOfFirstUser + 1}</span> - <span className="font-medium">{Math.min(indexOfLastUser, filteredUsers.length)}</span> di <span className="font-medium">{filteredUsers.length}</span> utenti
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  Prima
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {/* Smart pagination */}
                  {totalPages <= 7 ? (
                    // Show all pages if 7 or fewer
                    Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    ))
                  ) : (
                    // Smart truncation for many pages
                    <>
                      {currentPage > 3 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                            className="w-10 h-8 p-0"
                          >
                            1
                          </Button>
                          {currentPage > 4 && <span className="px-2">...</span>}
                        </>
                      )}
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        if (pageNum >= 1 && pageNum <= totalPages) {
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-10 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                        return null;
                      })}
                      
                      {currentPage < totalPages - 2 && (
                        <>
                          {currentPage < totalPages - 3 && <span className="px-2">...</span>}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            className="w-10 h-8 p-0"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Ultima
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Vai a:</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      setCurrentPage(page);
                    }
                  }}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">di {totalPages}</span>
              </div>
            </div>
          </Card>
        )}

        {filteredUsers.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun utente trovato</h3>
            <p className="text-gray-500">
              {searchTerm || Object.values(filters).some(v => v !== 'ALL') 
                ? 'Prova a modificare i filtri o i termini di ricerca.' 
                : 'Non ci sono ancora utenti registrati.'}
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
                    <p><strong>Siti in bozza:</strong> {selectedUser.sites.filter(s => !s.is_published).length}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Tutti i Siti</h3>
                <div className="space-y-3">
                  {selectedUser.sites.map((site) => (
                    <div key={site.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900">{site.name}</p>
                          <span className={`w-2 h-2 rounded-full ${site.is_published ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {site.slug} • {site.sections_count} sezioni • {site.layout_type}
                        </p>
                        <p className="text-xs text-gray-400">
                          Aggiornato: {formatDate(site.last_updated)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewUserSite(site.slug)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizza
                      </Button>
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

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}
