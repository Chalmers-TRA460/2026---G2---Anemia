// proxy-submit-log
// Tar emot logg-data från en anhörig via en delegate-token.
// Skapar eller uppdaterar loggen för dagen och kopplar token.log_id.

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const SCORE_FIELDS = [
  "energy",
  "breathing",
  "head_balance",
  "general_wellbeing",
  "mental_wellbeing",
] as const

function jsonResponse(body: object, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

// Returns UTC bounds for the target date (ISO string) in Stockholm local time.
function stockholmDayBounds(isoHint?: string) {
  const d = isoHint ? new Date(isoHint) : new Date()
  const dateStr = d.toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" })
  const month = d.getUTCMonth() // 0-based
  const offsetStr = (month >= 3 && month <= 9) ? "+02:00" : "+01:00"
  return {
    dateStr,
    gte: new Date(`${dateStr}T00:00:00${offsetStr}`).toISOString(),
    lte: new Date(`${dateStr}T23:59:59${offsetStr}`).toISOString(),
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { token, proxyName, scores, selectedSymptoms, notes, loggedAt } = body

    // ── Input-validering ──────────────────────────────
    if (!token || typeof token !== "string") {
      return jsonResponse({ success: false, reason: "invalid_token" })
    }
    if (!proxyName || typeof proxyName !== "string" || proxyName.trim().length < 2) {
      return jsonResponse({ success: false, reason: "invalid_proxy_name" })
    }
    if (!scores || typeof scores !== "object") {
      return jsonResponse({ success: false, reason: "invalid_scores" })
    }
    for (const field of SCORE_FIELDS) {
      const value = scores[field]
      if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 5) {
        return jsonResponse({ success: false, reason: `invalid_score_${field}` })
      }
    }
    if (selectedSymptoms !== undefined && !Array.isArray(selectedSymptoms)) {
      return jsonResponse({ success: false, reason: "invalid_symptoms" })
    }

    let loggedAtValue: string | null = null
    if (loggedAt) {
      const dt = new Date(loggedAt)
      if (isNaN(dt.getTime())) {
        return jsonResponse({ success: false, reason: "invalid_date" })
      }
      const now = new Date()
      const cutoff = new Date(now.getTime() - 36 * 60 * 60 * 1000)
      if (dt > now || dt < cutoff) {
        return jsonResponse({ success: false, reason: "too_old" })
      }
      loggedAtValue = dt.toISOString()
    }

    // ── Supabase-klient med service role ──────────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // ── Claim token (revoked=false och inte utgången) ─
    // used-villkoret borttaget — token kan användas flera gånger inom giltighetstiden
    const { data: claimed } = await supabase
      .from("delegate_tokens")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("token", token)
      .eq("revoked", false)
      .gt("expires_at", new Date().toISOString())
      .select("id, patient_id, log_id")
      .maybeSingle()

    if (!claimed) {
      return jsonResponse({ success: false, reason: "token_revoked_or_expired" })
    }

    // ── Bygg logg-data ────────────────────────────────
    const logData: Record<string, unknown> = {
      patient_id: claimed.patient_id,
      logged_by_proxy: true,
      proxy_name: proxyName.trim(),
      energy: scores.energy,
      breathing: scores.breathing,
      head_balance: scores.head_balance,
      general_wellbeing: scores.general_wellbeing,
      mental_wellbeing: scores.mental_wellbeing,
      selected_symptoms: selectedSymptoms ?? [],
      notes: notes?.trim() || null,
      ...(loggedAtValue && { logged_at: loggedAtValue }),
    }

    let logId: string | null = claimed.log_id ?? null

    if (logId) {
      // a) Token är redan kopplad till en logg — uppdatera den
      const { error: updateError } = await supabase
        .from("logs")
        .update(logData)
        .eq("id", logId)

      if (updateError) {
        console.error("Failed to update log:", updateError)
        return jsonResponse({ success: false, reason: "log_save_failed" })
      }
    } else {
      // b) Ingen kopplad logg — kolla om det finns en logg för dagen
      const { gte, lte } = stockholmDayBounds(loggedAtValue ?? undefined)

      const { data: existingLog } = await supabase
        .from("logs")
        .select("id")
        .eq("patient_id", claimed.patient_id)
        .gte("logged_at", gte)
        .lte("logged_at", lte)
        .order("logged_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingLog) {
        // Uppdatera befintlig logg
        const { error: updateError } = await supabase
          .from("logs")
          .update(logData)
          .eq("id", existingLog.id)

        if (updateError) {
          console.error("Failed to update existing log:", updateError)
          return jsonResponse({ success: false, reason: "log_save_failed" })
        }
        logId = existingLog.id
      } else {
        // Skapa ny logg
        const { data: newLog, error: insertError } = await supabase
          .from("logs")
          .insert(logData)
          .select("id")
          .single()

        if (insertError || !newLog) {
          console.error("Failed to insert log:", insertError)
          return jsonResponse({ success: false, reason: "log_save_failed" })
        }
        logId = newLog.id
      }

      // Koppla token till loggen
      await supabase
        .from("delegate_tokens")
        .update({ log_id: logId })
        .eq("id", claimed.id)
    }

    return jsonResponse({ success: true })
  } catch (err) {
    console.error("proxy-submit-log error:", err)
    return jsonResponse({ success: false, reason: "server_error" })
  }
})
