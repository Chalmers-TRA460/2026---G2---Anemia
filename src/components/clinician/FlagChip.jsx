import FLAG_LABELS from '../../config/flagLabels'

export default function FlagChip({ flag }) {
  const info = FLAG_LABELS[flag.flag_type]
  return (
    <span
      className={`cl-chip cl-chip--${flag.severity}`}
      title={info?.description}
    >
      {info?.label ?? flag.flag_type}
    </span>
  )
}
