import { scoreColor } from '../../lib/flags'

const W = 280
const H = 72
const PAD = { t: 6, b: 6, l: 4, r: 4 }
const PLOT_W = W - PAD.l - PAD.r
const PLOT_H = H - PAD.t - PAD.b
const WINDOW_MS = 28 * 24 * 60 * 60 * 1000

function toX(isoDate) {
  const now   = Date.now()
  const start = now - WINDOW_MS
  const ratio = Math.max(0, Math.min(1, (new Date(isoDate).getTime() - start) / WINDOW_MS))
  return PAD.l + ratio * PLOT_W
}

function toY(score) {
  return PAD.t + PLOT_H * (1 - (score - 1) / 4)
}

const COLORS = {
  energy:            '#e67e22',
  breathing:         '#2980b9',
  head_balance:      '#8e44ad',
  general_wellbeing: '#27ae60',
  mental_wellbeing:  '#34495e',
}

export default function TrendChart({ logs, categoryKey }) {
  const color = COLORS[categoryKey] ?? '#888'

  const points = [...logs]
    .filter(l => typeof l[categoryKey] === 'number')
    .sort((a, b) => new Date(a.logged_at) - new Date(b.logged_at))
    .map(l => ({ x: toX(l.logged_at), y: toY(l[categoryKey]), score: l[categoryKey] }))

  if (points.length === 0) {
    return <p className="trend-no-data">Ingen data ännu</p>
  }

  const polyStr = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="trend-chart-svg"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      {/* Grid lines at 1, 3, 5 */}
      {[1, 3, 5].map(v => (
        <line key={v}
          x1={PAD.l} x2={W - PAD.r}
          y1={toY(v)} y2={toY(v)}
          stroke="#f0f0f0" strokeWidth="1"
        />
      ))}
      {/* Danger threshold at 2 */}
      <line
        x1={PAD.l} x2={W - PAD.r}
        y1={toY(2)} y2={toY(2)}
        stroke="#fad7d4" strokeWidth="1" strokeDasharray="4,3"
      />
      {/* Connecting line */}
      {points.length > 1 && (
        <polyline
          points={polyStr}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.85"
        />
      )}
      {/* Data points — colored by score */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x} cy={p.y} r={3.5}
          fill={`var(--score-${scoreColor(p.score)})`}
          stroke="#fff" strokeWidth="1"
        />
      ))}
    </svg>
  )
}
