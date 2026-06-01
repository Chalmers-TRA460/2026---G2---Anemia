import { useState, useEffect, useCallback } from 'react'
import {
  getDelegateTokens, generateDelegateToken, revokeToken, getTodaysLog,
} from '../../../lib/logs'
import GenerateLinkButton from './GenerateLinkButton'
import ActiveLinkCard from './ActiveLinkCard'
import ProxyHistoryList from './ProxyHistoryList'

function classifyToken(t) {
  if (t.revoked) return 'revoked'
  if (t.used)    return 'used'
  if (new Date(t.expires_at) <= new Date()) return 'expired'
  return 'active'
}

export default function ProxyLinkSection({ patientId, firstName }) {
  const [tokens, setTokens]         = useState(null)
  const [generating, setGenerating] = useState(false)
  const [checking, setChecking]     = useState(false)
  const [revoking, setRevoking]     = useState(false)
  const [genError, setGenError]     = useState(null)
  // null | 'standard' | 'has-log'
  const [confirmModal, setConfirmModal] = useState(null)

  const loadTokens = useCallback(async () => {
    const { data } = await getDelegateTokens(patientId)
    setTokens(data ?? [])
  }, [patientId])

  useEffect(() => {
    if (patientId) loadTokens()
  }, [patientId, loadTokens])

  const activeToken = tokens?.find(t => classifyToken(t) === 'active') ?? null

  async function handleRequestGenerate() {
    setChecking(true)
    const { data: todayLog } = await getTodaysLog(patientId)
    setChecking(false)
    setConfirmModal(todayLog ? 'has-log' : 'standard')
  }

  async function handleConfirmGenerate() {
    setConfirmModal(null)
    setGenerating(true)
    setGenError(null)
    const { error } = await generateDelegateToken(patientId)
    setGenerating(false)
    if (error) {
      setGenError('Kunde inte skapa länken. Försök igen.')
      return
    }
    await loadTokens()
  }

  async function handleRevoke(tokenId) {
    setRevoking(true)
    const { error } = await revokeToken(tokenId)
    setRevoking(false)
    if (!error) await loadTokens()
  }

  if (tokens === null) {
    return <p className="proxy-loading">Laddar…</p>
  }

  return (
    <div className="proxy-link-section">
      {activeToken ? (
        <ActiveLinkCard
          token={activeToken.token}
          expiresAt={activeToken.expires_at}
          firstName={firstName}
          onRevoke={() => handleRevoke(activeToken.id)}
          revoking={revoking}
        />
      ) : (
        <GenerateLinkButton
          onGenerate={handleRequestGenerate}
          generating={checking || generating}
        />
      )}
      {genError && <p className="proxy-error">{genError}</p>}
      <ProxyHistoryList tokens={tokens} />

      {/* Standard confirm — no existing log today */}
      {confirmModal === 'standard' && (
        <div className="blocker-overlay" role="dialog" aria-modal="true">
          <div className="blocker-sheet">
            <h3 className="blocker-title">Skapa anhörig-länk?</h3>
            <p className="blocker-body">
              Länken låter en anhörig logga symtom åt dig inom 24 timmar.
              Du kan återkalla den när som helst.
            </p>
            <div className="blocker-btn-group">
              <button className="btn-patient-primary" onClick={handleConfirmGenerate}>
                Skapa länk
              </button>
              <button
                className="blocker-stay-btn"
                onClick={() => setConfirmModal(null)}
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Already-logged confirm */}
      {confirmModal === 'has-log' && (
        <div className="blocker-overlay" role="dialog" aria-modal="true">
          <div className="blocker-sheet">
            <h3 className="blocker-title">Du har redan loggat för idag</h3>
            <p className="blocker-body">
              Vill du att en anhörig ska ändra dina svar? Den nya länken låter
              dem redigera dagens loggning istället för att skapa en ny.
            </p>
            <div className="blocker-btn-group">
              <button className="btn-patient-primary" onClick={handleConfirmGenerate}>
                Ja, skapa länk
              </button>
              <button
                className="blocker-stay-btn"
                onClick={() => setConfirmModal(null)}
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
