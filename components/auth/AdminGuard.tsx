'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AdminGuardProps {
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode;
  redirectTo?: string;
}

interface AdminSession {
  email: string;
  loginTime: string;
  sessionId: string;
}

// Credenziali admin autorizzate
const ADMIN_EMAIL = 'admin@hostonhome.it';

export function AdminGuard({ 
  children, 
  fallbackComponent,
  redirectTo = '/admin/login' 
}: AdminGuardProps) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminSession();
  }, []);

  const checkAdminSession = () => {
    try {
      const sessionData = localStorage.getItem('admin_session');
      
      if (!sessionData) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const session: AdminSession = JSON.parse(sessionData);
      
      // Verifica validità sessione (es. 8 ore)
      const loginTime = new Date(session.loginTime);
      const now = new Date();
      const hoursElapsed = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursElapsed > 8 || session.email !== ADMIN_EMAIL) {
        // Sessione scaduta o non valida
        localStorage.removeItem('admin_session');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    } catch (error) {
      console.error('Errore verifica sessione admin:', error);
      localStorage.removeItem('admin_session');
      setIsAdmin(false);
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifica autorizzazioni admin...</p>
        </div>
      </div>
    );
  }

  // Admin not authenticated
  if (!isAdmin) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    // Redirect to admin login
    router.push(redirectTo);
    return null;
  }

  // Admin authenticated - render children
  return <>{children}</>;
}

// Hook per verificare se l'utente corrente è admin
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkSession = () => {
      try {
        const sessionData = localStorage.getItem('admin_session');
        if (!sessionData) {
          setIsAdmin(false);
          return;
        }

        const session: AdminSession = JSON.parse(sessionData);
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const hoursElapsed = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursElapsed > 8 || session.email !== ADMIN_EMAIL) {
          localStorage.removeItem('admin_session');
          setIsAdmin(false);
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        setIsAdmin(false);
      }
    };

    checkSession();
  }, []);
  
  return isAdmin;
}

// Componente per mostrare contenuto solo agli admin
export function AdminOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const isAdmin = useIsAdmin();
  
  if (!isAdmin) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

// Badge per identificare gli admin
export function AdminBadge({ className = '' }: { className?: string }) {
  const isAdmin = useIsAdmin();
  
  if (!isAdmin) return null;
  
  return (
    <div className={`inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      <Shield className="w-3 h-3" />
      <span>Admin</span>
    </div>
  );
}

// Funzione per logout admin
export function adminLogout() {
  localStorage.removeItem('admin_session');
  window.location.href = '/admin/login';
}
