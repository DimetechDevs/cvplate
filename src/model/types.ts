/** A month-precision date stored as "YYYY-MM", or "YYYY" when the month is unknown. Empty string means unset. */
export type YearMonth = string

export interface Link {
  id: string
  label: string
  url: string
}

export interface PersonalDetails {
  dateOfBirth: string
  nationality: string
  workRights: string
  drivingLicence: string
}

export interface Basics {
  name: string
  headline: string
  email: string
  phone: string
  location: string
  links: Link[]
  /** JPEG data URL, already downscaled. */
  photo: string
  personal: PersonalDetails
}

/** Experience, education, projects, volunteering, appointments: anything with a span of dates. */
export interface Entry {
  id: string
  title: string
  org: string
  location: string
  start: YearMonth
  end: YearMonth
  current: boolean
  /** Short line under the heading, e.g. a grade or a one-sentence remit. */
  note: string
  bullets: string[]
}

export interface SkillGroup {
  id: string
  name: string
  keywords: string
}

export type CefrLevel = '' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export interface Language {
  id: string
  language: string
  /** Free-text fluency ("Native", "Professional working"), used when CEFR is not filled. */
  fluency: string
  native: boolean
  cefr: {
    listening: CefrLevel
    reading: CefrLevel
    interaction: CefrLevel
    production: CefrLevel
    writing: CefrLevel
  }
}

/** Certifications, licences, awards, publications, CPD, conferences. */
export interface ListItem {
  id: string
  title: string
  issuer: string
  date: YearMonth
  detail: string
}

export interface Reference {
  id: string
  name: string
  role: string
  org: string
  email: string
  phone: string
}

interface SectionBase {
  id: string
  title: string
  hidden: boolean
}

export type Section =
  | (SectionBase & { kind: 'summary'; text: string })
  | (SectionBase & { kind: 'entries'; items: Entry[] })
  | (SectionBase & { kind: 'skills'; items: SkillGroup[] })
  | (SectionBase & { kind: 'languages'; items: Language[]; useCefr: boolean })
  | (SectionBase & { kind: 'list'; items: ListItem[] })
  | (SectionBase & { kind: 'references'; items: Reference[]; onRequest: boolean })

export type SectionKind = Section['kind']

export interface CvSettings {
  templateId: string
  countryId: string
  sectorId: string
  /** Hex colour; falls back to the template's own accent when empty. */
  accent: string
  pageSize: 'A4' | 'LETTER'
  showPhoto: boolean
  showPersonal: boolean
  /** Closing line: German-style place/date/signature or Indian-style declaration. */
  closing: 'none' | 'signature' | 'declaration'
  closingPlace: string
}

export interface Cv {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  basics: Basics
  sections: Section[]
  settings: CvSettings
}
