import { getStockholmDateString } from '../../lib/dates'
import { avgToColor } from '../../lib/stats'

const DAY_LABELS = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']
const RATING_FIELDS = [
  'energy', 'breathing', 'head_balance', 'general_wellbeing', 'mental_wellbeing',
]

// SVG coordinate system
const VB_W = 300
const VB_H = 170
const LEFT = 30    // space for y-axis labels
const RIGHT = 8
const TOP = 12
const BOTTOM = 32  // space for x-axis labels
const PLOT_W = VB_W - LEFT - RIGHT   // 262
const PLOT_H = VB_H - TOP - BOTTOM   // 126

const xOf = i => LEFT + (i / 6) * PLOT_W
const yOf = score => TOP + (1 - (score - 1) / 4) * PLOT_H

const GRID_SCORES = [1, 2, 3, 4, 5]

function dayAvg(logs) {
  let total = 0, count = 0
  for (const log of logs) {
    for (const f of RATING_FIELDS) {
      if (log[f] != null) { total += log[f]; count++ }
    }
  }
  return count > 0 ? total / count : null
}

export default function DailyChart({ logs, weekDays }) {
  const today = getStockholmDateString()

  const days = weekDays.map((dayStr, i) => {
    const dayLogs = logs.filter(
      l => getStockholmDateString(new Date(l.logged_at)) === dayStr
    )
    const score = dayLogs.length > 0 ? dayAvg(dayLogs) : null
    return {
      i,
      x: xOf(i),
      y: score !== null ? yOf(score) : null,
      score,
      label: DAY_LABELS[i],
      isToday: dayStr === today,
      isFuture: dayStr > today,
    }
  })

  const hasAnyData = days.some(d => d.score !== null)

  return (
    <div className="daily-chart-wrap">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="daily-chart-svg"
        role="img"
        aria-label="Graf över dagligt välmående denna vecka"
      >
        {/* ── Today column highlight (drawn first = behind everything) ── */}
        {days.filter(d => d.isToday).map(d => (
          <rect
            key="today-bg"
            x={d.x - 20}
            y={TOP - 4}
            width={40}
            height={PLOT_H + 8}
            fill="rgba(192, 57, 43, 0.05)"
            rx="6"
          />
        ))}

        {/* ── Horizontal grid lines ── */}
        {GRID_SCORES.map(score => (
          <g key={score}>
            <line
              x1={LEFT} y1={yOf(score)}
              x2={VB_W - RIGHT} y2={yOf(score)}
              stroke={score === 3 ? '#d4d4d4' : '#ececec'}
              strokeWidth={score === 3 ? 1.5 : 1}
              strokeDasharray={score === 3 ? '4 3' : ''}
            />
            <text
              x={LEFT - 6}
              y={yOf(score) + 4}
              textAnchor="end"
              fontSize="11"
              fill="#888"
              fontFamily="system-ui, sans-serif"
            >
              {score}
            </text>
          </g>
        ))}

        {/* ── X-axis day labels ── */}
        {days.map(d => (
          <text
            key={d.i}
            x={d.x}
            y={VB_H - 8}
            textAnchor="middle"
            fontSize="12"
            fill={d.isToday ? '#c0392b' : '#888'}
            fontWeight={d.isToday ? '700' : '500'}
            fontFamily="system-ui, sans-serif"
          >
            {d.label}
          </text>
        ))}

        {/* ── Connecting lines between consecutive data points ── */}
        {days.map((d, i) => {
          if (i === days.length - 1 || d.y === null) return null
          const next = days[i + 1]
          if (next.y === null) return null
          return (
            <line
              key={`seg-${i}`}
              x1={d.x} y1={d.y}
              x2={next.x} y2={next.y}
              stroke="#c0392b"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.7"
            />
          )
        })}

        {/* ── Data point dots ── */}
        {days.filter(d => d.score !== null).map(d => {
          const color = avgToColor(d.score)
          return (
            <g key={`pt-${d.i}`}>
              {/* Glow ring */}
              <circle cx={d.x} cy={d.y} r={10} fill={color} opacity="0.15" />
              {/* Main dot */}
              <circle cx={d.x} cy={d.y} r={6} fill={color} />
              {/* White centre for larger dots (gives a "ring" feel when high contrast) */}
              <circle cx={d.x} cy={d.y} r={2.5} fill="white" />
            </g>
          )
        })}
      </svg>

      {!hasAnyData && (
        <p className="chart-no-data">Inga loggningar den här veckan ännu.</p>
      )}
    </div>
  )
}
