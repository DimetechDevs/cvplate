import { countryById, type DateStyle } from '../model/countries'
import { cleanBullets, displayUrl, hrefFor, joinNonEmpty } from '../model/format'
import type { Cv, Section } from '../model/types'
import { themeById, type Theme } from '../templates/themes'

export interface ContactItem {
  text: string
  href?: string
}

/** Everything a renderer needs, with empty content already removed. Shared by the PDF and DOCX outputs. */
export interface Prepared {
  cv: Cv
  theme: Theme
  accent: string
  dateStyle: DateStyle
  pageSize: 'A4' | 'LETTER'
  contacts: ContactItem[]
  personal: { label: string; value: string }[]
  photo: string
  sections: Section[]
  /** Sections that go in the sidebar for the sidebar layout. */
  sideSections: Section[]
  closing: { kind: 'none' | 'signature' | 'declaration'; place: string; name: string }
}

const SIDEBAR_KINDS = new Set<Section['kind']>(['skills', 'languages', 'references'])

export function isSectionEmpty(s: Section): boolean {
  switch (s.kind) {
    case 'summary':
      return !s.text.trim()
    case 'entries':
      return !s.items.some((e) => e.title.trim() || e.org.trim() || cleanBullets(e.bullets).length)
    case 'skills':
      return !s.items.some((g) => g.keywords.trim() || g.name.trim())
    case 'languages':
      return !s.items.some((l) => l.language.trim())
    case 'list':
      return !s.items.some((i) => i.title.trim())
    case 'references':
      return !s.onRequest && !s.items.some((r) => r.name.trim())
  }
}

/** Drops blank items inside a section so templates never render empty rows. */
function compact(s: Section): Section {
  switch (s.kind) {
    case 'entries':
      return { ...s, items: s.items.filter((e) => e.title.trim() || e.org.trim() || cleanBullets(e.bullets).length).map((e) => ({ ...e, bullets: cleanBullets(e.bullets) })) }
    case 'skills':
      return { ...s, items: s.items.filter((g) => g.keywords.trim() || g.name.trim()) }
    case 'languages':
      return { ...s, items: s.items.filter((l) => l.language.trim()) }
    case 'list':
      return { ...s, items: s.items.filter((i) => i.title.trim()) }
    case 'references':
      return { ...s, items: s.items.filter((r) => r.name.trim()) }
    default:
      return s
  }
}

export function prepare(cv: Cv): Prepared {
  const theme = themeById(cv.settings.templateId)
  const country = countryById(cv.settings.countryId)
  const b = cv.basics

  const contacts: ContactItem[] = []
  if (b.email.trim()) contacts.push({ text: b.email.trim(), href: `mailto:${b.email.trim()}` })
  if (b.phone.trim()) contacts.push({ text: b.phone.trim(), href: `tel:${b.phone.replace(/[^+\d]/g, '')}` })
  if (b.location.trim()) contacts.push({ text: b.location.trim() })
  for (const l of b.links) {
    if (l.url.trim()) contacts.push({ text: displayUrl(l.url.trim()), href: hrefFor(l.url.trim()) })
  }

  const personal: Prepared['personal'] = []
  if (cv.settings.showPersonal) {
    const p = b.personal
    if (p.dateOfBirth.trim()) personal.push({ label: 'Date of birth', value: p.dateOfBirth.trim() })
    if (p.nationality.trim()) personal.push({ label: 'Nationality', value: p.nationality.trim() })
    if (p.workRights.trim()) personal.push({ label: 'Work rights', value: p.workRights.trim() })
    if (p.drivingLicence.trim()) personal.push({ label: 'Driving licence', value: p.drivingLicence.trim() })
  } else if (b.personal.workRights.trim()) {
    // Work rights are relevant in every market (e.g. Australia, Gulf), so they show even with personal details off.
    personal.push({ label: 'Work rights', value: b.personal.workRights.trim() })
  }

  const visible = cv.sections.filter((s) => !s.hidden && !isSectionEmpty(s)).map(compact)
  const sidebar = theme.layout === 'sidebar'
  const sideSections = sidebar ? visible.filter((s) => SIDEBAR_KINDS.has(s.kind)) : []
  const sections = sidebar ? visible.filter((s) => !SIDEBAR_KINDS.has(s.kind)) : visible

  return {
    cv,
    theme,
    accent: /^#[0-9a-f]{6}$/i.test(cv.settings.accent) ? cv.settings.accent : theme.accent,
    dateStyle: country.dateStyle,
    pageSize: cv.settings.pageSize,
    contacts,
    personal,
    photo: cv.settings.showPhoto ? b.photo : '',
    sections,
    sideSections,
    closing: { kind: cv.settings.closing, place: cv.settings.closingPlace.trim(), name: b.name.trim() },
  }
}

export const DECLARATION = 'I hereby declare that the information given above is true and correct to the best of my knowledge.'

export const CEFR_COLUMNS = [
  ['listening', 'Listening'],
  ['reading', 'Reading'],
  ['interaction', 'Spoken interaction'],
  ['production', 'Spoken production'],
  ['writing', 'Writing'],
] as const

export const languageLine = (l: { language: string; fluency: string; native: boolean }): string =>
  joinNonEmpty([l.language, l.native ? 'Native' : l.fluency], ' — ')

export const todayLine = (place: string): string =>
  joinNonEmpty([place, new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })], ', ')
