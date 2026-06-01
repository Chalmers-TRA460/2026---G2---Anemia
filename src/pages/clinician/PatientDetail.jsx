import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  getPatient, getPatientLogs,
  getClinicianNotes, insertClinicianNote, updateClinicianNote, deleteClinicianNote,
  insertClinicalAction, sendMessage,
  insertAppointment, updatePatientAppointment,
} from '../../lib/clinicianQueries'
import { avgScore, fmtScore, scoreColor } from '../../lib/flags'
import { formatSwedishDateTime } from '../../lib/dates'
import TrendChart from '../../components/clinician/TrendChart'
import LogHistoryList from '../../components/clinician/LogHistoryList'
import ClinicianNotesList from '../../components/clinician/ClinicianNotesList'
import MarkReviewedModal from '../../components/clinician/modals/MarkReviewedModal'
import SendMessageModal from '../../components/clinician/modals/SendMessageModal'
import AddNoteModal from '../../components/clinician/modals/AddNoteModal'
import AppointmentModal from '../../components/clinician/modals/AppointmentModal'
import AppointmentHistoryModal from '../../components/clinician/modals/AppointmentHistoryModal'
import Toast from '../../components/clinician/Toast'

const TREND_CATEGORIES = [
  { key: 'energy',            label: 'Energi'         },
  { key: 'breathing',         label: 'Andning'        },
  { key: 'head_balance',      label: 'Huvud & balans'  },
  { key: 'general_wellbeing', label: 'Allmänt mående'  },
  { key: 'mental_wellbeing',  label: 'Mentalt mående'  },
]

function SkeletonBlock({ w = '100%', h = 18 }) {
  return <span className="skeleton" style={{ display: 'block', width: w, height: h, borderRadius: 6 }} />
}

