'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, ArrowRight, Users, Globe, BarChart3, Settings } from 'lucide-react';
import Link from 'next/link';

export default function AdminAccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center shadow-xl">
        <div className="mb-6">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Accesso Amministratori
          </h1>
          <p className="text-gray-600">
            Benvenuto nella sezione riservata agli amministratori di HostonHome
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-left p-3 bg-gray-50 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-700">Gestione Utenti</span>
          </div>
          <div className="flex items-center gap-3 text-left p-3 bg-gray-50 rounded-lg">
            <Globe className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-700">Supervisione Siti</span>
          </div>
          <div className="flex items-center gap-3 text-left p-3 bg-gray-50 rounded-lg">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-700">Statistiche Platform</span>
          </div>
          <div className="flex items-center gap-3 text-left p-3 bg-gray-50 rounded-lg">
            <Settings className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-gray-700">Configurazioni Sistema</span>
          </div>
        </div>

        <Link href="/admin/login">
          <Button size="lg" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
            Accedi come Amministratore
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link href="/dashboard">
            <Button variant="outline" className="w-full">
              Torna alla Dashboard Utente
            </Button>
          </Link>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Accesso riservato solo agli amministratori autorizzati
        </div>
      </Card>
    </div>
  );
}
