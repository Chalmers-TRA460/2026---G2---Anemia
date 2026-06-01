import { computeWeekAvg, avgToColor, avgToFaceIcon } from '../../lib/stats'
import { getWeekNumber } from '../../lib/dates'

export default function TrendStrip({ weeksData }) {
  // weeksData is ordered oldest → newest (already reversed by MyData)
  return (
    <div className="trend-container">
      <div className="trend-line" aria-hidden="true" />
      <div className="trend-circles">
        {weeksData.map((week, i) => {
          const avg = computeWeekAvg(week.logs)
          const hasData = avg !== null
          const color = avgToColor(avg)
          const icon = avgToFaceIcon(avg)
          const weekNum = getWeekNumber(week.days[0])

          return (
            <div key={i} className="trend-week">
              {hasData ? (
                <div
                  className="trend-circle trend-circle--data"
                  style={{ background: `${color}18`, borderColor: color }}
                  aria-label={`Vecka ${weekNum}: genomsnitt ${avg.toFixed(1)}`}
                >
                  <span
                    className="material-icons-outlined trend-face-icon"
                    style={{ color }}
                  >
                    {icon}
                  </span>
                </div>
              ) : (
                <div
                  className="trend-circle trend-circle--empty"
                  aria-label={`Vecka ${weekNum}: inga loggningar`}
                >
                  <span className="trend-empty-dash">–</span>
                </div>
              )}
              <span className="trend-week-label">V{weekNum}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
