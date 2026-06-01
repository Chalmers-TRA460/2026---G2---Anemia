const MESSAGES = {
  not_found: {
    title: 'Länken är ogiltig',
    body: 'Kontrollera att du kopierade hela länken, eller be patienten skicka en ny länk.',
  },
  expired: {
    title: 'Länken har gått ut',
    body: 'Den här länken är inte längre giltig. Be patienten skapa en ny.',
  },
  used: {
    title: 'Länken har redan använts',
    body: 'Den här länken har redan använts en gång. Be patienten skapa en ny om hen behöver mer hjälp.',
  },
  revoked: {
    title: 'Länken är återkallad',
    body: 'Patienten har återkallat den här länken.',
  },
  patient_not_found: {
    title: 'Något gick fel',
    body: 'Kontakta studieansvarig för hjälp.',
  },
  server_error: {
    title: 'Tekniskt fel',
    body: 'Ett tekniskt fel uppstod. Försök igen om en stund.',
  },
}

export default function ProxyError({ reason }) {
  const msg = MESSAGES[reason] ?? MESSAGES.server_error

  return (
    <div className="proxy-error-card">
      <span className="material-icons proxy-error-icon" aria-hidden="true">
        error_outline
      </span>
      <h1 className="proxy-error-title">{msg.title}</h1>
      <p className="proxy-error-body">{msg.body}</p>
    </div>
  )
}
