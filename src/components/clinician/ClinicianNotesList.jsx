import { useState } from 'react'
import { formatSwedishDateTime } from '../../lib/dates'

function NoteItem({ note, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const authorName = note.users?.full_name ?? 'Okänd'
  const wasEdited  = note.updated_at && note.updated_at !== note.created_at

  return (
    <div className="cl-note-item">
      <div className="cl-note-header">
        <span className="cl-note-author">{authorName}</span>
        <span className="cl-note-date">{formatSwedishDateTime(note.created_at)}</span>
        {wasEdited && <span className="cl-note-edited">(redigerad)</span>}
      </div>
      <p className="cl-note-content">{note.content}</p>
      <div className="cl-note-actions">
        {confirmDelete ? (
          <>
            <span className="cl-note-confirm-text">Är du säker?</span>
            <button className="cl-note-btn cl-note-btn--danger" onClick={() => onDelete(note.id)}>
              Ta bort
            </button>
            <button className="cl-note-btn" onClick={() => setConfirmDelete(false)}>
              Avbryt
            </button>
          </>
        ) : (
          <>
            <button className="cl-note-btn" onClick={() => onEdit(note)}>
              <span className="material-icons" aria-hidden="true">edit</span>
              Redigera
            </button>
            <button
              className="cl-note-btn cl-note-btn--danger"
              onClick={() => setConfirmDelete(true)}
            >
              <span className="material-icons" aria-hidden="true">delete</span>
              Ta bort
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function ClinicianNotesList({ notes, onEdit, onDelete }) {
  if (!notes.length) {
    return <p className="clinician-empty">Inga anteckningar ännu.</p>
  }
  return (
    <div className="cl-notes-list">
      {notes.map(n => (
        <NoteItem key={n.id} note={n} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
