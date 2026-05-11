// Edge Function: Enviar emails de notificación de reservas
// Eventos: reservation_created, deposit_confirmed
// Usa Resend como proveedor de email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = [
  'https://tumesahoy.com',
  'https://www.tumesahoy.com',
  'https://tumesahoy.vercel.app',
  Deno.env.get('FRONTEND_URL'),
].filter(Boolean)

function getCorsHeaders(origin: string | null): Record<string, string> {
  // Permitir llamadas server-to-server (sin origin) y orígenes conocidos
  if (!origin) {
    return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
  }
  const isLocalhost = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')
  const isAllowed = ALLOWED_ORIGINS.includes(origin)
  const allowedOrigin = isLocalhost || isAllowed ? origin : (ALLOWED_ORIGINS[0] as string)
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'TuMesaHoy <reservas@tumesahoy.com>'

  if (!RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY no configurado — email no enviado')
    return false
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  })

  if (!response.ok) {
    const err = await response.text()
    console.error('❌ Error enviando email a', to, ':', err)
    return false
  }

  console.log('✉️ Email enviado a:', to)
  return true
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function emailBase(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#111827;padding:20px 28px;">
      <span style="color:#fff;font-size:20px;font-weight:700;">TuMesaHoy</span>
    </div>
    <div style="padding:28px 28px 20px;">
      ${content}
    </div>
    <div style="background:#f9fafb;padding:14px 28px;border-top:1px solid #e5e7eb;text-align:center;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">TuMesaHoy · reservas@tumesahoy.com</p>
    </div>
  </div>
</body>
</html>`
}

function reservationCreatedCustomerHtml(r: any, frontendUrl: string): string {
  return emailBase(`
    <h2 style="margin:0 0 6px;color:#111827;font-size:19px;">¡Reserva recibida!</h2>
    <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">
      Hola <strong>${r.customer_name}</strong>, tu reserva en <strong>${r.business_name}</strong>
      fue recibida y está pendiente de confirmación por el local.
    </p>
    <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin-bottom:20px;font-size:14px;color:#374151;line-height:1.7;">
      <div><strong>📅 Fecha:</strong> ${formatDate(r.reservation_date)}</div>
      <div><strong>🕐 Hora:</strong> ${r.reservation_time}</div>
      <div><strong>👥 Personas:</strong> ${r.number_of_people}</div>
      ${r.special_requests ? `<div><strong>📝 Notas:</strong> ${r.special_requests}</div>` : ''}
    </div>
    ${r.cancellation_token ? `
    <div style="text-align:center;margin-bottom:16px;">
      <a href="${frontendUrl}/cancelar-reserva/${r.cancellation_token}"
         style="display:inline-block;padding:9px 18px;border:1px solid #d1d5db;border-radius:6px;color:#6b7280;font-size:13px;text-decoration:none;">
        Cancelar reserva
      </a>
    </div>` : ''}
    <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
      El negocio confirmará tu reserva a la brevedad.
    </p>
  `)
}

function newReservationOwnerHtml(r: any, frontendUrl: string): string {
  return emailBase(`
    <h2 style="margin:0 0 6px;color:#111827;font-size:19px;">Nueva reserva en ${r.business_name}</h2>
    <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">Tenés una nueva reserva pendiente de confirmación.</p>
    <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin-bottom:20px;font-size:14px;color:#374151;line-height:1.7;">
      <div><strong>👤 Cliente:</strong> ${r.customer_name}</div>
      <div><strong>📱 Teléfono:</strong> ${r.customer_phone}</div>
      ${r.customer_email ? `<div><strong>✉️ Email:</strong> ${r.customer_email}</div>` : ''}
      <div><strong>📅 Fecha:</strong> ${formatDate(r.reservation_date)}</div>
      <div><strong>🕐 Hora:</strong> ${r.reservation_time}</div>
      <div><strong>👥 Personas:</strong> ${r.number_of_people}</div>
      ${r.special_requests ? `<div><strong>📝 Notas:</strong> ${r.special_requests}</div>` : ''}
    </div>
    <div style="text-align:center;">
      <a href="${frontendUrl}/admin/${r.business_slug}"
         style="display:inline-block;padding:11px 22px;background:#111827;border-radius:7px;color:#fff;font-size:14px;font-weight:600;text-decoration:none;">
        Ver en el panel
      </a>
    </div>
  `)
}

function depositConfirmedHtml(r: any): string {
  return emailBase(`
    <h2 style="margin:0 0 6px;color:#111827;font-size:19px;">¡Seña confirmada! ✅</h2>
    <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">
      Hola <strong>${r.customer_name}</strong>, tu seña para <strong>${r.business_name}</strong>
      fue acreditada exitosamente. Tu reserva está confirmada.
    </p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:20px;font-size:14px;color:#374151;line-height:1.7;">
      <div><strong>💰 Monto pagado:</strong> $${r.deposit_amount} ARS</div>
      <div><strong>📅 Fecha:</strong> ${formatDate(r.reservation_date)}</div>
      <div><strong>🕐 Hora:</strong> ${r.reservation_time}</div>
      <div><strong>👥 Personas:</strong> ${r.number_of_people}</div>
    </div>
    <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">¡Nos vemos pronto!</p>
  `)
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { event, reservationId } = await req.json()

    if (!event || !reservationId) {
      throw new Error('Parámetros requeridos: event y reservationId')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const frontendUrl = (Deno.env.get('FRONTEND_URL') || 'https://tumesahoy.com').replace(/\/$/, '')

    // Obtener reserva con info del negocio
    const { data: reservation, error } = await supabase
      .from('reservations')
      .select(`
        id, customer_name, customer_phone, customer_email,
        reservation_date, reservation_time, number_of_people,
        special_requests, status, deposit_amount, cancellation_token,
        businesses!inner(id, name, slug, user_id)
      `)
      .eq('id', reservationId)
      .single()

    if (error || !reservation) {
      throw new Error('Reserva no encontrada')
    }

    const business = reservation.businesses as any

    // Obtener email del dueño del negocio desde auth.users
    const { data: ownerData } = await supabase
      .from('auth.users')
      .select('email')
      .eq('id', business.user_id)
      .single()
      .catch(() => ({ data: null }))

    // Fallback: consulta directa a auth
    let ownerEmail: string | null = ownerData?.email || null
    if (!ownerEmail) {
      const { data: { user } } = await supabase.auth.admin.getUserById(business.user_id)
      ownerEmail = user?.email || null
    }

    const r = {
      ...reservation,
      business_name: business.name,
      business_slug: business.slug,
    }

    const results: string[] = []

    if (event === 'reservation_created') {
      // Email al cliente
      if (reservation.customer_email) {
        const ok = await sendEmail(
          reservation.customer_email,
          `Reserva recibida en ${business.name}`,
          reservationCreatedCustomerHtml(r, frontendUrl)
        )
        if (ok) results.push('customer_notified')
      }

      // Email al dueño del negocio
      if (ownerEmail) {
        const ok = await sendEmail(
          ownerEmail,
          `Nueva reserva — ${reservation.customer_name}`,
          newReservationOwnerHtml(r, frontendUrl)
        )
        if (ok) results.push('owner_notified')
      }
    }

    if (event === 'deposit_confirmed') {
      if (reservation.customer_email) {
        const ok = await sendEmail(
          reservation.customer_email,
          `Seña confirmada — ${business.name}`,
          depositConfirmedHtml(r)
        )
        if (ok) results.push('customer_notified')
      }
    }

    console.log(`✅ notify-reservation [${event}] para ${reservationId}:`, results)

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('❌ Error en notify-reservation:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
