import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { insertTransfusion, fetchActiveFlags } from '../../lib/clinician'

export default function TransfusionButton({ patient, onFlagsResolved }) {
  const { profile }             = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [notes,     setNotes]     = useState('')
  const [saving,    setSaving]    = useState(false)

  // Close on Escape
  useEffect(() => {
    if (!modalOpen) return
    function onKey(e) { if (e.key === 'Escape' && !saving) closeModal() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [modalOpen, saving])

  function closeModal() {
    setModalOpen(false)
    setNotes('')
  }

  async function handleConfirm() {
    if (!profile?.id) return
    setSaving(true)
    const { error } = await insertTransfusion(patient.id, profile.id, notes)
    if (!error) {
      // DB trigger resolves all flags — refetch to reflect the resolved state
      const { data: updated } = await fetchActiveFlags(patient.id)
      onFlagsResolved(updated ?? [])
    }
    setSaving(false)
    closeModal()
  }

  return (
    <>
      <button
        className="cl-btn-primary"
        onClick={() => setModalOpen(true)}
        aria-label={`Markera ${patient.full_name} som transfunderad och granskad`}
      >
        <span className="material-icons" aria-hidden="true" style={{ fontSize: 18 }}>
          bloodtype
        </span>
        Transfunderad &amp; granskad
      </button>

      {modalOpen && (
        <div
          className="cl-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="transfusion-title"
          onClick={e => e.target === e.currentTarget && !saving && closeModal()}
        >
          <div className="cl-modal">
            <h3 className="cl-modal-title" id="transfusion-title">
              Bekräfta transfusion
            </h3>
            <p className="cl-modal-body">
              Är <strong>{patient.full_name}</strong> transfunderad och granskad?
              <br />
              <span style={{ color: 'var(--cl-text-muted)', fontSize: 13 }}>
                Detta resolverar alla aktiva flaggor automatiskt.
              </span>
            </p>

            <label className="cl-field-label" htmlFor="transfusion-notes">
              Anteckning (valfritt)
            </label>
            <textarea
              id="transfusion-notes"
              className="cl-modal-textarea"
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="T.ex. 2 enheter SAG-M givna"
              autoFocus
            />

            <div className="cl-modal-actions">
              <button
                className="cl-btn-primary"
                onClick={handleConfirm}
                disabled={saving}
              >
                {saving ? 'Sparar…' : 'Bekräfta'}
              </button>
              <button
                className="cl-btn-secondary"
                onClick={closeModal}
                disabled={saving}
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
