import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { insertTransfusion, fetchActiveFlags } from '../../lib/clinician'

export default function ReviewedRow({ patient, flags, onFlagsResolved }) {
  const { profile }                   = useAuth()
  const [confirming, setConfirming]   = useState(false)
  const [note,       setNote]         = useState('')
  const [saving,     setSaving]       = useState(false)
  const isDone = flags.length === 0

  useEffect(() => {
    if (!confirming) return
    function onKey(e) { if (e.key === 'Escape' && !saving) closeModal() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [confirming, saving])

  function closeModal() { setConfirming(false); setNote('') }

  async function handleConfirm() {
    if (!profile?.id) return
    setSaving(true)
    const { error } = await insertTransfusion(patient.id, profile.id, note)
    if (!error) {
      const { data } = await fetchActiveFlags(patient.id)
      onFlagsResolved(data ?? [])
    }
    setSaving(false)
    closeModal()
  }

  return (
    <>
      <div className="cl-pv-row">
        <div className="cl-pv-row-header">
          <div>
            <div className="cl-pv-row-label">Granskad</div>
            <p className="cl-pv-row-sub" style={{ marginTop: 4 }}>
              {isDone
                ? 'Inga aktiva flaggor'
                : `${flags.length} aktiv${flags.length === 1 ? '' : 'a'} flagg${flags.length === 1 ? 'a' : 'or'}`
              }
            </p>
          </div>
          <button
            className={`cl-pv-circle-btn cl-pv-circle-btn--green${isDone ? ' done' : ''}`}
            onClick={() => !isDone && setConfirming(true)}
            aria-label={isDone ? 'Patienten är redan granskad' : 'Markera patient som granskad'}
            aria-pressed={isDone}
          >
            <span className="material-icons">
              {isDone ? 'check_box' : 'check_box_outline_blank'}
            </span>
          </button>
        </div>
      </div>

      {confirming && (
        <div
          className="cl-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reviewed-title"
          onClick={e => e.target === e.currentTarget && !saving && closeModal()}
        >
          <div className="cl-modal">
            <h3 className="cl-modal-title" id="reviewed-title">Bekräfta granskning</h3>
            <p className="cl-modal-body">
              Är <strong>{patient.full_name}</strong> transfunderad och granskad?
              <br />
              <span style={{ fontSize: 13, color: '#666' }}>
                Alla aktiva flaggor resolveras automatiskt.
              </span>
            </p>
            <label className="cl-field-label" htmlFor="gr-note">Anteckning (valfritt)</label>
            <textarea
              id="gr-note"
              className="cl-modal-textarea"
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="T.ex. 2 enheter SAG-M givna"
              autoFocus
            />
            <div className="cl-modal-actions">
              <button className="cl-btn-primary" onClick={handleConfirm} disabled={saving}>
                {saving ? 'Sparar…' : 'Bekräfta'}
              </button>
              <button className="cl-btn-secondary" onClick={closeModal} disabled={saving}>
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
