// ── Score helpers ─────────────────────────────────

const SCORE_KEYS = ['energy', 'breathing', 'head_balance', 'general_wellbeing', 'mental_wellbeing']

/** Average of all 5 categories for a single log. Returns null if no numeric values. */
export function avgLogScore(log) {
  if (!log) return null
  const vals = SCORE_KEYS.map(k => log[k]).filter(v => typeof v === 'number')
  if (!vals.length) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

/**
 * Maps an average score to a CSS modifier string for .cl-score--{n}.
 * Uses midpoint rounding so each integer gets a fair range.
 */
export function avgToScoreClass(avg) {
  if (avg === null || avg === undefined) return 'none'
  if (avg <= 1.5) return '1'
  if (avg <= 2.5) return '2'
  if (avg <= 3.5) return '3'
  if (avg <= 4.5) return '4'
  return '5'
}

/** Status emoji based on average score (matches spec thresholds). */
export function scoreEmoji(avg) {
  if (avg === null) return '⚪'
  if (avg <= 2)   return '🔴'
  if (avg <= 3.5) return '🟡'
  return '🟢'
}

/** Format avg to one decimal, or '–' if null. */
export function fmtAvg(avg) {
  return avg !== null ? avg.toFixed(1) : '–'
}

// ── Severity helpers ──────────────────────────────

const SEVERITY_ORDER = { critical: 0, concerning: 1, risk: 2 }

/**
 * Returns the highest severity among a patient's active flags.
 * @returns {'critical'|'concerning'|'risk'|null}
 */
export function getHighestSeverity(flags) {
  if (!flags || !flags.length) return null
  return flags
    .map(f => f.severity)
    .filter(s => s in SEVERITY_ORDER)
    .sort((a, b) => SEVERITY_ORDER[a] - SEVERITY_ORDER[b])[0] ?? null
}

/** Count flags of a given severity. */
export function countSeverity(flags, severity) {
  return flags.filter(f => f.severity === severity).length
}

// ── Sorting ───────────────────────────────────────

/**
 * Sorts an array of enriched patient objects by risk:
 *  1. Highest severity (critical > concerning > risk)
 *  2. Among equal highest: most flags of that severity
 *  3. Tiebreaker: lowest latest avg score first
 *
 * @param {{ patient: object, flags: object[], latestLog: object|null }[]} items
 */
export function sortPatientsByRisk(items) {
  return [...items].sort((a, b) => {
    const sevA = getHighestSeverity(a.flags)
    const sevB = getHighestSeverity(b.flags)
    const ordA = SEVERITY_ORDER[sevA] ?? 99
    const ordB = SEVERITY_ORDER[sevB] ?? 99

    if (ordA !== ordB) return ordA - ordB

    // Same highest severity — more flags of that severity first
    const cntA = countSeverity(a.flags, sevA)
    const cntB = countSeverity(b.flags, sevB)
    if (cntA !== cntB) return cntB - cntA

    // Tiebreaker: lower avg score first (sicker patients higher)
    const scoreA = avgLogScore(a.latestLog) ?? 5
    const scoreB = avgLogScore(b.latestLog) ?? 5
    return scoreA - scoreB
  })
}
