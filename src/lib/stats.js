const RATING_FIELDS = [
  'energy',
  'breathing',
  'head_balance',
  'general_wellbeing',
  'mental_wellbeing',
]

// Average of all 5 rating fields across all logs in a week
export function computeWeekAvg(logs) {
  if (!logs || logs.length === 0) return null
  let total = 0
  let count = 0
  for (const log of logs) {
    for (const field of RATING_FIELDS) {
      if (log[field] != null) {
        total += log[field]
        count++
      }
    }
  }
  return count > 0 ? total / count : null
}

// Average of one specific field across all logs
export function computeFieldAvg(logs, field) {
  if (!logs || logs.length === 0) return null
  const values = logs.map(l => l[field]).filter(v => v != null)
  if (values.length === 0) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}

export function avgToText(avg) {
  if (avg === null) return null
  if (avg < 2.0) return 'Du har haft det jobbigt den här veckan'
  if (avg < 3.0) return 'Du har haft en del besvär den här veckan'
  if (avg < 3.5) return 'Du har mått okej den här veckan'
  if (avg < 4.5) return 'Du har mått ganska bra den här veckan'
  return 'Du har mått riktigt bra den här veckan'
}

export function avgToColor(avg) {
  if (avg === null) return '#aaa'
  if (avg < 2.0) return '#c0392b'
  if (avg < 3.0) return '#e67e22'
  if (avg < 3.5) return '#f39c12'
  if (avg < 4.5) return '#8bc34a'
  return '#27ae60'
}

export function avgToFaceIcon(avg) {
  if (avg === null) return null
  if (avg < 2.0) return 'sentiment_very_dissatisfied'
  if (avg < 3.0) return 'sentiment_dissatisfied'
  if (avg < 3.5) return 'sentiment_neutral'
  if (avg < 4.5) return 'sentiment_satisfied'
  return 'sentiment_very_satisfied'
}

// 'better' | 'worse' | 'neutral' | null
export function compareWeeks(thisAvg, lastAvg) {
  if (thisAvg === null || lastAvg === null) return null
  const diff = thisAvg - lastAvg
  if (Math.abs(diff) < 0.3) return 'neutral'
  return diff > 0 ? 'better' : 'worse'
}

export function formatAvg(avg) {
  if (avg === null) return '–'
  return new Intl.NumberFormat('sv-SE', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(avg)
}
