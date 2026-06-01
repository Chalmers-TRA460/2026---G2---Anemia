import { FLAG_INFO } from '../../lib/flags'

export default function FlagBadge({ flagKey }) {
  const info = FLAG_INFO[flagKey]
  if (!info) return null
  return (
    <span className={`flag-badge flag-badge--${info.severity}`}>
      {info.label}
    </span>
  )
}
