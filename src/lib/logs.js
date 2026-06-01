import { supabase } from './supabase'
import { getStockholmDateString } from './dates'

export async function getTodaysLog(patientId) {
  const today = getStockholmDateString()

  // Compute UTC bounds for the full Stockholm calendar day.
  // Stockholm is UTC+1 (winter) or UTC+2 (summer), so Stockholm midnight
  // can be up to 2 hours before UTC midnight. We fetch a 26-hour window
  // anchored on Stockholm midnight and filter client-side to be safe.
  const startUTC = new Date(`${today}T00:00:00+02:00`) // worst case: UTC+2 (CEST)
  const endUTC   = new Date(`${today}T23:59:59+01:00`) // worst case: UTC+1 (CET)

  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .eq('patient_id', patientId)
    .gte('logged_at', startUTC.toISOString())
    .lte('logged_at', endUTC.toISOString())
    .order('logged_at', { ascending: false })
    .limit(5) // small buffer in case of multiple logs in window

  if (error || !data?.length) return { data: null, error }

  // Return the most recent log whose Stockholm date matches today
  const match = data.find(
    row => getStockholmDateString(new Date(row.logged_at)) === today
  )
  return { data: match ?? null, error: null }
}

export async function getWeekLogs(patientId, weekDays) {
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .eq('patient_id', patientId)
    .gte('logged_at', `${weekDays[0]}T00:00:00`)
    .lte('logged_at', `${weekDays[6]}T23:59:59`)
    .order('logged_at', { ascending: true })

  return { data: data ?? [], error }
}

export async function getRecentLogs(patientId, days = 28) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceStr = getStockholmDateString(since)

  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .eq('patient_id', patientId)
    .gte('logged_at', `${sinceStr}T00:00:00`)
    .order('logged_at', { ascending: true })

  return { data: data ?? [], error }
}

export async function insertLog(logData) {
  const { data, error } = await supabase
    .from('logs')
    .insert(logData)
    .select()
    .single()

  return { data, error }
}

export async function updateLog(id, updates) {
  const { data, error } = await supabase
    .from('logs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

export async function upsertLog(patientId, logData, existingId = null) {
  if (existingId) {
    return updateLog(existingId, logData)
  }
  return insertLog({
    ...logData,
    patient_id: patientId,
    logged_at: new Date().toISOString(),
  })
}

export async function getDelegateTokens(patientId) {
  const { data, error } = await supabase
    .from('delegate_tokens')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  return { data: data ?? [], error }
}

export async function revokeToken(tokenId) {
  const { data, error } = await supabase
    .from('delegate_tokens')
    .update({ revoked: true })
    .eq('id', tokenId)
    .select()
    .single()

  return { data, error }
}

export async function generateDelegateToken(patientId) {
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('delegate_tokens')
    .insert({ token, patient_id: patientId, expires_at: expiresAt, used: false })
    .select()
    .single()

  return { data, error, token }
}
