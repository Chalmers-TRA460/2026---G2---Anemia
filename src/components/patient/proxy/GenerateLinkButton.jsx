export default function GenerateLinkButton({ onGenerate, generating }) {
  return (
    <>
      <p className="proxy-generate-desc">
        En anhörig kan hjälpa dig logga symtom genom att klicka på en länk du
        skickar dem. Länken är giltig i 24 timmar.
      </p>
      <button
        type="button"
        className="btn-patient-secondary"
        onClick={onGenerate}
        disabled={generating}
      >
        {generating ? 'Kontrollerar…' : 'Generera ny anhörig-länk →'}
      </button>
    </>
  )
}
