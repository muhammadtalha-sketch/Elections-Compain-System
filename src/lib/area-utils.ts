// Maps raw address strings to normalised area names.
// Used as a client-side fallback when the `area` column is NULL
// (i.e. before migration 005 has been run on the database).

const AREA_PATTERNS: [RegExp, string][] = [
  [/CANTT/i,                              'Sialkot Cantt'],
  [/MODEL TOWN/i,                          'Model Town'],
  [/HAJI\s?PURA|HAJIPURA/i,               'Hajipura'],
  [/DEFENCE ROAD/i,                        'Defence Road'],
  [/RANGPURA/i,                            'Rangpura'],
  [/PARIS ROAD/i,                          'Paris Road'],
  [/KUTCHERY ROAD/i,                       'Kutchery Road'],
  [/PASRUR ROAD/i,                         'Pasrur Road'],
  [/KASHMIR ROAD/i,                        'Kashmir Road'],
  [/ISLAMPURA/i,                           'Islampura'],
  [/MUSLIM TOWN/i,                         'Muslim Town'],
  [/HUNTER PURA/i,                         'Hunter Pura'],
  [/GARDEN TOWN/i,                         'Garden Town'],
  [/SADAR BAZAR|SADDAR BAZAR/i,            'Sadar Bazar'],
  [/DASKA ROAD/i,                          'Daska Road'],
  [/WAZIRABAD ROAD/i,                      'Wazirabad Road'],
  [/AIRPORT ROAD/i,                        'Airport Road'],
  [/SHAHABPURA|SHAHAB PURA/i,              'Shahabpura'],
  [/FIRDOOS|FIRDOUS/i,                     'Firdoos Pura'],
  [/ZAFAR ALI ROAD/i,                      'Zafar Ali Road'],
  [/KHALID ROAD/i,                         'Khalid Road'],
  [/NISHAT PARK/i,                         'Nishat Park'],
  [/KOTLI LOHARAN/i,                       'Kotli Loharan'],
  [/DISTRICT BAR ASSOCIATION|DISTT BAR|D\.B\.A|DBA|BAR ASSOCIATION/i, 'District Bar Association'],
  [/DISTRICT COURT|DISTT COURT/i,          'District Courts'],
  [/LAWYERS INN/i,                         'Lawyers Inn'],
  [/VILL|P\.O\b|P\/O\b|MOHALL|TEH\b|TEHSIL/i, 'Rural / Village'],
]

export function extractAreaFromAddress(address: string | null | undefined): string {
  if (!address) return 'Sialkot City'
  for (const [pattern, area] of AREA_PATTERNS) {
    if (pattern.test(address)) return area
  }
  return 'Sialkot City'
}

// Returns a normalised area label — prefer the stored `area` field,
// fall back to extracting from `address` when area is null.
export function resolveArea(
  area: string | null | undefined,
  address: string | null | undefined,
): string {
  return area || extractAreaFromAddress(address)
}
