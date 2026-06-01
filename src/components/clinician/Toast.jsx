import { useEffect } from 'react'

const ICON = { success: 'check_circle', error: 'error', info: 'info' }

export default function Toast({ message, type = 'success', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className={`cl-toast cl-toast--${type}`} role="status" aria-live="polite">
      <span className="material-icons cl-toast-icon" aria-hidden="true">
        {ICON[type] ?? 'info'}
      </span>
      {message}
    </div>
  )
}
