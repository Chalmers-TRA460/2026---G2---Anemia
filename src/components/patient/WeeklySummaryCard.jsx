import { computeWeekAvg, avgToText, avgToColor, avgToFaceIcon, formatAvg } from '../../lib/stats'

export default function WeeklySummaryCard({ logs }) {
  const avg = computeWeekAvg(logs)
  const color = avgToColor(avg)
  const icon = avgToFaceIcon(avg)
  const text = avgToText(avg)

  if (!logs || logs.length === 0) {
    return (
      <div className="card summary-card summary-card--empty">
        <p className="summary-empty-text">
          Inga loggningar den här veckan ännu.
        </p>
      </div>
    )
  }

  return (
    <div className="card summary-card">
      <div
        className="summary-face-circle"
        style={{
          background: `${color}18`,
          borderColor: color,
        }}
        aria-hidden="true"
      >
        <span
          className="material-icons-outlined summary-face-icon"
          style={{ color }}
        >
          {icon}
        </span>
      </div>

      <div className="summary-text">
        <p className="summary-description">{text}</p>
        <p className="summary-avg">
          Genomsnitt: <strong>{formatAvg(avg)}</strong> av 5
        </p>
      </div>
    </div>
  )
}
