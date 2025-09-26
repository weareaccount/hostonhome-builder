'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Shield, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

// Credenziali admin hardcoded per sicurezza
const ADMIN_CREDENTIALS = {
  email: 'admin@hostonhome.it',
  password: 'HostAdmin2024!'
};

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Verifica credenziali admin
      if (formData.email === ADMIN_CREDENTIALS.email && formData.password === ADMIN_CREDENTIALS.password) {
        // Salva la sessione admin nel localStorage
        const sessionData = {
          email: ADMIN_CREDENTIALS.email,
          loginTime: new Date().toISOString(),
          sessionId: `admin_${Date.now()}`
        };
        
        localStorage.setItem('admin_session', JSON.stringify(sessionData));
        
        // Debug: verifica che la sessione sia stata salvata
        const savedSession = localStorage.getItem('admin_session');
        console.log('🔍 DEBUG Admin Login - Sessione salvata:', savedSession);
        console.log('🔍 DEBUG Admin Login - Sessione verificata:', JSON.parse(savedSession || '{}'));

        // Redirect alla dashboard admin
        router.push('/admin');
      } else {
        setError('Credenziali non valide. Accesso negato.');
      }
    } catch (err) {
      setError('Errore durante l\'autenticazione');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset error quando l'utente inizia a digitare
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl border-0">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Accesso Amministratori
          </h1>
          <p className="text-gray-600 text-sm">
            Area riservata - Solo personale autorizzato
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Amministratore
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="admin@hostonhome.it"
              className="w-full"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Inserisci la password"
                className="w-full pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verificando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Accedi come Admin</span>
              </div>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500 mb-3">
            Accesso riservato al personale autorizzato
          </p>
          <Button
            variant="outline"
            onClick={() => router.push('/login')}
            className="text-sm"
            disabled={isLoading}
          >
            Accesso Utenti Standard
          </Button>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-yellow-800">
              <p className="font-medium mb-1">Note di Sicurezza:</p>
              <ul className="space-y-1">
                <li>• Accesso registrato e monitorato</li>
                <li>• Utilizzare solo per scopi autorizzati</li>
                <li>• Logout automatico dopo inattività</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
