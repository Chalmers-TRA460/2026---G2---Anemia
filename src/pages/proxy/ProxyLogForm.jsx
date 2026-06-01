import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getStockholmDateString } from '../../lib/dates'
import SymptomLogForm from '../../components/shared/SymptomLogForm'
import ProxyError from './ProxyError'
import '../../patient.css'
import '../../proxy.css'

function yesterdayNoonISO() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const dateStr = getStockholmDateString(yesterday)
  const month = new Date().getMonth()
  const offset = (month >= 2 && month <= 9) ? '+02:00' : '+01:00'
  return new Date(`${dateStr}T12:00:00${offset}`).toISOString()
}

function ProxyPageShell({ children }) {
  return (
    <div className="proxy-page">
      <header className="proxy-header">
        <div className="proxy-header-inner">
          <span className="proxy-logo-heart" aria-hidden="true">❤</span>
          <span className="proxy-logo-text">Daglig Koll</span>
        </div>
      </header>
      <main className="proxy-main">{children}</main>
    </div>
  )
}

export default function ProxyLogForm() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [status, setStatus]               = useState('loading')
  const [patientFirstName, setPatientFirstName] = useState('')
  const [existingLog, setExistingLog]     = useState(null)
  const [expiresAt, setExpiresAt]         = useState(null)
  const [errorReason, setErrorReason]     = useState(null)

  const [proxyName, setProxyName]   = useState('')
  const [logDate, setLogDate]       = useState('today')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState(null)

  useEffect(() => {
    async function validate() {
      const { data, error: fnError } = await supabase.functions.invoke(
        'proxy-validate-token',
        { body: { token } }
      )
      if (fnError || !data?.valid) {
        setErrorReason(data?.reason ?? 'server_error')
        setStatus('invalid')
        return
      }
      setPatientFirstName(data.patientFirstName ?? '')
      setExpiresAt(data.expiresAt ?? null)
      const log = data.existingLog ?? null
      setExistingLog(log)
      if (log?.logged_by_proxy && log?.proxy_name) {
        setProxyName(log.proxy_name)
      }
      setStatus('ready')
    }
    validate()
  }, [token])

  async function handleSubmit({ scores, selectedSymptoms, notes }) {
    setSubmitting(true)
    setError(null)

    const body = {
      token,
      proxyName: proxyName.trim(),
      scores,
      ...(selectedSymptoms.length && { selectedSymptoms }),
      ...(notes.trim() && { notes: notes.trim() }),
      ...(logDate === 'yesterday' && { loggedAt: yesterdayNoonISO() }),
    }

    try {
      const { data, error: funcError } = await supabase.functions.invoke(
        'proxy-submit-log',
        { body }
      )

      if (funcError || data?.success === false) {
        const reason = data?.reason
        setError(
          reason === 'token_expired'         ? 'Den här länken har gått ut.' :
          reason === 'token_used'            ? 'Den här länken har redan använts.' :
          reason === 'token_revoked'         ? 'Länken har återkallats av patienten.' :
          reason === 'token_revoked_or_expired' ? 'Länken är inte längre giltig.' :
          reason === 'too_old'               ? 'Datumet är för långt tillbaka.' :
          'Något gick fel. Försök igen.'
        )
        setSubmitting(false)
        return
      }
    } catch {
      setError('Något gick fel. Försök igen.')
      setSubmitting(false)
      return
    }

    navigate(`/anhorig/${token}/bekraftad`, {
      replace: true,
      state: { proxyName: proxyName.trim(), patientFirstName, expiresAt },
    })
  }

  if (status === 'loading') {
    return (
      <ProxyPageShell>
        <div className="proxy-loading-state">
          <div className="proxy-spinner" />
          <p className="proxy-loading-text">Kontrollerar länken…</p>
        </div>
      </ProxyPageShell>
    )
  }

  if (status === 'invalid') {
    return (
      <ProxyPageShell>
        <ProxyError reason={errorReason} />
      </ProxyPageShell>
    )
  }

  const isEditing = existingLog !== null
  const name = patientFirstName || 'patienten'
  const nameDisabled = proxyName.trim().length < 2

  const extraTopFields = (
    <div className="proxy-extra-fields">
      <div className="proxy-field-group">
        <label className="proxy-field-label" htmlFor="proxy-name">
          Vem är du?
        </label>
        <input
          id="proxy-name"
          type="text"
          className="proxy-name-input"
          placeholder="T.ex. Eva (dotter)"
          value={proxyName}
          onChange={e => setProxyName(e.target.value)}
          autoComplete="name"
          maxLength={80}
        />
        <p className="proxy-field-hint">
          Detta sparas så vårdteamet vet vem som hjälpte till.
        </p>
      </div>

      <div className="proxy-field-group">
        <p className="proxy-field-label" id="logdate-label">
          När gäller loggningen?
        </p>
        <div className="proxy-date-group" role="radiogroup" aria-labelledby="logdate-label">
          <label className="proxy-date-option">
            <input
              type="radio"
              name="logDate"
              value="today"
              checked={logDate === 'today'}
              onChange={() => setLogDate('today')}
            />
            <span>Idag</span>
          </label>
          <label className="proxy-date-option">
            <input
              type="radio"
              name="logDate"
              value="yesterday"
              checked={logDate === 'yesterday'}
              onChange={() => setLogDate('yesterday')}
            />
            <span>Igår</span>
          </label>
        </div>
      </div>
    </div>
  )

  return (
    <ProxyPageShell>
      {isEditing && (
        <p className="proxy-edit-notice">
          Du redigerar en tidigare inskickad loggning.
        </p>
      )}

      <span className="page-tag">Loggning</span>
      <h1 className="page-title">
        {isEditing ? `Ändra ${name}s loggning` : `Hur mår ${name} idag?`}
      </h1>
      {!isEditing && (
        <p className="page-subtitle">
          Tryck på en kategori, bedöm hur {name} mår och välj symtom om hen
          upplevt några.
        </p>
      )}

      <SymptomLogForm
        initialValues={isEditing ? {
          scores: {
            energy: existingLog.energy,
            breathing: existingLog.breathing,
            head_balance: existingLog.head_balance,
            general_wellbeing: existingLog.general_wellbeing,
            mental_wellbeing: existingLog.mental_wellbeing,
          },
          selectedSymptoms: existingLog.selected_symptoms ?? [],
          notes: existingLog.notes ?? '',
        } : undefined}
        onSubmit={handleSubmit}
        submitLabel={isEditing ? 'Spara ändringar' : 'Skicka loggning →'}
        extraTopFields={extraTopFields}
        isSubmitting={submitting}
        errorMessage={error}
        extraDisabled={nameDisabled}
      />
    </ProxyPageShell>
  )
}
