import type { Cv, Entry, Language, ListItem, Reference, Section, SectionKind, SkillGroup } from './types'
import { countryById } from './countries'
import { sectorById } from './sectors'

export const uid = (): string => Math.random().toString(36).slice(2, 10)

export const newEntry = (): Entry => ({ id: uid(), title: '', org: '', location: '', start: '', end: '', current: false, note: '', bullets: [''] })
export const newSkill = (): SkillGroup => ({ id: uid(), name: '', keywords: '' })
export const newListItem = (): ListItem => ({ id: uid(), title: '', issuer: '', date: '', detail: '' })
export const newReference = (): Reference => ({ id: uid(), name: '', role: '', org: '', email: '', phone: '' })
export const newLanguage = (): Language => ({
  id: uid(),
  language: '',
  fluency: '',
  native: false,
  cefr: { listening: '', reading: '', interaction: '', production: '', writing: '' },
})

export function newSection(kind: SectionKind, title: string): Section {
  const base = { id: uid(), title, hidden: false }
  switch (kind) {
    case 'summary':
      return { ...base, kind, text: '' }
    case 'entries':
      return { ...base, kind, items: [newEntry()] }
    case 'skills':
      return { ...base, kind, items: [newSkill()] }
    case 'languages':
      return { ...base, kind, items: [newLanguage()], useCefr: false }
    case 'list':
      return { ...base, kind, items: [newListItem()] }
    case 'references':
      return { ...base, kind, items: [], onRequest: true }
  }
}

export function createCv(opts: { sectorId: string; countryId: string; templateId?: string; name?: string }): Cv {
  const sector = sectorById(opts.sectorId)
  const country = countryById(opts.countryId)
  const now = Date.now()
  const sections = sector.sections.map((b) => {
    const s = newSection(b.kind, b.title)
    if (s.kind === 'languages') s.useCefr = country.id === 'eu'
    if (s.kind === 'references') s.onRequest = !country.referees
    return s
  })
  if (country.referees && !sections.some((s) => s.kind === 'references')) {
    sections.push({ ...newSection('references', 'References'), onRequest: false } as Section)
  }
  return {
    id: uid(),
    name: opts.name ?? `${sector.label.split(' /')[0]} CV`,
    createdAt: now,
    updatedAt: now,
    basics: {
      name: '',
      headline: '',
      email: '',
      phone: '',
      location: '',
      links: [],
      photo: '',
      personal: { dateOfBirth: '', nationality: '', workRights: '', drivingLicence: '' },
    },
    sections,
    settings: {
      templateId: opts.templateId ?? sector.template,
      countryId: country.id,
      sectorId: sector.id,
      accent: '',
      pageSize: country.pageSize,
      showPhoto: country.photo === 'common',
      showPersonal: country.personal === 'common',
      closing: country.closing,
      closingPlace: '',
    },
  }
}

/** Applies a country's conventions to an existing CV without touching its content. */
export function applyCountry(cv: Cv, countryId: string): Cv {
  const c = countryById(countryId)
  return {
    ...cv,
    settings: {
      ...cv.settings,
      countryId: c.id,
      pageSize: c.pageSize,
      showPhoto: c.photo === 'never' ? false : c.photo === 'common' ? true : cv.settings.showPhoto,
      showPersonal: c.personal === 'never' ? false : c.personal === 'common' ? true : cv.settings.showPersonal,
      closing: c.closing,
    },
  }
}
