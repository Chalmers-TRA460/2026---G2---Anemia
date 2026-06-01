import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigationGuard } from '../../contexts/NavigationGuardContext'
import { upsertLog } from '../../lib/logs'
import SymptomLogForm, { SYMPTOM_CATEGORIES } from '../../components/shared/SymptomLogForm'

export default function LogSymptoms() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { registerGuard, clearGuard } = useNavigationGuard()

  const existingLog = location.state?.log ?? null
  const isEditing = !!existingLog

  const [submitting, setSubmitting] = useState(false)
  const [savingBeforeLeave, setSavingBeforeLeave] = useState(false)
  const [error, setError] = useState(null)
  const [showBlockedDialog, setShowBlockedDialog] = useState(false)

  // Tracks the latest form values so the guard and save-and-leave can read them
  const latestValuesRef = useRef(null)
  const hasChangesRef = useRef(false)

  function handleValuesChange({ scores, selectedSymptoms, notes }) {
    latestValuesRef.current = { scores, selectedSymptoms, notes }

    if (!isEditing || !existingLog) return
    const ratingsChanged = SYMPTOM_CATEGORIES.some(
      c => scores[c.key] !== (existingLog[c.key] ?? null)
    )
    const origSymptoms = [...(existingLog.selected_symptoms ?? [])].sort().join(',')
    const currSymptoms = [...selectedSymptoms].sort().join(',')
    const notesChanged = (notes.trim() || null) !== ((existingLog.notes ?? '').trim() || null)
    hasChangesRef.current = ratingsChanged || currSymptoms !== origSymptoms || notesChanged
  }

  useEffect(() => {
    if (!isEditing) return

    registerGuard(() => {
      if (hasChangesRef.current) {
        setShowBlockedDialog(true)
        return true
      }
      return false
    })

    return () => clearGuard()
  }, [isEditing, registerGuard, clearGuard])

  function buildLogData(values) {
    const { scores, selectedSymptoms, notes } = values
    return {
      ...scores,
      selected_symptoms: selectedSymptoms,
      notes: notes.trim() || null,
    }
  }

  async function handleSubmit(values) {
    setSubmitting(true)
    setError(null)

    const { error: err } = await upsertLog(
      profile.id,
      buildLogData(values),
      existingLog?.id ?? null
    )

    if (err) {
      console.error('[LogSymptoms] upsertLog fel:', err)
      setError('Något gick fel. Försök igen.')
      setSubmitting(false)
      return
    }

    navigate('/patient/logga/klar', { replace: true })
  }

  async function handleSaveAndLeave() {
    setSavingBeforeLeave(true)

    const values = latestValuesRef.current
    const { error: err } = await upsertLog(
      profile.id,
      buildLogData(values),
      existingLog?.id ?? null
    )
    setSavingBeforeLeave(false)

    if (err) {
      console.error('[LogSymptoms] handleSaveAndLeave fel:', err)
      setError('Kunde inte spara. Försök igen.')
      setShowBlockedDialog(false)
      return
    }

    clearGuard()
    navigate('/patient', { replace: true })
  }

  function handleLeaveWithoutSaving() {
    clearGuard()
    navigate('/patient', { replace: true })
  }

  const initialValues = existingLog
    ? {
        scores: {
          energy: existingLog.energy ?? null,
          breathing: existingLog.breathing ?? null,
          head_balance: existingLog.head_balance ?? null,
          general_wellbeing: existingLog.general_wellbeing ?? null,
          mental_wellbeing: existingLog.mental_wellbeing ?? null,
        },
        selectedSymptoms: existingLog.selected_symptoms ?? [],
        notes: existingLog.notes ?? '',
      }
    : undefined

  return (
    <div className="page-content">
      <span className="page-tag">{isEditing ? 'Redigera loggning' : 'Loggning'}</span>
      <h1 className="page-title">Hur mår du idag?</h1>
      <p className="page-subtitle">
        Tryck på en kategori, bedöm hur du mår och välj symtom om du upplevt några.
      </p>

      <SymptomLogForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel={isEditing ? 'Spara ändringar →' : 'Skicka loggning →'}
        isSubmitting={submitting}
        errorMessage={error}
        onValuesChange={handleValuesChange}
      />

      {/* ── Unsaved changes dialog ── */}
      {showBlockedDialog && (
        <div className="blocker-overlay" role="dialog" aria-modal="true">
          <div className="blocker-sheet">
            <h3 className="blocker-title">Osparade ändringar</h3>
            <p className="blocker-body">
              Du har gjort ändringar som inte har sparats. Vill du spara dem innan du lämnar?
            </p>
            <div className="blocker-btn-group">
              <button
                className="btn-patient-primary"
                onClick={handleSaveAndLeave}
                disabled={savingBeforeLeave}
              >
                {savingBeforeLeave ? 'Sparar…' : 'Spara och lämna'}
              </button>
              <button
                className="btn-patient-secondary"
                onClick={handleLeaveWithoutSaving}
                disabled={savingBeforeLeave}
              >
                Lämna utan att spara
              </button>
              <button
                className="blocker-stay-btn"
                onClick={() => setShowBlockedDialog(false)}
                disabled={savingBeforeLeave}
              >
                Stanna kvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
