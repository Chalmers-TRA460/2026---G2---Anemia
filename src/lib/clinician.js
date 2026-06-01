import { supabase } from './supabase'

// ── Dashboard ─────────────────────────────────────

/**
 * Fetches everything needed for the dashboard in parallel:
 *   - All patients (role='patient')
 *   - Their logs from the last 14 days (enough to find the latest log
 *     and evaluate the "logged in last 3 days" indicator)
 *   - All currently active flag_events (resolved_at is null)
 */
export async function fetchDashboardData() {
  const since14d = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const since2d  = new Date(Date.now() -  2 * 24 * 60 * 60 * 1000).toISOString()

  const [patientsRes, logsRes, flagsRes, transfusionsRes] = await Promise.all([
    supabase
      .from('users')
      .select('id, full_name, email, next_appointment')
      .eq('role', 'patient')
      .order('full_name', { ascending: true }),

    supabase
      .from('logs')
      .select(
        'id, patient_id, logged_at, ' +
        'energy, breathing, head_balance, general_wellbeing, mental_wellbeing, ' +
        'logged_by_proxy'
      )
      .gte('logged_at', since14d)
      .order('logged_at', { ascending: false }),

    supabase
      .from('flag_events')
      .select('id, patient_id, flag_type, flag_category, severity, triggered_at, details')
      .is('resolved_at', null),

    supabase
      .from('transfusions')
      .select('patient_id, transfused_at')
      .gte('transfused_at', since2d)
      .order('transfused_at', { ascending: false }),
  ])

  const error = patientsRes.error ?? logsRes.error ?? flagsRes.error ?? transfusionsRes.error
  return {
    patients:     patientsRes.data     ?? [],
    logs:         logsRes.data         ?? [],
    flags:        flagsRes.data        ?? [],
    transfusions: transfusionsRes.data ?? [],
    error,
  }
}

/**
 * Combines raw dashboard data into enriched patient objects.
 * Each patient gets: latestLog, logsLast3Days (bool), flags.
 */
const SCORE_KEYS = ['energy', 'breathing', 'head_balance', 'general_wellbeing', 'mental_wellbeing']

export function enrichPatients({ patients, logs, flags, transfusions = [] }) {
  const h72 = Date.now() - 3 * 24 * 60 * 60 * 1000
  const h7d = Date.now() - 7 * 24 * 60 * 60 * 1000

  // Most recent transfusion per patient (within last 2 days)
  const reviewedAt = {}
  for (const t of transfusions) {
    if (!reviewedAt[t.patient_id] || t.transfused_at > reviewedAt[t.patient_id]) {
      reviewedAt[t.patient_id] = t.transfused_at
    }
  }

  const logsByPatient = new Map()
  for (const log of logs) {
    if (!logsByPatient.has(log.patient_id)) logsByPatient.set(log.patient_id, [])
    logsByPatient.get(log.patient_id).push(log)
  }

  const flagsByPatient = new Map()
  for (const flag of flags) {
    if (!flagsByPatient.has(flag.patient_id)) flagsByPatient.set(flag.patient_id, [])
    flagsByPatient.get(flag.patient_id).push(flag)
  }

  return patients.map(p => {
    const patientLogs    = logsByPatient.get(p.id) ?? []
    const latestLog      = patientLogs[0] ?? null
    const loggedRecently = latestLog ? new Date(latestLog.logged_at).getTime() >= h72 : false

    // Average over last 7 days
    const weekLogs   = patientLogs.filter(l => new Date(l.logged_at).getTime() >= h7d)
    const weekScores = weekLogs.map(l => {
      const vals = SCORE_KEYS.map(k => l[k]).filter(v => typeof v === 'number')
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
    }).filter(v => v !== null)
    const weekAvg = weekScores.length
      ? weekScores.reduce((a, b) => a + b, 0) / weekScores.length
      : null

    return {
      ...p,
      latestLog,
      loggedRecently,
      weekAvg,
      flags:            flagsByPatient.get(p.id) ?? [],
      recentlyReviewed: !!reviewedAt[p.id],
      reviewedAt:       reviewedAt[p.id] ?? null,
    }
  })
}

// ── Patient view ──────────────────────────────────

export async function fetchPatient(id) {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, next_appointment')
    .eq('id', id)
    .maybeSingle()
  return { data, error }
}

export async function fetchPatientLogs(patientId) {
  const { data, error } = await supabase
    .from('logs')
    .select(
      'id, patient_id, logged_at, logged_by_proxy, proxy_name, ' +
      'energy, breathing, head_balance, general_wellbeing, mental_wellbeing, ' +
      'selected_symptoms, notes, updated_at'
    )
    .eq('patient_id', patientId)
    .order('logged_at', { ascending: false })
  return { data: data ?? [], error }
}

export async function fetchActiveFlags(patientId) {
  const { data, error } = await supabase
    .from('flag_events')
    .select('id, patient_id, flag_type, flag_category, severity, triggered_at, details')
    .eq('patient_id', patientId)
    .is('resolved_at', null)
    .order('triggered_at', { ascending: false })
  return { data: data ?? [], error }
}

// ── Appointment ───────────────────────────────────

export async function updateNextAppointment(patientId, isoDatetime) {
  const { error } = await supabase
    .from('users')
    .update({ next_appointment: isoDatetime })
    .eq('id', patientId)
  return { error }
}

// ── Transfusion ───────────────────────────────────

/**
 * Records a transfusion. The database trigger automatically resolves
 * all active flag_events for this patient — no extra calls needed.
 */
export async function insertTransfusion(patientId, clinicianId, notes) {
  const { data, error } = await supabase
    .from('transfusions')
    .insert({
      patient_id:  patientId,
      recorded_by: clinicianId,
      notes:       notes?.trim() || null,
    })
    .select('id, transfused_at')
    .single()
  return { data, error }
}

// ── Clinician notes ───────────────────────────────

export async function fetchClinicianNotes(patientId) {
  const { data, error } = await supabase
    .from('clinician_notes')
    .select(
      'id, clinician_id, content, created_at, updated_at, ' +
      'author:clinician_id(full_name)'
    )
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
  return { data: data ?? [], error }
}

export async function insertClinicianNote(patientId, clinicianId, content) {
  const { data, error } = await supabase
    .from('clinician_notes')
    .insert({
      patient_id:   patientId,
      clinician_id: clinicianId,
      content:      content.trim(),
    })
    .select('id, clinician_id, content, created_at, updated_at, author:clinician_id(full_name)')
    .single()
  return { data, error }
}

export async function updateClinicianNote(noteId, content) {
  const { data, error } = await supabase
    .from('clinician_notes')
    .update({ content: content.trim(), updated_at: new Date().toISOString() })
    .eq('id', noteId)
    .select('id, clinician_id, content, created_at, updated_at, author:clinician_id(full_name)')
    .single()
  return { data, error }
}