export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [patient, setPatient] = useState(null)
  const [logs,    setLogs]    = useState([])
  const [notes,   setNotes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [saving,  setSaving]  = useState(false)
  const [toast,   setToast]   = useState(null)

  // modal open/close state
  const [reviewOpen, setReviewOpen] = useState(false)
  const [msgOpen,    setMsgOpen]    = useState(false)
  const [apptOpen,   setApptOpen]   = useState(false)
  const [noteOpen,       setNoteOpen]       = useState(false)
  const [noteToEdit,     setNoteToEdit]     = useState(null)  // null = new note
  const [apptHistOpen,   setApptHistOpen]   = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [
        { data: p, error: pErr },
        { data: l, error: lErr },
        { data: n, error: nErr },
      ] = await Promise.all([
        getPatient(id),
        getPatientLogs(id, 28),
        getClinicianNotes(id),
      ])
      if (cancelled) return
      if (pErr || !p) { setError('Patient hittades inte.'); setLoading(false); return }
      if (lErr) console.error('Logs error:', lErr)
      if (nErr) console.error('Notes error:', nErr)
      setPatient(p)
      setLogs(l ?? [])
      setNotes(n ?? [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [id])

  // ── Action handlers ───────────────────────────────

  async function handleReview(note) {
    setSaving(true)
    await insertClinicalAction(id, profile.id, note)
    setSaving(false)
    setReviewOpen(false)
    setToast({ message: 'Patient markerad som granskad' })
  }

  async function handleSendMessage(content) {
    setSaving(true)
    await sendMessage(id, profile.id, content)
    setSaving(false)
    setMsgOpen(false)
    setToast({ message: 'Meddelande skickat' })
  }

  function openNewNote() {
    setNoteToEdit(null)
    setNoteOpen(true)
  }

  function openEditNote(n) {
    setNoteToEdit(n)
    setNoteOpen(true)
  }

  function closeNoteModal() {
    setNoteOpen(false)
    setNoteToEdit(null)
  }

  async function handleSaveNote(content) {
    setSaving(true)
    if (noteToEdit) {
      const { data } = await updateClinicianNote(noteToEdit.id, content)
      if (data) setNotes(prev => prev.map(n => n.id === noteToEdit.id ? { ...n, ...data } : n))
    } else {
      const { data } = await insertClinicianNote(id, profile.id, content)
      if (data) setNotes(prev => [{ ...data, users: { full_name: profile.full_name } }, ...prev])
    }
    setSaving(false)
    closeNoteModal()
    setToast({ message: noteToEdit ? 'Anteckning uppdaterad' : 'Anteckning sparad' })
  }

  async function handleDeleteNote(noteId) {
    await deleteClinicianNote(noteId)
    setNotes(prev => prev.filter(n => n.id !== noteId))
  }

  async function handleSaveAppointment(scheduledFor, apptNote) {
    setSaving(true)
    await Promise.all([
      insertAppointment(id, profile.id, scheduledFor, apptNote),
      updatePatientAppointment(id, scheduledFor),
    ])
    setPatient(prev => ({ ...prev, next_appointment: scheduledFor }))
    setSaving(false)
    setApptOpen(false)
    setToast({ message: 'Besök sparat' })
  }

  // ─────────────────────────────────────────────────

  const latestLog = logs[0] ?? null
  const avg       = latestLog ? avgScore(latestLog) : null

  if (error) {
    return (
      <>
        <button className="cl-back-btn" onClick={() => navigate('/kliniker')}>
          <span className="material-icons">arrow_back</span> Tillbaka
        </button>
        <div className="clinician-card"><p style={{ color: '#c0392b' }}>{error}</p></div>
      </>
    )
  }

  return (
    <>
      {/* ── Back + header ── */}
      <button className="cl-back-btn" onClick={() => navigate('/kliniker')}>
        <span className="material-icons" aria-hidden="true">arrow_back</span>
        Tillbaka till översikt
      </button>

      <div className="cl-patient-header">
        <div>
          {loading ? (
            <>
              <SkeletonBlock w={200} h={28} />
              <SkeletonBlock w={160} h={16} />
            </>
          ) : (
            <>
              <h1 className="cl-patient-name">{patient.full_name}</h1>
              <p className="cl-patient-email">{patient.email}</p>
            </>
          )}
        </div>
        {!loading && avg !== null && (
          <div className="cl-patient-score">
            <span className="cl-patient-score-label">Senaste snitt</span>
            <span className={`score-pill score-pill--${scoreColor(avg)} score-pill--lg`}>
              {fmtScore(avg)}
            </span>
          </div>
        )}
      </div>

      {/* ── Info row: appointment + quick actions ── */}
      <div className="cl-info-row">
        <div className="clinician-card cl-appt-card">
          <h2 className="clinician-section-title">Nästa besök</h2>
          {loading ? (
            <SkeletonBlock w="60%" />
          ) : patient.next_appointment ? (
            <p className="cl-appt-date">{formatSwedishDateTime(patient.next_appointment)}</p>
          ) : (
            <p className="cl-appt-none">⚠ Inget besök inplanerat</p>
          )}
          <div className="cl-appt-btns">
            <button
              className="cl-btn-outline"
              onClick={() => setApptOpen(true)}
              disabled={loading}
            >
              <span className="material-icons" aria-hidden="true">edit_calendar</span>
              {patient?.next_appointment ? 'Ändra besök' : 'Lägg till besök'}
            </button>
            <button
              className="cl-btn-outline"
              onClick={() => setApptHistOpen(true)}
              disabled={loading}
            >
              <span className="material-icons" aria-hidden="true">history</span>
              Se alla besök
            </button>
          </div>
        </div>

        <div className="clinician-card cl-actions-card">
          <h2 className="clinician-section-title">Snabbåtgärder</h2>
          <div className="cl-quick-actions">
            <button
              className="cl-btn-outline"
              onClick={() => setReviewOpen(true)}
              disabled={loading}
            >
              <span className="material-icons" aria-hidden="true">check_circle</span>
              Markera som granskad
            </button>
            <button
              className="cl-btn-outline"
              onClick={() => setMsgOpen(true)}
              disabled={loading}
            >
              <span className="material-icons" aria-hidden="true">mail</span>
              Skicka meddelande
            </button>
            <button
              className="cl-btn-outline"
              onClick={openNewNote}
              disabled={loading}
            >
              <span className="material-icons" aria-hidden="true">note_add</span>
              Lägg till anteckning
            </button>
          </div>
        </div>
      </div>

      {/* ── Trendgrafer ── */}
      <div className="clinician-card">
        <h2 className="clinician-section-title">Trender — senaste 28 dagarna</h2>
        {loading ? (
          <div className="trend-grid">
            {TREND_CATEGORIES.map(({ key }) => (
              <div key={key} className="trend-cell">
                <SkeletonBlock w="50%" h={13} />
                <SkeletonBlock w="100%" h={72} />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <p className="clinician-empty">Inga loggar de senaste 28 dagarna.</p>
        ) : (
          <div className="trend-grid">
            {TREND_CATEGORIES.map(({ key, label }) => (
              <div key={key} className="trend-cell">
                <span className="trend-cell-label">{label}</span>
                <TrendChart logs={logs} categoryKey={key} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Klinikeranteckningar ── */}
      <div className="clinician-card">
        <h2 className="clinician-section-title">
          Klinikeranteckningar
          {notes.length > 0 && (
            <span className="patient-list-count">{notes.length}</span>
          )}
          <button
            className="cl-note-add-btn"
            onClick={openNewNote}
            disabled={loading}
            aria-label="Lägg till anteckning"
          >
            <span className="material-icons" aria-hidden="true">add</span>
          </button>
        </h2>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2].map(i => <SkeletonBlock key={i} h={60} />)}
          </div>
        ) : (
          <ClinicianNotesList
            notes={notes}
            onEdit={openEditNote}
            onDelete={handleDeleteNote}
          />
        )}
      </div>

      {/* ── Loggningshistorik ── */}
      <div className="clinician-card">
        <h2 className="clinician-section-title">
          Loggningshistorik
          {logs.length > 0 && (
            <span className="patient-list-count">{logs.length}</span>
          )}
        </h2>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => <SkeletonBlock key={i} h={80} />)}
          </div>
        ) : (
          <LogHistoryList logs={logs} />
        )}
      </div>

      {/* ── Modals ── */}
      {reviewOpen && patient && (
        <MarkReviewedModal
          patient={patient}
          saving={saving}
          onConfirm={handleReview}
          onClose={() => setReviewOpen(false)}
        />
      )}
      {msgOpen && patient && (
        <SendMessageModal
          patient={patient}
          saving={saving}
          onSend={handleSendMessage}
          onClose={() => setMsgOpen(false)}
        />
      )}
      {noteOpen && (
        <AddNoteModal
          note={noteToEdit}
          saving={saving}
          onSave={handleSaveNote}
          onClose={closeNoteModal}
        />
      )}
      {apptOpen && patient && (
        <AppointmentModal
          patient={patient}
          saving={saving}
          onConfirm={handleSaveAppointment}
          onClose={() => setApptOpen(false)}
        />
      )}
      {apptHistOpen && patient && (
        <AppointmentHistoryModal
          patient={patient}
          onAppointmentChanged={scheduledFor =>
            setPatient(prev => ({ ...prev, next_appointment: scheduledFor }))
          }
          onClose={() => setApptHistOpen(false)}
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type ?? 'success'}
          onDone={() => setToast(null)}
        />
      )}
    </>
  )
}
