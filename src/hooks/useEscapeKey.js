import { useEffect, useRef } from 'react'

// Calls handler() when the Escape key is pressed.
// Uses a ref so the latest handler is always used without re-registering the listener.
export function useEscapeKey(handler) {
  const ref = useRef(handler)
  useEffect(() => { ref.current = handler })
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') ref.current() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
}
