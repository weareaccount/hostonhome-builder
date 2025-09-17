'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Bell, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  BarChart3,
  FileText,
  HelpCircle
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      description: 'Panoramica generale'
    },
    {
      name: 'Verifiche',
      href: '/admin/verifications',
      icon: Bell,
      description: 'Gestisci verifiche foto',
      badge: true
    },
    {
      name: 'Utenti',
      href: '/admin/users',
      icon: Users,
      description: 'Gestione utenti'
    },
    {
      name: 'Statistiche',
      href: '/admin/stats',
      icon: BarChart3,
      description: 'Analisi e report'
    },
    {
      name: 'Contenuti',
      href: '/admin/content',
      icon: FileText,
      description: 'Gestione contenuti'
    },
    {
      name: 'Impostazioni',
      href: '/admin/settings',
      icon: Settings,
      description: 'Configurazione sistema'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.div
        initial={{ x: sidebarOpen ? 0 : -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl border-r border-gray-200 z-40"
      >
        {/* Header Sidebar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-600">HostOnHome Builder</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  isActive ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-4 h-4 ${
                    isActive ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{item.name}</span>
                    {item.badge && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-600">admin@hostonhome.com</p>
            </div>
            <button className="p-1 hover:bg-gray-200 rounded transition-colors">
              <HelpCircle className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        sidebarOpen ? 'ml-80' : 'ml-0'
      }`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {!sidebarOpen && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                )}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {menuItems.find(item => item.href === pathname)?.name || 'Dashboard'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {menuItems.find(item => item.href === pathname)?.description || 'Panoramica generale'}
                  </p>
                </div>
              </div>
              
              {/* Notifications Badge */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => window.location.href = '/admin/verifications'}
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
