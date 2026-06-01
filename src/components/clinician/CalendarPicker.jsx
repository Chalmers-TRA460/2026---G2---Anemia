import { useState } from 'react'

const WEEKDAYS = ['MÅN', 'TIS', 'ONS', 'TORS', 'FRE', 'LÖR', 'SÖN']
const MONTHS   = [
  'januari','februari','mars','april','maj','juni',
  'juli','augusti','september','oktober','november','december',
]

// value: 'YYYY-MM-DD' | null   onChange: (dateStr) => void
export default function CalendarPicker({ value, onChange }) {
  const today = new Date()
  const todayStr = iso(today.getFullYear(), today.getMonth() + 1, today.getDate())

  const init = value ? new Date(value + 'T12:00') : today
  const [year,  setYear]  = useState(init.getFullYear())
  const [month, setMonth] = useState(init.getMonth())

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // Monday-based: Sun=0→6, Mon=1→0, …
  const raw = new Date(year, month, 1).getDay()
  const firstDay = raw === 0 ? 6 : raw - 1

  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  function iso(y, m, d) {
    return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
  }

  return (
    <div className="cl-cal">
      <div className="cl-cal-header">
        <span className="cl-cal-month-label">
          {MONTHS[month]} {year}
        </span>
        <div className="cl-cal-nav">
          <button className="cl-cal-nav-btn" onClick={prevMonth} aria-label="Föregående månad">
            <span className="material-icons">chevron_left</span>
          </button>
          <button className="cl-cal-nav-btn" onClick={nextMonth} aria-label="Nästa månad">
            <span className="material-icons">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="cl-cal-grid">
        {WEEKDAYS.map(d => (
          <span key={d} className="cl-cal-wd">{d}</span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <span key={`e${i}`} />
          const ds      = iso(year, month + 1, day)
          const isToday = ds === todayStr
          const isSel   = ds === value
          return (
            <button
              key={ds}
              className={`cl-cal-day${isToday ? ' cl-cal-day--today' : ''}${isSel ? ' cl-cal-day--sel' : ''}`}
              onClick={() => onChange(ds)}
              aria-label={`${day} ${MONTHS[month]} ${year}`}
              aria-pressed={isSel}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
