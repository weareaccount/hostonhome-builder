// Sistema di notifiche email per HostonHome Builder
// Utilizza Resend (servizio email moderno e affidabile)

import { Resend } from 'resend'

// Inizializza Resend (richiede API key in .env.local)
const resend = new Resend(process.env.RESEND_API_KEY)

// Template email per conferma registrazione
export async function sendWelcomeEmail(email: string, plan: string, trialDays: number = 7) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY non configurato. Email non inviata.')
    return { success: false, error: 'Email service non configurato' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'HostonHome <noreply@hostonhome.it>',
      to: [email],
      subject: `🎉 Benvenuto in HostonHome! La tua prova gratuita di ${trialDays} giorni è iniziata`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://hostonhome.it/logo-hostonhome.png" alt="HostonHome" style="height: 60px;">
          </div>
          
          <h1 style="color: #1f2937; text-align: center; margin-bottom: 20px;">
            🎉 Benvenuto in HostonHome!
          </h1>
          
          <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0; font-size: 24px;">7 GIORNI GRATIS</h2>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">La tua prova gratuita è iniziata!</p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-top: 0;">📋 Riepilogo del tuo account:</h3>
            <ul style="color: #4b5563; line-height: 1.6;">
              <li><strong>Piano:</strong> ${plan}</li>
              <li><strong>Prova gratuita:</strong> ${trialDays} giorni</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Data di inizio:</strong> ${new Date().toLocaleDateString('it-IT')}</li>
            </ul>
          </div>
          
          <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #065f46; margin-top: 0;">✅ Cosa puoi fare ora:</h4>
            <ul style="color: #047857; margin: 0; padding-left: 20px;">
              <li>Creare il tuo primo sito web</li>
              <li>Personalizzare temi e layout</li>
              <li>Testare tutte le funzionalità</li>
              <li>Ricevere prenotazioni senza commissioni</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://hostonhome.it/dashboard" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              🚀 Inizia a creare il tuo sito
            </a>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #92400e; margin-top: 0;">⏰ Importante:</h4>
            <p style="color: #92400e; margin: 0;">
              Al termine dei ${trialDays} giorni, l'abbonamento si attiverà automaticamente. 
              Puoi cancellare in qualsiasi momento dalla tua dashboard.
            </p>
          </div>
          
          <div style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px;">
            <p>Hai domande? Contattaci su <a href="mailto:support@hostonhome.it" style="color: #3b82f6;">support@hostonhome.it</a></p>
            <p>© 2024 HostonHome. Tutti i diritti riservati.</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Errore invio email:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Email di benvenuto inviata a:', email)
    return { success: true, messageId: data?.id }
  } catch (error: any) {
    console.error('Errore invio email:', error)
    return { success: false, error: error.message }
  }
}

// Template email per fine trial (da implementare con webhook)
export async function sendTrialEndingEmail(email: string, plan: string, daysRemaining: number) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY non configurato. Email non inviata.')
    return { success: false, error: 'Email service non configurato' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'HostonHome <noreply@hostonhome.it>',
      to: [email],
      subject: `⏰ La tua prova gratuita scade tra ${daysRemaining} giorni`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://hostonhome.it/logo-hostonhome.png" alt="HostonHome" style="height: 60px;">
          </div>
          
          <h1 style="color: #1f2937; text-align: center; margin-bottom: 20px;">
            ⏰ La tua prova gratuita sta per scadere
          </h1>
          
          <div style="background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0; font-size: 24px;">${daysRemaining} GIORNI RIMANENTI</h2>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">La tua prova gratuita scade presto</p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-top: 0;">📊 Il tuo utilizzo:</h3>
            <ul style="color: #4b5563; line-height: 1.6;">
              <li><strong>Piano:</strong> ${plan}</li>
              <li><strong>Giorni rimanenti:</strong> ${daysRemaining}</li>
              <li><strong>Email:</strong> ${email}</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://hostonhome.it/dashboard" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              🚀 Continua con il tuo sito
            </a>
          </div>
          
          <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #065f46; margin-top: 0;">💡 Non perdere il tuo lavoro:</h4>
            <p style="color: #047857; margin: 0;">
              Al termine della prova, l'abbonamento si attiverà automaticamente. 
              Continuerai a ricevere prenotazioni senza interruzioni!
            </p>
          </div>
          
          <div style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px;">
            <p>Hai domande? Contattaci su <a href="mailto:support@hostonhome.it" style="color: #3b82f6;">support@hostonhome.it</a></p>
            <p>© 2024 HostonHome. Tutti i diritti riservati.</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Errore invio email:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Email fine trial inviata a:', email)
    return { success: true, messageId: data?.id }
  } catch (error: any) {
    console.error('Errore invio email:', error)
    return { success: false, error: error.message }
  }
}

// Template email per pagamento fallito
export async function sendPaymentFailedEmail(email: string, plan: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY non configurato. Email non inviata.')
    return { success: false, error: 'Email service non configurato' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'HostonHome <noreply@hostonhome.it>',
      to: [email],
      subject: '⚠️ Problema con il pagamento - Azione richiesta',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://hostonhome.it/logo-hostonhome.png" alt="HostonHome" style="height: 60px;">
          </div>
          
          <h1 style="color: #1f2937; text-align: center; margin-bottom: 20px;">
            ⚠️ Problema con il pagamento
          </h1>
          
          <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0; font-size: 24px;">AZIONE RICHIESTA</h2>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Aggiorna il tuo metodo di pagamento</p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-top: 0;">📋 Dettagli:</h3>
            <ul style="color: #4b5563; line-height: 1.6;">
              <li><strong>Piano:</strong> ${plan}</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Data:</strong> ${new Date().toLocaleDateString('it-IT')}</li>
            </ul>
          </div>
          
          <div style="background: #fef2f2; border: 1px solid #fca5a5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #991b1b; margin-top: 0;">🚨 Cosa è successo:</h4>
            <p style="color: #991b1b; margin: 0;">
              Il pagamento per il tuo abbonamento ${plan} non è riuscito. 
              I servizi sono stati temporaneamente sospesi.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://hostonhome.it/dashboard" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              🔧 Aggiorna metodo di pagamento
            </a>
          </div>
          
          <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #065f46; margin-top: 0;">✅ Come risolvere:</h4>
            <ul style="color: #047857; margin: 0; padding-left: 20px;">
              <li>Vai alla tua dashboard</li>
              <li>Aggiorna il metodo di pagamento</li>
              <li>I servizi si riattiveranno immediatamente</li>
            </ul>
          </div>
          
          <div style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px;">
            <p>Hai domande? Contattaci su <a href="mailto:support@hostonhome.it" style="color: #3b82f6;">support@hostonhome.it</a></p>
            <p>© 2024 HostonHome. Tutti i diritti riservati.</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Errore invio email:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Email pagamento fallito inviata a:', email)
    return { success: true, messageId: data?.id }
  } catch (error: any) {
    console.error('Errore invio email:', error)
    return { success: false, error: error.message }
  }
}
