import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { insertClinicianNote } from '../../lib/clinician'

// Right panel — full-height new-note form
export default function NewNotePanel({ patientId, onNoteAdded }) {
  const { profile }             = useAuth()
  const [content, setContent]   = useState('')
  const [saving,  setSaving]    = useState(false)

  async function handleSubmit() {
    if (!content.trim() || !profile?.id) return
    setSaving(true)
    const { data } = await insertClinicianNote(patientId, profile.id, content)
    if (data) {
      onNoteAdded({ ...data, author: { full_name: profile.full_name } })
      setContent('')
    }
    setSaving(false)
  }

  return (
    <div className="cl-pv-new-note">
      <div className="cl-card-title" style={{ marginBottom: 12 }}>Ny anteckning</div>
      <textarea
        className="cl-pv-note-textarea"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Skriv en anteckning om patienten…"
        aria-label="Ny klinikeranteckning"
      />
      <button
        className="cl-btn-primary"
        onClick={handleSubmit}
        disabled={saving || !content.trim()}
        style={{ marginTop: 12, alignSelf: 'flex-start' }}
      >
        {saving ? 'Sparar…' : 'Spara anteckning'}
      </button>
    </div>
  )
}
