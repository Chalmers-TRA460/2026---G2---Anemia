import FLAG_LABELS from '../../config/flagLabels'

const TZ = 'Europe/Stockholm'

function formatDate(iso) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: TZ,
    day:     'numeric',
    month:   'short',
    hour:    '2-digit',
    minute:  '2-digit',
  }).format(new Date(iso))
}

export default function ActiveFlagsSection({ flags }) {
  if (!flags.length) return null

  return (
    <div className="cl-card">
      <div className="cl-section-header">
        <span className="cl-section-label cl-section-label--alert">
          <span className="material-icons" style={{ fontSize: 14 }} aria-hidden="true">warning</span>
          Aktiva flaggor
          <span className="cl-count-badge cl-count-badge--alert">{flags.length}</span>
        </span>
      </div>

      <div className="cl-flags-list">
        {flags.map(f => {
          const info = FLAG_LABELS[f.flag_type]
          return (
            <div key={f.id} className="cl-flag-row">
              <span className={`cl-chip cl-chip--${f.severity}`}>
                {f.severity === 'critical'   ? 'Kritisk'   :
                 f.severity === 'concerning' ? 'Allvarlig' : 'Risk'}
              </span>
              <div className="cl-flag-body">
                <span className="cl-flag-label">{info?.label ?? f.flag_type}</span>
                {info?.description && (
                  <span className="cl-flag-desc">{info.description}</span>
                )}
              </div>
              <span className="cl-flag-time">{formatDate(f.triggered_at)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
