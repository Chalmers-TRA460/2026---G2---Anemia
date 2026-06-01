import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  getPatients, getLogsForPatients, getUpcomingAppointments,
  getRecentClinicalActions, insertClinicalAction, sendMessage,
} from '../../lib/clinicianQueries'
import { groupLogsByPatient, getActiveFlags } from '../../lib/flags'
import TodayWidget            from '../../components/clinician/TodayWidget'
import AlertList              from '../../components/clinician/AlertList'
import PatientList            from '../../components/clinician/PatientList'
import RecentlyTransfusedList from '../../components/clinician/RecentlyTransfusedList'
import MarkReviewedModal      from '../../components/clinician/modals/MarkReviewedModal'
import SendMessageModal       from '../../components/clinician/modals/SendMessageModal'
import Toast                  from '../../components/clinician/Toast'

function buildDefaultMessage(patient, flags, clinicianName) {
  const firstName = patient.full_name.trim().split(/\s+/)[0]
  if (flags.includes('not_logged_3_days')) {
    return (
      `Hej ${firstName}, vi har märkt att du inte loggat dina symtom de senaste dagarna. ` +
      `Det är viktigt för studien att du försöker logga varje dag. ` +
      `Hör av dig om du behöver hjälp!\n\nVänliga hälsningar,\n${clinicianName}`
    )
  }
  return `Hej ${firstName},\n\nVänliga hälsningar,\n${clinicianName}`
}

export default function Overview() {
  const { profile } = useAuth()

  const [patients,   setPatients]   = useState(null)
  const [logMap,     setLogMap]     = useState(new Map())
  const [upcoming,   setUpcoming]   = useState([])
  const [actions,    setActions]    = useState([])
  const [error,      setError]      = useState(null)

  const [reviewModal,  setReviewModal]  = useState(null)  // { patient } | null
  const [msgModal,     setMsgModal]     = useState(null)  // { patient, defaultText } | null
  const [saving,       setSaving]       = useState(false)
  const [toast,        setToast]        = useState(null)

  const load = useCallback(async () => {
    const { data: pts, error: pErr } = await getPatients()
    if (pErr) { setError('Kunde inte hämta patienter.'); return }

    const ids = pts.map(p => p.id)
    const [
      { data: logs  },
      { data: appts },
      { data: acts  },
    ] = await Promise.all([
      getLogsForPatients(ids, 10),
      getUpcomingAppointments(48),
      getRecentClinicalActions(48),
    ])

    setPatients(pts)
    setLogMap(groupLogsByPatient(logs ?? []))
    setUpcoming(appts ?? [])
    setActions(acts  ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  // IDs excluded from AlertList + PatientList
  const upcomingIds = new Set((upcoming ?? []).map(a => a.patient_id))
  const reviewedIds = new Set((actions  ?? []).map(a => a.patient_id))
  const excludeIds  = new Set([...upcomingIds, ...reviewedIds])

  async function handleConfirmReview(note) {
    if (!reviewModal || !profile?.id) return
    setSaving(true)
    await insertClinicalAction(reviewModal.patient.id, profile.id, note)
    setSaving(false)
    setReviewModal(null)
    setToast({ message: `${reviewModal.patient.full_name.split(' ')[0]} markerad som granskad` })
    await load()
  }

  async function handleSendMessage(content) {
    if (!msgModal || !profile?.id) return
    setSaving(true)
    await sendMessage(msgModal.patient.id, profile.id, content)
    setSaving(false)
    setMsgModal(null)
    setToast({ message: 'Meddelande skickat' })
  }

  function handleRequestReview(patient) {
    setReviewModal({ patient })
  }

  function handleRequestMessage(patient, flags) {
    setMsgModal({
      patient,
      defaultText: buildDefaultMessage(patient, flags, profile?.full_name ?? 'Läkaren'),
    })
  }

  const loading = patients === null

  if (error) {
    return (
      <>
        <h1 className="clinician-page-title">Översikt</h1>
        <div className="clinician-card">
          <p style={{ color: '#c0392b' }}>{error}</p>
        </div>
      </>
    )
  }

  return (
    <>
      <h1 className="clinician-page-title">Översikt</h1>

      {loading ? (
        <>
          <div className="clinician-card">
            <span className="skeleton" style={{ display: 'block', width: 200, height: 14, marginBottom: 16 }} />
            {[1, 2].map(i => (
              <div key={i} className="today-row" style={{ pointerEvents: 'none', marginBottom: 2 }}>
                <span className="skeleton" style={{ height: 16 }} />
                <span className="skeleton" style={{ height: 16, width: 120 }} />
                <span className="skeleton" style={{ height: 24, width: 48 }} />
                <span className="skeleton" style={{ height: 16, width: 140 }} />
                <span className="skeleton" style={{ height: 16, width: 20 }} />
              </div>
            ))}
          </div>
          <div className="clinician-card">
            <span className="skeleton" style={{ display: 'block', width: 140, height: 14, marginBottom: 16 }} />
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="patient-row patient-row--skeleton">
                <span className="skeleton" style={{ height: 16 }} />
                <span className="skeleton" style={{ height: 24, width: 44 }} />
                <span className="skeleton" style={{ height: 16, width: '55%' }} />
                <span className="skeleton" style={{ height: 16, width: '65%' }} />
                <span className="skeleton" style={{ height: 16, width: 20 }} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* A — Patienter idag / imorgon */}
          <TodayWidget
            appointments={upcoming}
            patients={patients}
            logMap={logMap}
          />

          {/* B — Larm */}
          <AlertList
            patients={patients}
            logMap={logMap}
            excludeIds={excludeIds}
            onRequestReview={handleRequestReview}
            onRequestMessage={handleRequestMessage}
          />

          {/* C — Alla patienter */}
          <PatientList
            patients={patients}
            logMap={logMap}
            excludeIds={excludeIds}
          />

          {/* D — Nyligen transfunderade */}
          <RecentlyTransfusedList
            actions={actions}
            patients={patients}
          />
        </>
      )}

      {/* Modals */}
      {reviewModal && (
        <MarkReviewedModal
          patient={reviewModal.patient}
          onConfirm={handleConfirmReview}
          onClose={() => setReviewModal(null)}
          saving={saving}
        />
      )}
      {msgModal && (
        <SendMessageModal
          patient={msgModal.patient}
          defaultText={msgModal.defaultText}
          onSend={handleSendMessage}
          onClose={() => setMsgModal(null)}
          saving={saving}
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
