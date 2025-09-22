'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Shield, 
  User, 
  Mail, 
  Globe, 
  FileText, 
  Lock, 
  Clock,
  Users,
  Database,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'

export default function PrivacyPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento Privacy Policy...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Accesso Negato</h2>
        <p className="text-gray-600 mt-2">Effettua il login per accedere alla Privacy Policy.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-gray-600 mt-1">Informativa sulla privacy di HostOnHome</p>
        <p className="text-sm text-gray-500 mt-2">Ultimo aggiornamento: Dicembre 2024</p>
      </div>

      {/* Titolare del Trattamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Titolare del Trattamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Shield className="w-6 h-6 text-blue-600 mr-3 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Nicolò Mazzoleni</h3>
                <div className="space-y-2 text-blue-800">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>hostonhome@gmail.com</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    <span>Via Francesco Petrarca 6D, 23900 LECCO (LC)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categorie di Dati */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2 text-green-600" />
            Categorie di Dati Raccolti
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2 text-blue-600" />
                Dati di Registrazione
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Nome e cognome</li>
                <li>• Indirizzo email</li>
                <li>• Dati di fatturazione</li>
              </ul>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Globe className="w-4 h-4 mr-2 text-green-600" />
                Dati Tecnici
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Dominio acquistato o assegnato</li>
                <li>• Indirizzo IP</li>
                <li>• Log di accesso ai server</li>
              </ul>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-purple-600" />
                Contenuti del Sito
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Testi caricati dall'Host</li>
                <li>• Immagini pubblicate</li>
                <li>• Informazioni del sito</li>
              </ul>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Users className="w-4 h-4 mr-2 text-orange-600" />
                Dati di Contatto Ospiti
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Dati raccolti tramite WhatsApp</li>
                <li>• Form di contatto</li>
                <li>• Responsabilità dell'Host</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Finalità del Trattamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2 text-purple-600" />
            Finalità del Trattamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              'Fornire e gestire il servizio di creazione e hosting dei siti web',
              'Gestire domini, certificati SSL e sicurezza dei siti',
              'Garantire l\'indicizzazione dei siti sui motori di ricerca',
              'Fornire supporto tecnico e assistenza clienti',
              'Adempiere ad obblighi legali, fiscali e contabili',
              'Migliorare il servizio (statistiche aggregate e anonime)'
            ].map((purpose, index) => (
              <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-xs font-bold text-purple-600">{index + 1}</span>
                </div>
                <p className="text-gray-700">{purpose}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Base Giuridica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="w-5 h-5 mr-2 text-red-600" />
            Base Giuridica del Trattamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">Esecuzione del Contratto</h4>
              <p className="text-sm text-red-800">Per erogare il servizio richiesto dall'Host</p>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Obblighi Legali</h4>
              <p className="text-sm text-yellow-800">Per adempimenti fiscali, contabili e di sicurezza</p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Legittimo Interesse</h4>
              <p className="text-sm text-blue-800">Per migliorare e proteggere il servizio</p>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Consenso</h4>
              <p className="text-sm text-green-800">Per comunicazioni promozionali e marketing diretto</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modalità del Trattamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-indigo-600" />
            Modalità del Trattamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-indigo-600 mr-3 mt-1" />
              <div>
                <h4 className="font-semibold text-indigo-900 mb-2">Sicurezza dei Dati</h4>
                <p className="text-sm text-indigo-800 mb-2">
                  I dati sono trattati con strumenti informatici e telematici, nel rispetto delle misure di sicurezza previste dal GDPR.
                </p>
                <p className="text-sm text-indigo-800">
                  I dati sono conservati su server sicuri forniti da IONOS e da altri partner tecnologici con accordi conformi all'art. 28 GDPR.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-gray-600 mr-3 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Limitazioni d'Uso</h4>
                <p className="text-sm text-gray-700">
                  Non utilizziamo i dati degli ospiti finali per fini diversi da quelli legati alla funzionalità del sito.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conservazione e Condivisione */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-600" />
              Conservazione dei Dati
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-1">Dati dell'Host</h4>
              <p className="text-sm text-orange-800">
                Conservati per tutta la durata del rapporto contrattuale e successivamente per il tempo richiesto dalla normativa vigente (es. 10 anni per documenti fiscali).
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-1">Contenuti</h4>
              <p className="text-sm text-blue-800">
                I contenuti caricati dall'Host vengono cancellati alla cessazione del servizio o su esplicita richiesta.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-600" />
              Condivisione dei Dati
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Comunicazione a:</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Provider di hosting e servizi IT (IONOS, Google)</li>
                <li>• Consulenti contabili/fiscali</li>
                <li>• Autorità competenti (obbligo legale)</li>
              </ul>
            </div>
            
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-1">Non Vendiamo Dati</h4>
              <p className="text-sm text-red-800">
                Non vendiamo né cediamo i dati personali a terzi per finalità commerciali.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diritti dell'Utente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Diritti dell'Utente (GDPR)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 mb-3">
              Ai sensi degli artt. 15–22 GDPR, l'Host ha diritto di:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Accedere ai propri dati personali',
                'Chiederne la rettifica o la cancellazione',
                'Limitare o opporsi al trattamento',
                'Richiedere la portabilità dei dati',
                'Revocare il consenso in qualsiasi momento'
              ].map((right, index) => (
                <div key={index} className="flex items-center text-sm text-blue-800">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  {right}
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Come Esercitare i Diritti</h4>
            <p className="text-sm text-gray-700 mb-2">
              Le richieste possono essere inviate a: <strong>hostonhome@gmail.com</strong>
            </p>
            <p className="text-xs text-gray-500">
              La revoca del consenso non pregiudica i trattamenti già effettuati.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Trasferimenti e Modifiche */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2 text-purple-600" />
              Trasferimenti Extra-UE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800">
                Alcuni fornitori di servizi (es. Google, WhatsApp) possono trattare dati in paesi extra-UE. 
                In tal caso, vengono applicate le garanzie previste dal GDPR (es. clausole contrattuali standard).
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-600" />
              Modifiche alla Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-700">
                Ci riserviamo il diritto di modificare la presente Privacy Policy. Le modifiche verranno comunicate tramite il sito ufficiale e, se sostanziali, via email agli Host registrati.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contatti */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Hai Domande sulla Privacy?</h3>
            <p className="text-blue-800 mb-4">
              Per qualsiasi domanda relativa al trattamento dei dati personali o per esercitare i tuoi diritti, contattaci:
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="mailto:hostonhome@gmail.com"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                hostonhome@gmail.com
              </a>
              <div className="text-sm text-blue-700">
                Risponderemo entro 30 giorni dalla richiesta
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}