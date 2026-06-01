// Wrapper for every patient list — provides the colored header band and column labels.
// children should be <PatientRow> elements.
export default function PatientListSection({
  title,
  icon,
  badge,
  variant = 'default',   // 'default' | 'risk' | 'today' | 'reviewed'
  extra,                 // optional element shown on the right of the header (e.g. sort dropdown)
  empty,                 // empty-state message
  children,
}) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : !!children

  return (
    <div className={`cl-ls cl-ls--${variant}`}>
      {/* ── Coloured header band ── */}
      <div className="cl-ls-header">
        <div className="cl-ls-header-left">
          {icon && (
            <span className="material-icons cl-ls-icon" aria-hidden="true">{icon}</span>
          )}
          <span className="cl-ls-title">{title}</span>
          {badge != null && (
            <span className={`cl-ls-badge${variant === 'risk' ? ' cl-ls-badge--risk' : ''}`}>
              {badge}
            </span>
          )}
        </div>
        {extra && <div className="cl-ls-header-right">{extra}</div>}
      </div>

      {/* ── Column headers ── */}
      {hasChildren && (
        <div className="cl-ls-col-heads">
          <span>Patient</span>
          <span>Nästa besök</span>
          <span>Senaste loggning</span>
          <span>Senaste 7 dagar</span>
        </div>
      )}

      {/* ── Rows ── */}
      {hasChildren ? children : <p className="cl-empty">{empty ?? 'Inga patienter.'}</p>}
    </div>
  )
}
