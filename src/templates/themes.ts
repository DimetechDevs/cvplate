/**
 * Template definitions. One renderer per output (PDF, DOCX) reads these, so a template is a set of
 * typographic decisions rather than a separate component tree. Values are in points.
 */

export type PdfFamily =
  | 'Carlito'
  | 'Caladea'
  | 'Gelasio'
  | 'SourceSans3'
  | 'SourceSerif4'
  | 'EBGaramond'
  | 'IBMPlexSans'
  | 'LibreFranklin'
  | 'Inter'

export type Layout = 'single' | 'label' | 'sidebar'

export interface Theme {
  id: string
  name: string
  blurb: string
  sectors: string[]
  ats: boolean
  layout: Layout
  pdf: { body: PdfFamily; heading: PdfFamily; name: PdfFamily }
  /** Fonts installed with Microsoft Office, chosen to match the PDF faces. */
  docx: { body: string; heading: string; name: string }
  size: { body: number; small: number; name: number; headline: number; heading: number; entryTitle: number }
  lineHeight: number
  accent: string
  /** Body text colour. Never pure black. */
  ink: string
  muted: string
  header: {
    align: 'left' | 'center'
    nameCase: 'none' | 'upper'
    nameWeight: 400 | 600 | 700
    nameTracking: number
    /** Rule under the whole header block. */
    rule: boolean
    contactSeparator: string
  }
  heading: {
    case: 'upper' | 'none'
    weight: 400 | 600 | 700
    tracking: number
    color: 'accent' | 'ink'
    /** Rule under the heading text. */
    rule: 'none' | 'hairline' | 'accent'
  }
  entry: {
    /** Where dates sit: right-aligned on the title line, or in a hanging left column. */
    dates: 'right' | 'left'
    /** Which of position or organisation leads the entry. */
    lead: 'title' | 'org'
    bullet: string
  }
  /** Space above each section heading and between entries. */
  rhythm: { section: number; entry: number }
  margins: { a4: number; letter: number }
  sidebarTint?: string
}

const base = {
  ink: '#1c1c1c',
  muted: '#555555',
  lineHeight: 1.32,
  margins: { a4: 45, letter: 47 },
}

