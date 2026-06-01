import { getStockholmDateString } from '../../lib/dates'

const DAY_LABELS = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']

export default function WeekProgress({ weekDays, loggedDaysSet }) {
  const today = getStockholmDateString()

  return (
    <div className="week-progress">
      {weekDays.map((day, i) => {
        const isLogged = loggedDaysSet.has(day)
        const isToday = day === today
        const isFuture = day > today

        return (
          <div key={day} className="week-day-col">
            <div
              className={[
                'week-circle',
                isLogged ? 'week-circle--logged' : '',
                isToday && !isLogged ? 'week-circle--today' : '',
                isFuture ? 'week-circle--future' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={
                isLogged
                  ? `${DAY_LABELS[i]}: loggad`
                  : isToday
                  ? `${DAY_LABELS[i]}: idag`
                  : `${DAY_LABELS[i]}: ej loggad`
              }
            />
            <span
              className={`week-day-label${isToday ? ' week-day-label--today' : ''}`}
            >
              {DAY_LABELS[i]}
            </span>
          </div>
        )
      })}
    </div>
  )
}
