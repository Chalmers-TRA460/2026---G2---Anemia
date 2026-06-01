// ── Score helpers ─────────────────────────────────

const CATEGORIES = [
  'energy', 'breathing', 'head_balance', 'general_wellbeing', 'mental_wellbeing',
]

// Average of all 5 category scores for a single log entry.
export function avgScore(log) {
  if (!log) return null
  const vals = CATEGORIES.map(k => log[k]).filter(v => typeof v === 'number')
  if (!vals.length) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

// CSS modifier for a numeric average: 'red' | 'yellow' | 'green' | 'gray'
// Scale: 1=bad → 5=good. Red ≤ 2, yellow 2–3.5, green ≥ 3.6
export function scoreColor(avg) {
  if (avg === null || avg === undefined) return 'gray'
  if (avg <= 2.0) return 'red'
  if (avg <= 3.5) return 'yellow'
  return 'green'
}

// Format a numeric average to one decimal, or '–' if null.
export function fmtScore(avg) {
  if (avg === null || avg === undefined) return '–'
  return avg.toFixed(1)
}

// ── Flag computation ──────────────────────────────

const FALL_SYMPTOMS    = ['Svimningskänsla', 'Yrsel', 'Dålig balans']
const CARDIAC_SYMPTOMS = ['Hjärtklappning', 'Hög puls']

/**
 * Compute all flags for a patient given their logs.
 *
 * @param {object[]} logs  Sorted newest-first. Must cover at least 7 days.
 * @returns {{ [flagKey]: boolean }}
 */
export function computeFlags(logs) {
  const now  = new Date()
  const h72  = new Date(now.getTime() -  3 * 24 * 60 * 60 * 1000)
  const d7   = new Date(now.getTime() -  7 * 24 * 60 * 60 * 1000)

  const last3  = logs.slice(0, 3)
  const prev3  = logs.slice(3, 6)
  const last7d = logs.filter(l => new Date(l.logged_at) >= d7)

  // not_logged_3_days: no log in the last 72 h
  const not_logged_3_days =
    logs.length === 0 || new Date(logs[0].logged_at) < h72

  // declining_trend: avg of last 3 < avg of prior 3 by ≥ 0.5
  let declining_trend = false
  if (last3.length === 3 && prev3.length === 3) {
    const avg3 = last3.reduce((s, l) => s + (avgScore(l) ?? 0), 0) / 3
    const avgP = prev3.reduce((s, l) => s + (avgScore(l) ?? 0), 0) / 3
    declining_trend = avg3 < avgP - 0.5
  }

  // critical_low: any single category ≤ 1 in the last 3 logs
  const critical_low = last3.some(l =>
    CATEGORIES.some(k => typeof l[k] === 'number' && l[k] <= 1)
  )

  // fall_risk: head_balance ≤ 2 AND fall symptom present, within 7 days
  const fall_risk = last7d.some(l =>
    l.head_balance <= 2 &&
    Array.isArray(l.selected_symptoms) &&
    l.selected_symptoms.some(s => FALL_SYMPTOMS.includes(s))
  )

  // cardiac_compensation: breathing ≤ 2 AND cardiac symptom, within 7 days
  const cardiac_compensation = last7d.some(l =>
    l.breathing <= 2 &&
    Array.isArray(l.selected_symptoms) &&
    l.selected_symptoms.some(s => CARDIAC_SYMPTOMS.includes(s))
  )

  // low_mental: mental_wellbeing ≤ 2 in any of the last 3 logs
  const low_mental = last3.some(
    l => typeof l.mental_wellbeing === 'number' && l.mental_wellbeing <= 2
  )

  return {
    not_logged_3_days,
    declining_trend,
    critical_low,
    fall_risk,
    cardiac_compensation,
    low_mental,
  }
}

// Returns only the keys of active flags as an array.
export function getActiveFlags(logs) {
  const flags = computeFlags(logs)
  return Object.entries(flags)
    .filter(([, v]) => v)
    .map(([k]) => k)
}

// Returns true if any flag is active.
export function hasAnyFlag(logs) {
  return getActiveFlags(logs).length > 0
}

// ── Flag metadata for display ─────────────────────

// severity: 'critical' (red) | 'warning' (yellow)
export const FLAG_INFO = {
  not_logged_3_days:    { label: 'Ej loggat 3 dagar', severity: 'warning'  },
  declining_trend:      { label: 'Sjunkande trend',   severity: 'warning'  },
  critical_low:         { label: 'Kritiskt lågt',     severity: 'critical' },
  fall_risk:            { label: 'Fallrisk',           severity: 'critical' },
  cardiac_compensation: { label: 'Hjärtsymtom',        severity: 'critical' },
  low_mental:           { label: 'Lågt mående',        severity: 'warning'  },
}

// ── Grouping helper ───────────────────────────────

// Groups a flat array of logs by patient_id.
// Returns: Map<patientId, log[]>  (each list newest-first)
export function groupLogsByPatient(logs) {
  const map = new Map()
  for (const log of logs) {
    if (!map.has(log.patient_id)) map.set(log.patient_id, [])
    map.get(log.patient_id).push(log)
  }
  return map
}
