import { avgToColor, formatAvg } from '../../lib/stats'

export default function CategoryCard({ emoji, label, thisAvg, lastAvg }) {
  const color = avgToColor(thisAvg)
  const barWidth = thisAvg !== null ? `${(thisAvg / 5) * 100}%` : '0%'

  let directionIcon = null
  let directionColor = '#666'
  if (thisAvg !== null && lastAvg !== null) {
    const diff = thisAvg - lastAvg
    if (diff > 0.15) { directionIcon = 'arrow_upward'; directionColor = '#27ae60' }
    else if (diff < -0.15) { directionIcon = 'arrow_downward'; directionColor = '#c0392b' }
    else { directionIcon = 'remove'; directionColor = '#888' }
  }

  return (
    <div className="category-data-card">
      <div className="category-data-header">
        <span className="category-data-emoji" aria-hidden="true">{emoji}</span>
        <div className="category-data-info">
          <span className="category-data-name">{label}</span>
          {lastAvg !== null && (
            <span className="category-data-compare">
              Förra veckan: {formatAvg(lastAvg)}
              {directionIcon && (
                <span
                  className="material-icons category-direction-icon"
                  style={{ color: directionColor }}
                  aria-hidden="true"
                >
                  {directionIcon}
                </span>
              )}
            </span>
          )}
        </div>
        <span
          className="category-data-score"
          style={{ color: thisAvg !== null ? color : '#aaa' }}
        >
          {formatAvg(thisAvg)}
        </span>
      </div>

      <div className="category-data-bar-track">
        <div
          className="category-data-bar-fill"
          style={{ width: barWidth, background: color }}
          role="progressbar"
          aria-valuenow={thisAvg ?? 0}
          aria-valuemin={0}
          aria-valuemax={5}
        />
      </div>
    </div>
  )
}
