import { supabase } from './supabase'

// ── Patients ─────────────────────────────────────

export async function getPatients() {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, next_appointment')
    .eq('role', 'patient')
    .order('full_name', { ascending: true })
  return { data: data ?? [], error }
}

// ── Logs ─────────────────────────────────────────

// Fetch logs for multiple patients in one query (for overview).
// days=10 gives enough history for all flag computations.
export async function getLogsForPatients(patientIds, days = 10) {
  if (!patientIds.length) return { data: [], error: null }
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('logs')
    .select(
      'id, patient_id, logged_at, logged_by_proxy, proxy_name, ' +
      'energy, breathing, head_balance, general_wellbeing, mental_wellbeing, ' +
      'selected_symptoms, notes'
    )
    .in('patient_id', patientIds)
    .gte('logged_at', since)
    .order('logged_at', { ascending: false })

  return { data: data ?? [], error }
}

// Fetch logs for a single patient (patient detail view).
export async function getPatientLogs(patientId, days = 28) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .eq('patient_id', patientId)
    .gte('logged_at', since)
    .order('logged_at', { ascending: false })

  return { data: data ?? [], error }
}

// ── Appointments ──────────────────────────────────

export async function getUpcomingAppointments(hours = 48) {
  const now = new Date().toISOString()
  const cutoff = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('appointments')
    .select('id, patient_id, scheduled_for, status, notes')
    .eq('status', 'scheduled')
    .gte('scheduled_for', now)
    .lte('scheduled_for', cutoff)
    .order('scheduled_for', { ascending: true })

  return { data: data ?? [], error }
}

export async function getPatientAppointments(patientId) {
  const { data, error } = await supabase
    .from('appointments')
    .select('id, patient_id, scheduled_for, status, notes, created_at, created_by')
    .eq('patient_id', patientId)
    .order('scheduled_for', { ascending: false })

  return { data: data ?? [], error }
}

export async function insertAppointment(patientId, clinicianId, scheduledFor, notes) {
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: patientId,
      created_by: clinicianId,
      scheduled_for: scheduledFor,
      status: 'scheduled',
      notes: notes?.trim() || null,
    })
    .select()
    .single()

  return { data, error }
}

export async function updateAppointmentStatus(id, status) {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

export async function updatePatientAppointment(patientId, scheduledFor) {
  const { error } = await supabase
    .from('users')
    .update({ next_appointment: scheduledFor })
    .eq('id', patientId)
  return { error }
}

// ── Clinical actions (mark as reviewed) ───────────

export async function getRecentClinicalActions(hours = 48) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('clinical_actions')
    .select('id, patient_id, clinician_id, action_at, note')
    .gte('action_at', since)
    .order('action_at', { ascending: false })

  return { data: data ?? [], error }
}

export async function insertClinicalAction(patientId, clinicianId, note) {
  const { data, error } = await supabase
    .from('clinical_actions')
    .insert({
      patient_id: patientId,
      clinician_id: clinicianId,
      action_at: new Date().toISOString(),
      note: note?.trim() || null,
    })
    .select()
    .single()

  return { data, error }
}

// ── Clinician notes ───────────────────────────────

export async function getClinicianNotes(patientId) {
  const { data, error } = await supabase
    .from('clinician_notes')
    .select(
      'id, patient_id, clinician_id, content, created_at, updated_at, ' +
      'users:clinician_id (full_name)'
    )
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  return { data: data ?? [], error }
}

export async function insertClinicianNote(patientId, clinicianId, content) {
  const { data, error } = await supabase
    .from('clinician_notes')
    .insert({ patient_id: patientId, clinician_id: clinicianId, content: content.trim() })
    .select()
    .single()

  return { data, error }
}

export async function updateClinicianNote(id, content) {
  const { data, error } = await supabase
    .from('clinician_notes')
    .update({ content: content.trim(), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

export async function deleteClinicianNote(id) {
  const { error } = await supabase
    .from('clinician_notes')
    .delete()
    .eq('id', id)

  return { error }
}

// ── Messages ──────────────────────────────────────

export async function sendMessage(patientId, clinicianId, content) {
  const { data, error } = await supabase
    .from('clinician_messages')
    .insert({
      patient_id: patientId,
      clinician_id: clinicianId,
      content: content.trim(),
    })
    .select()
    .single()

  return { data, error }
}

// Called from patient view — fetches unread messages for the logged-in patient.
export async function getUnreadMessages(patientId) {
  const { data, error } = await supabase
    .from('clinician_messages')
    .select('id, content, created_at, clinician:clinician_id(full_name)')
    .eq('patient_id', patientId)
    .is('read_at', null)
    .order('created_at', { ascending: false })

  return { data: data ?? [], error }
}

export async function getPatient(id) {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, next_appointment')
    .eq('id', id)
    .maybeSingle()
  return { data, error }
}

export async function markMessageRead(id) {
  const { error } = await supabase
    .from('clinician_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)

  return { error }
}

// ── Weekly report aggregation ─────────────────────

export async function getWeeklyStats(patientIds) {
  if (!patientIds.length) {
    return {
      data: {
        totalPatients: 0,
        loggedThisWeek: 0,
        pctLogged: 0,
        avgScore: null,
        alarmCount: 0,
        proxyCount: 0,
        actionCount: 0,
        dailyAvgs: [],
        logsRaw: [],
      },
      error: null,
    }
  }

  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: logs,    error: logsErr },
    { data: actions, error: actErr  },
  ] = await Promise.all([
    supabase
      .from('logs')
      .select(
        'id, patient_id, logged_at, logged_by_proxy, ' +
        'energy, breathing, head_balance, general_wellbeing, mental_wellbeing'
      )
      .in('patient_id', patientIds)
      .gte('logged_at', since7d)
      .order('logged_at', { ascending: true }),
    supabase
      .from('clinical_actions')
      .select('id, patient_id, action_at')
      .gte('action_at', since7d),
  ])

  if (logsErr || actErr) {
    return { data: null, error: logsErr ?? actErr }
  }

  const logsData    = logs    ?? []
  const actionsData = actions ?? []

  // % who logged at least once
  const loggedPatients = new Set(logsData.map(l => l.patient_id))
  const pctLogged = patientIds.length
    ? Math.round((loggedPatients.size / patientIds.length) * 100)
    : 0

  // Overall avg score
  const CATS = ['energy', 'breathing', 'head_balance', 'general_wellbeing', 'mental_wellbeing']
  const allScores = logsData.flatMap(l =>
    CATS.map(k => l[k]).filter(v => typeof v === 'number')
  )
  const avgScore = allScores.length
    ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10
    : null

  // Daily averages (for sparkline)
  const dayMap = {}
  logsData.forEach(l => {
    const day = l.logged_at.slice(0, 10)
    const scores = CATS.map(k => l[k]).filter(v => typeof v === 'number')
    if (!scores.length) return
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    if (!dayMap[day]) dayMap[day] = { sum: 0, count: 0 }
    dayMap[day].sum += avg
    dayMap[day].count++
  })
  const dailyAvgs = Object.entries(dayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { sum, count }]) => ({ date, avg: Math.round((sum / count) * 10) / 10 }))

  return {
    data: {
      totalPatients:  patientIds.length,
      loggedThisWeek: loggedPatients.size,
      pctLogged,
      avgScore,
      proxyCount:  logsData.filter(l => l.logged_by_proxy).length,
      actionCount: actionsData.length,
      dailyAvgs,
      logsRaw: logsData,
    },
    error: null,
  }
}
