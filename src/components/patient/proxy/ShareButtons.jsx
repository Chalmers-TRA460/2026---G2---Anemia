import { useState } from 'react'

// ── Brand icon SVGs ───────────────────────────────

function IconMessages() {
  return (
    <svg className="share-btn-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#34C759"/>
      <path d="M12 5C7.58 5 4 8.13 4 12c0 1.55.57 2.98 1.52 4.13L4.1 18.9a.5.5 0 00.62.62l2.9-1.4A8.3 8.3 0 0012 19c4.42 0 8-3.13 8-7s-3.58-7-8-7z" fill="white"/>
    </svg>
  )
}

function IconEmail() {
  return (
    <svg className="share-btn-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#0A84FF"/>
      <rect x="4" y="7" width="16" height="11" rx="2" fill="white" opacity="0.95"/>
      <path d="M4 9l8 5.5L20 9" stroke="#0A84FF" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}

function IconWhatsApp() {
  return (
    <svg className="share-btn-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function IconFacebook() {
  return (
    <svg className="share-btn-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

// ── Component ─────────────────────────────────────

export default function ShareButtons({ url, firstName }) {
  const [copied, setCopied] = useState(false)

  const message =
    `Hej! ${firstName} vill att du hjälper hen logga sina symtom i appen ` +
    `Daglig Koll. Öppna länken: ${url}\nLänken är giltig i 24 timmar.`
  const subject = `${firstName} behöver din hjälp med Daglig Koll`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available in this context
    }
  }

  return (
    <div className="share-buttons-grid">
      <a
        className="share-btn"
        href={`sms:?body=${encodeURIComponent(message)}`}
        aria-label="Dela via SMS"
      >
        <IconMessages />
        SMS
      </a>

      <a
        className="share-btn"
        href={`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`}
        aria-label="Dela via e-post"
      >
        <IconEmail />
        E-post
      </a>

      <a
        className="share-btn"
        href={`https://wa.me/?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Dela via WhatsApp"
      >
        <IconWhatsApp />
        WhatsApp
      </a>

      <a
        className="share-btn"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Dela via Facebook"
      >
        <IconFacebook />
        Facebook
      </a>

      <button
        type="button"
        className={`share-btn${copied ? ' share-btn--copied' : ''}`}
        onClick={handleCopy}
        aria-label="Kopiera länk till urklipp"
      >
        <span className="material-icons-outlined share-btn-icon">
          {copied ? 'check' : 'content_copy'}
        </span>
        {copied ? 'Kopierat ✓' : 'Kopiera'}
      </button>
    </div>
  )
}
