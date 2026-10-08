export type DateStyle = 'short' | 'numeric'

export interface CountryPreset {
  id: string
  label: string
  pageSize: 'A4' | 'LETTER'
  /** What the document is called in this market. */
  docLabel: string
  photo: 'never' | 'optional' | 'common'
  /** Whether date of birth, nationality etc. are customary. */
  personal: 'never' | 'optional' | 'common'
  dateStyle: DateStyle
  closing: 'none' | 'signature' | 'declaration'
  /** Referees listed with contact details is customary. */
  referees: boolean
  length: string
  notes: string[]
}

export const COUNTRIES: CountryPreset[] = [
  {
    id: 'intl',
    label: 'International',
    pageSize: 'A4',
    docLabel: 'CV',
    photo: 'optional',
    personal: 'optional',
    dateStyle: 'short',
    closing: 'none',
    referees: false,
    length: '2 pages',
    notes: ['The safest choice when you are applying across borders.', 'Leave out photo and date of birth unless the employer asks.'],
  },
  {
    id: 'us',
    label: 'United States',
    pageSize: 'LETTER',
    docLabel: 'Résumé',
    photo: 'never',
    personal: 'never',
    dateStyle: 'short',
    closing: 'none',
    referees: false,
    length: '1 page, 2 with 10+ years',
    notes: ['No photo, date of birth, marital status or nationality: US employers avoid them for anti-discrimination reasons.', 'Leave references off; provide them when asked.'],
  },
  {
    id: 'ca',
    label: 'Canada',
    pageSize: 'LETTER',
    docLabel: 'Résumé',
    photo: 'never',
    personal: 'never',
    dateStyle: 'short',
    closing: 'none',
    referees: false,
    length: '1–2 pages',
    notes: ['No photo or personal details, and never your Social Insurance Number.'],
  },
  {
    id: 'uk',
    label: 'United Kingdom & Ireland',
    pageSize: 'A4',
    docLabel: 'CV',
    photo: 'never',
    personal: 'never',
    dateStyle: 'short',
    closing: 'none',
    referees: false,
    length: '2 pages',
    notes: ['No photo, age or marital status.', 'A short personal profile at the top is expected.'],
  },
  {
    id: 'eu',
    label: 'European Union (Europass)',
    pageSize: 'A4',
    docLabel: 'CV',
    photo: 'optional',
    personal: 'optional',
    dateStyle: 'numeric',
    closing: 'none',
    referees: false,
    length: '2 pages',
    notes: ['Rate languages on the CEFR scale (A1–C2).', 'Put education first if you have little work experience.'],
  },
  {
    id: 'dach',
    label: 'Germany, Austria, Switzerland',
    pageSize: 'A4',
    docLabel: 'Lebenslauf',
    photo: 'common',
    personal: 'common',
    dateStyle: 'numeric',
    closing: 'signature',
    referees: false,
    length: '1–2 pages',
    notes: ['A professional photo and date of birth are still common, though optional by law.', 'Close with place, date and signature.'],
  },
  {
    id: 'gulf',
    label: 'Gulf (UAE, Saudi Arabia, Qatar…)',
    pageSize: 'A4',
    docLabel: 'CV',
    photo: 'common',
    personal: 'common',
    dateStyle: 'short',
    closing: 'none',
    referees: false,
    length: '2–3 pages',
    notes: ['Nationality, visa status and driving licence are usually listed.', 'A professional photo is common.'],
  },
  {
    id: 'africa',
    label: 'Africa (Nigeria, Kenya, Ghana, South Africa)',
    pageSize: 'A4',
    docLabel: 'CV',
    photo: 'optional',
    personal: 'optional',
    dateStyle: 'short',
    closing: 'none',
    referees: true,
    length: '2–3 pages',
    notes: ['Two or three referees with phone and email are customary.', 'List professional registrations (e.g. COREN, ICAN, NCK) prominently.'],
  },
  {
    id: 'in',
    label: 'India',
    pageSize: 'A4',
    docLabel: 'Résumé',
    photo: 'optional',
    personal: 'optional',
    dateStyle: 'short',
    closing: 'declaration',
    referees: false,
    length: '1–2 pages',
    notes: ['A closing declaration is optional and common for government and PSU roles.'],
  },
  {
    id: 'au',
    label: 'Australia & New Zealand',
    pageSize: 'A4',
    docLabel: 'Résumé',
    photo: 'never',
    personal: 'never',
    dateStyle: 'short',
    closing: 'none',
    referees: true,
    length: '2–3 pages',
    notes: ['State your work rights (e.g. "Australian citizen", "Working holiday visa").', 'Two referees are customary.'],
  },
]

export const countryById = (id: string): CountryPreset => COUNTRIES.find((c) => c.id === id) ?? COUNTRIES[0]
