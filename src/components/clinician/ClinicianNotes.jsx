import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { fetchClinicianNotes, insertClinicianNote, updateClinicianNote } from '../../lib/clinician'

const TZ = 'Europe/Stockholm'

function formatDate(iso) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: TZ, day: 'numeric', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

function NoteItem({ note, currentClinicianId, onEdit }) {
  const isOwn     = note.clinician_id === currentClinicianId
  const author    = note.author?.full_name ?? 'Okänd'
  const wasEdited = note.updated_at && note.updated_at !== note.created_at

  return (
    <div className="cl-note-item">
      <div className="cl-note-meta">
        <span className="cl-note-author">{author}</span>
        <span className="cl-note-time">{formatDate(note.created_at)}</span>
        {wasEdited && <span className="cl-note-edited">(redigerad)</span>}
        {isOwn && (
          <button
            className="cl-note-edit-btn"
            onClick={() => onEdit(note)}
            aria-label="Redigera anteckning"
          >
            <span className="material-icons" aria-hidden="true">edit</span>
            Redigera
          </button>
        )}
      </div>
      <p className="cl-note-content">{note.content}</p>
    </div>
  )
}

export default function ClinicianNotes({ patientId }) {
  const { profile }                   = useAuth()
  const [notes,    setNotes]          = useState([])
  const [loading,  setLoading]        = useState(true)
  const [content,  setContent]        = useState('')
  const [saving,   setSaving]         = useState(false)
  const [editNote, setEditNote]       = useState(null)  // null = new, object = editing

  useEffect(() => {
    fetchClinicianNotes(patientId).then(({ data }) => {
      setNotes(data)
      setLoading(false)
    })
  }, [patientId])

  function startEdit(note) {
    setEditNote(note)
    setContent(note.content)
  }

  function cancelEdit() {
    setEditNote(null)
    setContent('')
  }

  async function handleSubmit() {
    if (!content.trim() || !profile?.id) return
    setSaving(true)
    if (editNote) {
      const { data } = await updateClinicianNote(editNote.id, content)
      if (data) setNotes(prev => prev.map(n => n.id === editNote.id ? { ...n, ...data } : n))
      setEditNote(null)
    } else {
      const { data } = await insertClinicianNote(patientId, profile.id, content)
      if (data) {
        setNotes(prev => [
          { ...data, author: { full_name: profile.full_name } },
          ...prev,
        ])
      }
    }
    setContent('')
    setSaving(false)
  }

  return (
    <div className="cl-card">
      <div className="cl-section-header">
        <span className="cl-card-title" style={{ margin: 0 }}>Klinikeranteckningar</span>
        {notes.length > 0 && <span className="cl-count-badge">{notes.length}</span>}
      </div>

      {/* Add / edit form */}
      <div className="cl-note-form">
        <textarea
          className="cl-modal-textarea"
          style={{ width: '100%' }}
          rows={3}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={editNote ? 'Redigera anteckning…' : 'Ny anteckning…'}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            className="cl-btn-primary"
            onClick={handleSubmit}
            disabled={saving || !content.trim()}
          >
            {saving ? 'Sparar…' : editNote ? 'Spara ändringar' : 'Lägg till'}
          </button>
          {editNote && (
            <button className="cl-btn-secondary" onClick={cancelEdit} disabled={saving}>
              Avbryt
            </button>
          )}
        </div>
      </div>

      {/* Notes list */}
      {loading ? (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2].map(i => (
            <div key={i} className="cl-note-item">
              <span className="cl-skeleton" style={{ display: 'block', width: '45%', height: 12, marginBottom: 8 }} />
              <span className="cl-skeleton" style={{ display: 'block', height: 44 }} />
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <p className="cl-empty" style={{ margin: '12px 0 0' }}>Inga anteckningar ännu.</p>
      ) : (
        <div className="cl-notes-list">
          {notes.map(note => (
            <NoteItem
              key={note.id}
              note={note}
              currentClinicianId={profile?.id}
              onEdit={startEdit}
            />
          ))}
        </div>
      )}
    </div>
  )
}