export const THEMES: Theme[] = [
  {
    ...base,
    id: 'meridian',
    name: 'Meridian',
    blurb: 'Clean single column. The safe choice for any application.',
    sectors: ['general', 'education', 'hospitality'],
    ats: true,
    layout: 'single',
    pdf: { body: 'Carlito', heading: 'Carlito', name: 'Carlito' },
    docx: { body: 'Calibri', heading: 'Calibri', name: 'Calibri' },
    size: { body: 10.5, small: 9.5, name: 22, headline: 11.5, heading: 10.5, entryTitle: 10.5 },
    accent: '#1f4e79',
    header: { align: 'left', nameCase: 'none', nameWeight: 700, nameTracking: 0, rule: false, contactSeparator: '  |  ' },
    heading: { case: 'upper', weight: 700, tracking: 0.8, color: 'accent', rule: 'hairline' },
    entry: { dates: 'right', lead: 'title', bullet: '•' },
    rhythm: { section: 12, entry: 7 },
  },
  {
    ...base,
    id: 'ledger',
    name: 'Ledger',
    blurb: 'Centred serif, dense and formal. The banking and law convention.',
    sectors: ['finance'],
    ats: true,
    layout: 'single',
    pdf: { body: 'Gelasio', heading: 'Gelasio', name: 'Gelasio' },
    docx: { body: 'Georgia', heading: 'Georgia', name: 'Georgia' },
    size: { body: 10, small: 9, name: 20, headline: 10.5, heading: 10, entryTitle: 10 },
    lineHeight: 1.28,
    accent: '#1c1c1c',
    header: { align: 'center', nameCase: 'upper', nameWeight: 700, nameTracking: 1.5, rule: false, contactSeparator: '  ·  ' },
    heading: { case: 'upper', weight: 700, tracking: 1, color: 'ink', rule: 'hairline' },
    entry: { dates: 'right', lead: 'org', bullet: '•' },
    rhythm: { section: 10, entry: 6 },
  },
  {
    ...base,
    id: 'continental',
    name: 'Continental',
    blurb: 'Europass-style label column with a CEFR language grid.',
    sectors: ['general'],
    ats: true,
    layout: 'label',
    pdf: { body: 'SourceSans3', heading: 'SourceSans3', name: 'SourceSans3' },
    docx: { body: 'Arial', heading: 'Arial', name: 'Arial' },
    size: { body: 10, small: 9, name: 21, headline: 11, heading: 9, entryTitle: 10.5 },
    accent: '#0e4c92',
    header: { align: 'left', nameCase: 'none', nameWeight: 600, nameTracking: 0, rule: true, contactSeparator: '   ' },
    heading: { case: 'upper', weight: 600, tracking: 0.6, color: 'accent', rule: 'none' },
    entry: { dates: 'left', lead: 'title', bullet: '•' },
    rhythm: { section: 12, entry: 8 },
  },
  {
    ...base,
    id: 'scholar',
    name: 'Scholar',
    blurb: 'Traditional academic CV. Hanging dates, built to run several pages.',
    sectors: ['academia'],
    ats: true,
    layout: 'single',
    pdf: { body: 'EBGaramond', heading: 'EBGaramond', name: 'EBGaramond' },
    docx: { body: 'Garamond', heading: 'Garamond', name: 'Garamond' },
    size: { body: 11, small: 10, name: 22, headline: 12, heading: 11.5, entryTitle: 11 },
    lineHeight: 1.3,
    accent: '#5a1e1e',
    header: { align: 'center', nameCase: 'none', nameWeight: 600, nameTracking: 0.3, rule: false, contactSeparator: '  ·  ' },
    heading: { case: 'none', weight: 600, tracking: 0, color: 'accent', rule: 'hairline' },
    entry: { dates: 'left', lead: 'title', bullet: '–' },
    rhythm: { section: 13, entry: 6 },
  },
  {
    ...base,
    id: 'clinician',
    name: 'Clinician',
    blurb: 'Registration details up front, built for medical and nursing CVs.',
    sectors: ['healthcare'],
    ats: true,
    layout: 'single',
    pdf: { body: 'SourceSans3', heading: 'SourceSans3', name: 'SourceSans3' },
    docx: { body: 'Calibri', heading: 'Calibri', name: 'Calibri' },
    size: { body: 10.5, small: 9.5, name: 21, headline: 11.5, heading: 10.5, entryTitle: 10.5 },
    accent: '#0f5f5c',
    header: { align: 'left', nameCase: 'none', nameWeight: 700, nameTracking: 0, rule: true, contactSeparator: '  |  ' },
    heading: { case: 'none', weight: 700, tracking: 0, color: 'accent', rule: 'none' },
    entry: { dates: 'right', lead: 'title', bullet: '•' },
    rhythm: { section: 12, entry: 7 },
  },
  {
    ...base,
    id: 'circuit',
    name: 'Circuit',
    blurb: 'Compact, skills first, links inline. For engineers and analysts.',
    sectors: ['tech'],
    ats: true,
    layout: 'single',
    pdf: { body: 'IBMPlexSans', heading: 'IBMPlexSans', name: 'IBMPlexSans' },
    docx: { body: 'Arial', heading: 'Arial', name: 'Arial' },
    size: { body: 9.5, small: 8.5, name: 20, headline: 10.5, heading: 9.5, entryTitle: 10 },
    lineHeight: 1.35,
    accent: '#2f4858',
    header: { align: 'left', nameCase: 'none', nameWeight: 600, nameTracking: -0.2, rule: false, contactSeparator: '  /  ' },
    heading: { case: 'upper', weight: 600, tracking: 1.2, color: 'accent', rule: 'hairline' },
    entry: { dates: 'right', lead: 'title', bullet: '–' },
    rhythm: { section: 11, entry: 6 },
  },
  {
    ...base,
    id: 'studio',
    name: 'Studio',
    blurb: 'Two columns with a tinted sidebar and optional photo. For portfolios and direct applications.',
    sectors: ['creative'],
    ats: false,
    layout: 'sidebar',
    pdf: { body: 'LibreFranklin', heading: 'LibreFranklin', name: 'LibreFranklin' },
    docx: { body: 'Franklin Gothic Book', heading: 'Franklin Gothic Demi', name: 'Franklin Gothic Demi' },
    size: { body: 9.5, small: 8.5, name: 22, headline: 11, heading: 9, entryTitle: 10 },
    lineHeight: 1.38,
    accent: '#b04a2f',
    header: { align: 'left', nameCase: 'none', nameWeight: 600, nameTracking: -0.3, rule: false, contactSeparator: '\n' },
    heading: { case: 'upper', weight: 600, tracking: 1.4, color: 'accent', rule: 'none' },
    entry: { dates: 'right', lead: 'title', bullet: '•' },
    rhythm: { section: 13, entry: 8 },
    sidebarTint: '#f3efe9',
  },
  {
    ...base,
    id: 'executive',
    name: 'Executive',
    blurb: 'Serif name over a sans body, with room for headline achievements.',
    sectors: ['executive'],
    ats: true,
    layout: 'single',
    pdf: { body: 'Carlito', heading: 'Caladea', name: 'Caladea' },
    docx: { body: 'Calibri', heading: 'Cambria', name: 'Cambria' },
    size: { body: 10.5, small: 9.5, name: 24, headline: 12, heading: 12, entryTitle: 11 },
    accent: '#273b5b',
    header: { align: 'left', nameCase: 'none', nameWeight: 700, nameTracking: 0, rule: true, contactSeparator: '  ·  ' },
    heading: { case: 'none', weight: 700, tracking: 0, color: 'accent', rule: 'none' },
    entry: { dates: 'right', lead: 'title', bullet: '▪' },
    rhythm: { section: 14, entry: 8 },
  },
  {
    ...base,
    id: 'foundation',
    name: 'Foundation',
    blurb: 'Light and open, education first. For students and graduates.',
    sectors: ['graduate'],
    ats: true,
    layout: 'single',
    pdf: { body: 'Inter', heading: 'Inter', name: 'Inter' },
    docx: { body: 'Arial', heading: 'Arial', name: 'Arial' },
    size: { body: 9.5, small: 8.5, name: 20, headline: 10.5, heading: 9.5, entryTitle: 10 },
    lineHeight: 1.4,
    accent: '#3d5a40',
    header: { align: 'left', nameCase: 'none', nameWeight: 700, nameTracking: -0.3, rule: false, contactSeparator: '  ·  ' },
    heading: { case: 'none', weight: 700, tracking: 0, color: 'accent', rule: 'accent' },
    entry: { dates: 'right', lead: 'title', bullet: '•' },
    rhythm: { section: 12, entry: 7 },
  },
  {
    ...base,
    id: 'tradesman',
    name: 'Tradesman',
    blurb: 'Straightforward and bold, with licences and tickets near the top.',
    sectors: ['trades'],
    ats: true,
    layout: 'single',
    pdf: { body: 'Carlito', heading: 'Carlito', name: 'Carlito' },
    docx: { body: 'Calibri', heading: 'Calibri', name: 'Calibri' },
    size: { body: 11, small: 10, name: 24, headline: 12, heading: 11, entryTitle: 11 },
    accent: '#7a4b12',
    header: { align: 'left', nameCase: 'upper', nameWeight: 700, nameTracking: 0.5, rule: true, contactSeparator: '  |  ' },
    heading: { case: 'upper', weight: 700, tracking: 0.6, color: 'ink', rule: 'accent' },
    entry: { dates: 'right', lead: 'title', bullet: '•' },
    rhythm: { section: 12, entry: 7 },
  },
]

export const themeById = (id: string): Theme => THEMES.find((t) => t.id === id) ?? THEMES[0]
