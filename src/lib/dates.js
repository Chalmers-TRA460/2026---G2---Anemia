const TZ = 'Europe/Stockholm'

export function getStockholmDateString(date = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function isLoggedToday(loggedAt) {
  return getStockholmDateString(new Date(loggedAt)) === getStockholmDateString()
}

export function formatSwedishDateTime(date) {
  const d = new Date(date)
  const datePart = new Intl.DateTimeFormat('sv-SE', {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(d)
  const timePart = new Intl.DateTimeFormat('sv-SE', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
  const capitalized = datePart.charAt(0).toUpperCase() + datePart.slice(1)
  return `${capitalized} · ${timePart}`
}

export function formatRelativeTime(date) {
  const d = new Date(date)
  const now = new Date()
  const dateStr = getStockholmDateString(d)
  const todayStr = getStockholmDateString(now)
  const timeStr = new Intl.DateTimeFormat('sv-SE', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)

  if (dateStr === todayStr) return `idag kl ${timeStr}`

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateStr === getStockholmDateString(yesterday)) return `igår kl ${timeStr}`

  const dateLabel = new Intl.DateTimeFormat('sv-SE', {
    timeZone: TZ,
    day: 'numeric',
    month: 'short',
  }).format(d)
  return `${dateLabel} kl ${timeStr}`
}

// Returns array of 7 date strings (Mon–Sun) for the given week
// weekOffset: 0 = this week, -1 = last week
export function getWeekDays(weekOffset = 0) {
  const todayStr = getStockholmDateString()
  const [year, month, day] = todayStr.split('-').map(Number)
  const today = new Date(year, month - 1, day)
  const dayOfWeek = today.getDay()
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const monday = new Date(today)
  monday.setDate(today.getDate() - daysFromMonday + weekOffset * 7)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return getStockholmDateString(d)
  })
}

export function getWeekNumber(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  d.setHours(0, 0, 0, 0)
  const dayNum = d.getDay() || 7
  d.setDate(d.getDate() + 4 - dayNum)
  const yearStart = new Date(d.getFullYear(), 0, 1)
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
}
