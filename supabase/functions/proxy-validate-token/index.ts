// ════════════════════════════════════════════════
// proxy-validate-token
// Validerar en delegate-token, returnerar patientens
// förnamn och eventuell befintlig logg för dagen.
// ════════════════════════════════════════════════

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Returns UTC bounds for the current day in Stockholm local time.
function todayStockholmBounds() {
  const now = new Date()
  const dateStr = now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' })
  const month = now.getUTCMonth() // 0-based
  const offsetStr = (month >= 3 && month <= 9) ? '+02:00' : '+01:00'
  return {
    gte: new Date(`${dateStr}T00:00:00${offsetStr}`).toISOString(),
    lte: new Date(`${dateStr}T23:59:59${offsetStr}`).toISOString(),
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ valid: false, reason: 'server_error' }, 405)
  }

  try {
    const body = await req.json().catch(() => null)
    const token = body?.token

    if (!token || typeof token !== 'string') {
      return jsonResponse({ valid: false, reason: 'not_found' })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Saknade miljövariabler')
      return jsonResponse({ valid: false, reason: 'server_error' })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // ── 1. Hämta token-raden ──────────────────────────
    const { data: tokenRow, error: tokenError } = await supabase
      .from('delegate_tokens')
      .select('patient_id, expires_at, revoked, log_id')
      .eq('token', token)
      .maybeSingle()

    if (tokenError) {
      console.error('Token-uppslagning misslyckades:', tokenError)
      return jsonResponse({ valid: false, reason: 'server_error' })
    }

    if (!tokenRow) {
      return jsonResponse({ valid: false, reason: 'not_found' })
    }

    if (tokenRow.revoked) {
      return jsonResponse({ valid: false, reason: 'revoked' })
    }

    // used-kontrollen borttagen — token är giltig tills den löper ut eller återkallas
    if (new Date(tokenRow.expires_at) < new Date()) {
      return jsonResponse({ valid: false, reason: 'expired' })
    }

    // ── 2. Hämta patientens förnamn ────────────────────
    const { data: patient, error: patientError } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', tokenRow.patient_id)
      .maybeSingle()

    if (patientError || !patient) {
      console.error('Patient-uppslagning misslyckades:', patientError)
      return jsonResponse({ valid: false, reason: 'patient_not_found' })
    }

    const patientFirstName =
      (patient.full_name || '').trim().split(/\s+/)[0] || 'patienten'

    // ── 3. Hämta eventuell befintlig logg ─────────────
    let existingLog = null

    if (tokenRow.log_id) {
      // Token är kopplad till en specifik logg — hämta den direkt
      const { data: logRow } = await supabase
        .from('logs')
        .select(
          'id, energy, breathing, head_balance, general_wellbeing, ' +
          'mental_wellbeing, selected_symptoms, notes, logged_by_proxy, proxy_name'
        )
        .eq('id', tokenRow.log_id)
        .maybeSingle()
      existingLog = logRow ?? null
    } else {
      // Ingen kopplad logg — kolla om patienten redan loggat idag
      const { gte, lte } = todayStockholmBounds()
      const { data: logRow } = await supabase
        .from('logs')
        .select(
          'id, energy, breathing, head_balance, general_wellbeing, ' +
          'mental_wellbeing, selected_symptoms, notes, logged_by_proxy, proxy_name'
        )
        .eq('patient_id', tokenRow.patient_id)
        .gte('logged_at', gte)
        .lte('logged_at', lte)
        .order('logged_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      existingLog = logRow ?? null
    }

    return jsonResponse({ valid: true, patientFirstName, expiresAt: tokenRow.expires_at, existingLog })
  } catch (err) {
    console.error('Oväntat fel:', err)
    return jsonResponse({ valid: false, reason: 'server_error' })
  }
})
