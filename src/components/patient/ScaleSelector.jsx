const SCALE_COLORS = ['#c0392b', '#e67e22', '#f39c12', '#8bc34a', '#27ae60']

export default function ScaleSelector({ value, onChange }) {
  return (
    <div className="scale-wrap">
      <div className="scale-row">
        <span
          className="material-icons-outlined scale-face-icon"
          style={{ color: '#c0392b' }}
          aria-hidden="true"
        >
          sentiment_dissatisfied
        </span>

        <div className="scale-buttons">
          {[1, 2, 3, 4, 5].map(n => {
            const isSelected = value === n
            const color = SCALE_COLORS[n - 1]
            return (
              <button
                key={n}
                type="button"
                className={`scale-btn${isSelected ? ' scale-btn--selected' : ''}`}
                style={isSelected ? { background: color, borderColor: color } : {}}
                onClick={() => onChange(n)}
                aria-pressed={isSelected}
                aria-label={`${n} av 5`}
              >
                {n}
              </button>
            )
          })}
        </div>

        <span
          className="material-icons-outlined scale-face-icon"
          style={{ color: '#27ae60' }}
          aria-hidden="true"
        >
          sentiment_satisfied
        </span>
      </div>

      <div className="scale-labels">
        <span>1 = mår dåligt</span>
        <span>5 = mår bra</span>
      </div>
    </div>
  )
}
