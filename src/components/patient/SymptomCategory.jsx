import ScaleSelector from './ScaleSelector'

const SCALE_COLORS = ['#c0392b', '#e67e22', '#f39c12', '#8bc34a', '#27ae60']

export default function SymptomCategory({
  emoji,
  label,
  color,
  question,
  symptoms,
  rating,
  selectedSymptoms,
  onRatingChange,
  onSymptomToggle,
  isExpanded,
  onToggle,
}) {
  const ratingColor = rating ? SCALE_COLORS[rating - 1] : null

  function handleChipClick(symptom) {
    if (selectedSymptoms.includes(symptom)) {
      onSymptomToggle(selectedSymptoms.filter(s => s !== symptom))
    } else {
      onSymptomToggle([...selectedSymptoms, symptom])
    }
  }

  return (
    <div className={`symptom-category${isExpanded ? ' symptom-category--open' : ''}`}>
      <button
        type="button"
        className="category-header"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <div className="category-header-left">
          <span className="category-emoji" aria-hidden="true">
            {emoji}
          </span>
          <span className="category-label">{label}</span>
        </div>
        <div className="category-header-right">
          {rating && (
            <span
              className="category-rating-badge"
              style={{ background: ratingColor }}
              aria-label={`Betyg: ${rating}`}
            >
              {rating}
            </span>
          )}
          <span className="material-icons-outlined category-chevron" aria-hidden="true">
            {isExpanded ? 'expand_less' : 'expand_more'}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="category-body">
          <p className="category-question">{question}</p>

          <ScaleSelector value={rating} onChange={onRatingChange} />

          {symptoms.length > 0 && (
            <div className="symptom-chips-wrap">
              <p className="symptom-chips-label">
                Har du upplevt något av följande?
              </p>
              <div className="symptom-chips">
                {symptoms.map(symptom => {
                  const isSelected = selectedSymptoms.includes(symptom)
                  return (
                    <button
                      key={symptom}
                      type="button"
                      className={`symptom-chip${isSelected ? ' symptom-chip--selected' : ''}`}
                      style={
                        isSelected
                          ? {
                              borderColor: color,
                              background: `${color}1a`,
                              color,
                            }
                          : {}
                      }
                      onClick={() => handleChipClick(symptom)}
                      aria-pressed={isSelected}
                    >
                      {symptom}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
