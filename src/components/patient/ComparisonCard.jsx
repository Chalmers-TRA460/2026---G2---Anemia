import { compareWeeks, formatAvg } from '../../lib/stats'

const TREND_CONFIG = {
  better: {
    icon: 'trending_up',
    label: 'Bättre',
    color: '#27ae60',
    text: 'Du har känt dig piggare än förra veckan.',
  },
  worse: {
    icon: 'trending_down',
    label: 'Sämre',
    color: '#c0392b',
    text: 'Du har mått sämre än förra veckan.',
  },
  neutral: {
    icon: 'trending_flat',
    label: 'Som förra veckan',
    color: '#666',
    text: 'Du har mått ungefär likadant som förra veckan.',
  },
}

export default function ComparisonCard({ thisAvg, lastAvg }) {
  const direction = compareWeeks(thisAvg, lastAvg)

  return (
    <div className="card comparison-card">
      <h2 className="card-title">Jämfört med förra veckan</h2>

      {direction === null ? (
        <p className="comparison-no-data">
          För få loggningar för att jämföra ännu.
        </p>
      ) : (
        <div className="comparison-content">
          <div className="comparison-trend" style={{ color: TREND_CONFIG[direction].color }}>
            <span className="material-icons comparison-arrow" aria-hidden="true">
              {TREND_CONFIG[direction].icon}
            </span>
            <span className="comparison-label">
              {TREND_CONFIG[direction].label}
            </span>
          </div>
          <p className="comparison-text">{TREND_CONFIG[direction].text}</p>
        </div>
      )}
    </div>
  )
}
