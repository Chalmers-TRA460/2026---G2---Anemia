const FLAG_LABELS = {
  // Adherens
  no_log_3d: {
    label: 'Ej loggat 3 dagar',
    description: 'Patienten har inte registrerat någon loggning på 3 dagar.',
  },
  no_log_5d: {
    label: 'Ej loggat 5 dagar',
    description: 'Patienten har inte registrerat någon loggning på 5+ dagar.',
  },
  no_log_7d: {
    label: 'Ej loggat 7 dagar',
    description: 'Patienten har inte registrerat någon loggning på 7+ dagar — kontakt rekommenderas.',
  },
  // Låga värden
  low_scores_3plus: {
    label: '3+ kategorier låga',
    description: 'Patienten har rapporterat värde ≤ 2 i minst 3 av 5 kategorier i senaste loggen.',
  },
  low_scores_2plus: {
    label: '2+ kategorier låga',
    description: 'Patienten har rapporterat värde ≤ 2 i minst 2 av 5 kategorier i senaste loggen.',
  },
  category_at_one: {
    label: 'Kategori med värde 1',
    description: 'Minst en kategori är rankad 1 (mår dåligt) i senaste loggen.',
  },
  // Kategorinedgång
  cat_drop_energy: {
    label: 'Energi ner ≥3 poäng',
    description: 'Energi-värdet har minskat 3+ poäng sedan föregående loggning.',
  },
  cat_drop_breathing: {
    label: 'Andning ner ≥3 poäng',
    description: 'Andnings-värdet har minskat 3+ poäng sedan föregående loggning.',
  },
  cat_drop_head_balance: {
    label: 'Huvud & balans ner ≥3 poäng',
    description: 'Huvud-/balans-värdet har minskat 3+ poäng sedan föregående loggning.',
  },
  cat_drop_general: {
    label: 'Allmänt mående ner ≥3 poäng',
    description: 'Allmänt mående har minskat 3+ poäng sedan föregående loggning.',
  },
  cat_drop_mental: {
    label: 'Mentalt mående ner ≥3 poäng',
    description: 'Mentalt mående har minskat 3+ poäng sedan föregående loggning.',
  },
  // Symtomkombinationer
  cardiac_compensation: {
    label: 'Kardiell kompensation',
    description:
      'Möjlig hjärt-kompensation för låg Hb. Kontrollera om patienten har andfåddhet, hjärtklappning och hög puls.',
  },
  fall_risk: {
    label: 'Fallrisk',
    description: 'Yrsel, svimningskänsla och dålig balans tyder på förhöjd fallrisk.',
  },
  possible_hb_drop: {
    label: 'Möjlig Hb-nedgång',
    description: 'Svaghet, svimningskänsla och låg energi kan tyda på Hb-nedgång.',
  },
  chronic_mental_burden: {
    label: 'Kronisk mental börda',
    description:
      'Trötthet, nedstämdhet och motivationsbrist över flera dagar — överväg samtalskontakt.',
  },
  aptit_trotthet_3d: {
    label: 'Aptit + trötthet 3+ dagar',
    description: 'Patienten rapporterar nedsatt aptit och trötthet i 3+ dagar i rad.',
  },
  classic_anemia_signs: {
    label: 'Klassiska anemi-tecken',
    description: 'Blek hud och frysningar — konsistent med anemi-progression.',
  },
}

export default FLAG_LABELS
