'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  User, 
  FolderOpen, 
  Target, 
  Search,
  LogOut,
  Menu,
  X,
  Bell,
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  X as XIcon
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Se siamo nel builder o nella preview, non mostrare il layout della dashboard
  if (pathname.includes('/builder') || pathname.includes('/preview')) {
    return <>{children}</>
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Account', href: '/dashboard/account', icon: User },
    { name: 'Progetti', href: '/dashboard/projects', icon: FolderOpen },
    { name: 'Challenge', href: '/dashboard/challenges', icon: Target },
    { name: 'SEO', href: '/dashboard/seo', icon: Search },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  // Dati mock per le notifiche
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Challenge completata!',
      message: 'Hai completato la challenge "Prima recensione"',
      time: '2 minuti fa',
      read: false
    },
    {
      id: 2,
      type: 'info',
      title: 'Nuovo progetto creato',
      message: 'Il progetto "San Vito Suites" è stato creato con successo',
      time: '1 ora fa',
      read: true
    },
    {
      id: 3,
      type: 'warning',
      title: 'Trial in scadenza',
      message: 'Il tuo trial scadrà tra 4 giorni',
      time: '3 ore fa',
      read: false
    }
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  // Opzioni delle impostazioni
  const settingsOptions = [
    { name: 'Profilo', href: '/dashboard/account', icon: User },
    { name: 'Notifiche', href: '/dashboard/notifications', icon: Bell },
    { name: 'Privacy', href: '/dashboard/privacy', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Overlay per chiudere dropdown */}
      {(notificationsOpen || settingsOpen) && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => {
            setNotificationsOpen(false)
            setSettingsOpen(false)
          }}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <img src="/logo-hostonhome.png" alt="HostOnHome" width={140} height={28} />
            <button
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500">Utente</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Esci
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="ml-4 lg:ml-0">
                  <h1 className="text-xl font-semibold text-gray-900">
                    {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Notifiche */}
                <div className="relative">
                  <button 
                    className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 relative"
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {/* Dropdown Notifiche */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">Notifiche</h3>
                          <button 
                            onClick={() => setNotificationsOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <XIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            Nessuna notifica
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div 
                              key={notification.id}
                              className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                                !notification.read ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  {notification.type === 'success' && (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  )}
                                  {notification.type === 'warning' && (
                                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                                  )}
                                  {notification.type === 'info' && (
                                    <Info className="w-5 h-5 text-blue-500" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {notification.time}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Impostazioni */}
                <div className="relative">
                  <button 
                    className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    onClick={() => setSettingsOpen(!settingsOpen)}
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  
                  {/* Dropdown Impostazioni */}
                  {settingsOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="py-2">
                        {settingsOptions.map((option, index) => (
                          <Link
                            key={index}
                            href={option.href}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setSettingsOpen(false)}
                          >
                            <option.icon className="w-4 h-4 mr-3" />
                            {option.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="hidden sm:block">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
