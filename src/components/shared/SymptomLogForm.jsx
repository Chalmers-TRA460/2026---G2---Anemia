import { useState, useEffect, useRef } from 'react'
import SymptomCategory from '../patient/SymptomCategory'

export const SYMPTOM_CATEGORIES = [
  {
    key: 'energy',
    emoji: '⚡',
    label: 'Energi',
    color: '#e67e22',
    question: 'Hur energisk har du känt dig idag?',
    symptoms: ['Trötthet', 'Orkeslöshet', 'Svaghet'],
  },
  {
    key: 'breathing',
    emoji: '🫁',
    label: 'Andning',
    color: '#2980b9',
    question: 'Hur lätt har du andats idag?',
    symptoms: ['Andfåddhet', 'Tryck i bröstet', 'Hjärtklappning', 'Hög puls'],
  },
  {
    key: 'head_balance',
    emoji: '🧠',
    label: 'Huvud & balans',
    color: '#8e44ad',
    question: 'Hur klart i huvudet och stadigt på benen har du känt dig?',
    symptoms: ['Yrsel', 'Huvudvärk', 'Svimningskänsla', 'Dålig balans'],
  },
  {
    key: 'general_wellbeing',
    emoji: '🌡️',
    label: 'Allmänt mående',
    color: '#27ae60',
    question: 'Hur mår du överlag idag?',
    symptoms: ['Aptit', 'Sömnsvårighet', 'Blek hud', 'Frysningar'],
  },
  {
    key: 'mental_wellbeing',
    emoji: '💭',
    label: 'Mentalt mående',
    color: '#34495e',
    question: 'Hur mår du mentalt idag?',
    symptoms: ['Nedstämdhet', 'Ångest', 'Motivationsbrist', 'Koncentrationssvårighet'],
  },
]

function buildInitialRatings(scores) {
  const base = {
    energy: null,
    breathing: null,
    head_balance: null,
    general_wellbeing: null,
    mental_wellbeing: null,
  }
  return scores ? { ...base, ...scores } : base
}

export default function SymptomLogForm({
  initialValues,
  onSubmit,
  submitLabel = 'Skicka loggning →',
  extraTopFields,
  isSubmitting = false,
  errorMessage,
  onValuesChange,
  extraDisabled = false,
}) {
  const [ratings, setRatings] = useState(() =>
    buildInitialRatings(initialValues?.scores)
  )
  const [selectedSymptoms, setSelectedSymptoms] = useState(
    initialValues?.selectedSymptoms ?? []
  )
  const [notes, setNotes] = useState(initialValues?.notes ?? '')
  const [expanded, setExpanded] = useState(SYMPTOM_CATEGORIES[0].key)

  const allRated = SYMPTOM_CATEGORIES.every(c => ratings[c.key] !== null)

  // Keep latest onValuesChange in a ref to avoid stale deps
  const onValuesChangeRef = useRef(onValuesChange)
  onValuesChangeRef.current = onValuesChange

  useEffect(() => {
    onValuesChangeRef.current?.({ scores: ratings, selectedSymptoms, notes })
  }, [ratings, selectedSymptoms, notes])

  function handleRatingChange(key, value) {
    setRatings(prev => ({ ...prev, [key]: value }))
  }

  function handleToggle(key) {
    setExpanded(prev => (prev === key ? null : key))
  }

  function handleSymptomToggle(categorySymptoms, newSelected) {
    setSelectedSymptoms(prev => {
      const others = prev.filter(s => !categorySymptoms.includes(s))
      return [...others, ...newSelected]
    })
  }

  function handleSubmitClick() {
    if (!allRated || isSubmitting || extraDisabled) return
    onSubmit({ scores: ratings, selectedSymptoms, notes })
  }

  return (
    <>
      {extraTopFields}

      <div className="log-categories">
        {SYMPTOM_CATEGORIES.map(cat => (
          <SymptomCategory
            key={cat.key}
            emoji={cat.emoji}
            label={cat.label}
            color={cat.color}
            question={cat.question}
            symptoms={cat.symptoms}
            rating={ratings[cat.key]}
            selectedSymptoms={selectedSymptoms.filter(s =>
              cat.symptoms.includes(s)
            )}
            onRatingChange={v => handleRatingChange(cat.key, v)}
            onSymptomToggle={newSel =>
              handleSymptomToggle(cat.symptoms, newSel)
            }
            isExpanded={expanded === cat.key}
            onToggle={() => handleToggle(cat.key)}
          />
        ))}
      </div>

      <div className="notes-section">
        <h2 className="notes-title">Något på hjärtat?</h2>
        <p className="notes-subtitle">Ditt vårdteam läser allt du skriver</p>
        <textarea
          className="notes-textarea"
          placeholder="Skriv gärna om du upplever något utöver symtomen ovan…"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={4}
        />
      </div>

      {errorMessage && <p className="log-error">{errorMessage}</p>}

      <button
        className="btn-patient-primary"
        disabled={!allRated || isSubmitting || extraDisabled}
        onClick={handleSubmitClick}
      >
        {isSubmitting ? 'Sparar…' : submitLabel}
      </button>

      {(!allRated || extraDisabled) && !isSubmitting && (
        <p className="log-hint">
          {!allRated
            ? `Fyll i alla ${SYMPTOM_CATEGORIES.length} kategorier för att kunna skicka.`
            : 'Fyll i ditt namn ovan för att kunna skicka.'}
        </p>
      )}
    </>
  )
}
