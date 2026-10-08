import { useRef, useState } from 'react'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { COUNTRIES, countryById } from '../model/countries'
import { newSection, uid } from '../model/factory'
import { SECTORS, sectorById } from '../model/sectors'
import type { Cv, SectionKind } from '../model/types'
import { useStore } from '../store'
import { themeById } from '../templates/themes'
import { Check, SelectField, TextField } from './fields'
import { Close, Plus, Trash } from './icons'
import { SectionCard, StandardTitles } from './SectionEditor'
import { TemplateGrid } from './TemplateGrid'

const ACCENTS = ['#1f4e79', '#0f5f5c', '#273b5b', '#3d5a40', '#5a1e1e', '#7a4b12', '#b04a2f', '#2f2f2f']

const ADDABLE: { kind: SectionKind; title: string }[] = [
  { kind: 'entries', title: 'Experience' },
  { kind: 'entries', title: 'Education' },
  { kind: 'skills', title: 'Skills' },
  { kind: 'languages', title: 'Languages' },
  { kind: 'list', title: 'Certifications' },
  { kind: 'entries', title: 'Projects' },
  { kind: 'entries', title: 'Volunteering' },
  { kind: 'list', title: 'Publications' },
  { kind: 'list', title: 'Awards' },
  { kind: 'list', title: 'Interests' },
  { kind: 'references', title: 'References' },
  { kind: 'summary', title: 'Profile' },
  { kind: 'list', title: 'Custom list' },
  { kind: 'entries', title: 'Custom timeline' },
]

/** Downscales a photo to a 360×450 centred crop, so drafts stay small in browser storage. */
async function loadPhoto(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    const W = 360
    const H = 450
    const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight)
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const g = c.getContext('2d')!
    const w = img.naturalWidth * scale
    const h = img.naturalHeight * scale
    g.drawImage(img, (W - w) / 2, (H - h) / 2, w, h)
    return c.toDataURL('image/jpeg', 0.86)
  } finally {
    URL.revokeObjectURL(url)
  }
}

function SetupCard({ cv }: { cv: Cv }) {
  const update = useStore((s) => s.update)
  const setCountry = useStore((s) => s.setCountry)
  const [picking, setPicking] = useState(false)
  const theme = themeById(cv.settings.templateId)
  const country = countryById(cv.settings.countryId)
  const sector = sectorById(cv.settings.sectorId)
  const set = (p: Partial<Cv['settings']>) => update((c) => ({ ...c, settings: { ...c.settings, ...p } }))

  return (
    <section className="card">
      <div className="card-head">
        <h2>Format</h2>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="field" style={{ flex: 1 }}>
            <span>Template</span>
            <button className="btn" style={{ justifyContent: 'space-between' }} onClick={() => setPicking(true)}>
              {theme.name}
              <span className="muted" style={{ fontWeight: 400 }}>
                Change
              </span>
            </button>
          </div>
          <SelectField className="" label="Page size" value={cv.settings.pageSize} onChange={(v) => set({ pageSize: v as 'A4' | 'LETTER' })}>
            <option value="A4">A4</option>
            <option value="LETTER">US Letter</option>
          </SelectField>
        </div>
        {!theme.ats ? <p className="warn">Two-column layouts can be misread by some applicant tracking systems. Use this one for portfolios and direct applications.</p> : null}
        <div className="grid-2">
          <SelectField label="Country conventions" value={cv.settings.countryId} onChange={setCountry}>
            {COUNTRIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </SelectField>
          <SelectField label="Sector" value={cv.settings.sectorId} onChange={(v) => set({ sectorId: v })}>
            {SECTORS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </SelectField>
        </div>
        <p className="tip">
          <strong>{country.label}:</strong> {country.docLabel}, {country.length}. {country.notes.join(' ')}
        </p>
        <div className="field">
          <span>Accent colour</span>
          <div className="swatches">
            <button className="btn small" aria-pressed={!cv.settings.accent} onClick={() => set({ accent: '' })} style={!cv.settings.accent ? { borderColor: 'var(--ink)' } : undefined}>
              Template default
            </button>
            {ACCENTS.map((a) => (
              <button key={a} className="swatch" style={{ background: a }} aria-label={`Accent ${a}`} aria-pressed={cv.settings.accent === a} onClick={() => set({ accent: a })} />
            ))}
          </div>
        </div>
        <div className="row" style={{ flexWrap: 'wrap', gap: '8px 16px' }}>
          <Check label="Show photo" checked={cv.settings.showPhoto} onChange={(v) => set({ showPhoto: v })} />
          <Check label="Show personal details" checked={cv.settings.showPersonal} onChange={(v) => set({ showPersonal: v })} />
        </div>
        {(cv.settings.showPhoto && country.photo === 'never') || (cv.settings.showPersonal && country.personal === 'never') ? (
          <p className="warn">Employers in {country.label} expect no photo or personal details. Recruiters may set the CV aside for including them.</p>
        ) : null}
        <div className="grid-2">
          <SelectField label="Closing" value={cv.settings.closing} onChange={(v) => set({ closing: v as Cv['settings']['closing'] })}>
            <option value="none">None</option>
            <option value="signature">Place, date and signature</option>
            <option value="declaration">Declaration</option>
          </SelectField>
          {cv.settings.closing !== 'none' ? <TextField label="Place" value={cv.settings.closingPlace} onChange={(v) => set({ closingPlace: v })} placeholder="Berlin" /> : null}
        </div>
      </div>
      {picking ? (
        <div className="backdrop" onClick={() => setPicking(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label="Choose a template" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Choose a template</h2>
              <span className="spacer" />
              <button className="icon-btn" aria-label="Close" onClick={() => setPicking(false)}>
                <Close />
              </button>
            </div>
            <div className="modal-body">
              <TemplateGrid
                value={cv.settings.templateId}
                recommended={sector.template}
                onPick={(id) => {
                  set({ templateId: id })
                  setPicking(false)
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function BasicsCard({ cv }: { cv: Cv }) {
  const update = useStore((s) => s.update)
  const fileRef = useRef<HTMLInputElement>(null)
  const b = cv.basics
  const sector = sectorById(cv.settings.sectorId)
  const set = (p: Partial<Cv['basics']>) => update((c) => ({ ...c, basics: { ...c.basics, ...p } }))
  const setPersonal = (p: Partial<Cv['basics']['personal']>) => set({ personal: { ...b.personal, ...p } })

  return (
    <section className="card">
      <div className="card-head">
        <h2>Personal details</h2>
      </div>
      <div className="card-body">
        <div className="grid-2">
          <TextField label="Full name" value={b.name} onChange={(v) => set({ name: v })} autoComplete="name" />
          <TextField label="Headline" value={b.headline} onChange={(v) => set({ headline: v })} placeholder={sector.headlineHint} />
          <TextField label="Email" type="email" value={b.email} onChange={(v) => set({ email: v })} autoComplete="email" />
          <TextField label="Phone" type="tel" value={b.phone} onChange={(v) => set({ phone: v })} placeholder="+44 7700 900123" autoComplete="tel" hint="International format: + country code" />
          <TextField className="span-2" label="Location" value={b.location} onChange={(v) => set({ location: v })} placeholder="City, Country" hint="City and country are enough. Leave out your street address." />
        </div>

        <div className="field">
          <span>Links</span>
          {b.links.map((l) => (
            <div key={l.id} className="row">
              <input className="input" style={{ flex: 2 }} aria-label="Link URL" value={l.url} placeholder="linkedin.com/in/yourname" onChange={(e) => set({ links: b.links.map((x) => (x.id === l.id ? { ...x, url: e.target.value } : x)) })} />
              <button className="icon-btn danger" aria-label="Remove link" onClick={() => set({ links: b.links.filter((x) => x.id !== l.id) })}>
                <Trash />
              </button>
            </div>
          ))}
          <div className="add-row">
            <button className="btn small" onClick={() => set({ links: [...b.links, { id: uid(), label: '', url: '' }] })}>
              <Plus /> Add link
            </button>
          </div>
        </div>

        {cv.settings.showPhoto ? (
          <div className="field">
            <span>Photo</span>
            <div className="photo-field">
              {b.photo ? <img src={b.photo} alt="" /> : <span className="photo-empty" />}
              <button className="btn small" onClick={() => fileRef.current?.click()}>
                {b.photo ? 'Replace' : 'Upload'}
              </button>
              {b.photo ? (
                <button className="btn small ghost" onClick={() => set({ photo: '' })}>
                  Remove
                </button>
              ) : null}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  e.target.value = ''
                  if (f) set({ photo: await loadPhoto(f) })
                }}
              />
            </div>
            <small>Use a plain background, head and shoulders, looking at the camera.</small>
          </div>
        ) : null}

        {cv.settings.showPersonal ? (
          <div className="grid-2">
            <TextField label="Date of birth" value={b.personal.dateOfBirth} onChange={(v) => setPersonal({ dateOfBirth: v })} placeholder="14/03/1992" />
            <TextField label="Nationality" value={b.personal.nationality} onChange={(v) => setPersonal({ nationality: v })} />
            <TextField label="Driving licence" value={b.personal.drivingLicence} onChange={(v) => setPersonal({ drivingLicence: v })} placeholder="Category B" />
            <TextField label="Work rights / visa" value={b.personal.workRights} onChange={(v) => setPersonal({ workRights: v })} placeholder="Residence visa (transferable)" />
          </div>
        ) : (
          <TextField label="Work rights" value={b.personal.workRights} onChange={(v) => setPersonal({ workRights: v })} placeholder="Australian citizen" hint="Optional. Shown even when personal details are off." />
        )}
      </div>
    </section>
  )
}

export function Editor({ cv }: { cv: Cv }) {
  const update = useStore((s) => s.update)
  const [adding, setAdding] = useState(false)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const sector = sectorById(cv.settings.sectorId)

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return
    update((c) => {
      const from = c.sections.findIndex((s) => s.id === e.active.id)
      const to = c.sections.findIndex((s) => s.id === e.over!.id)
      return { ...c, sections: arrayMove(c.sections, from, to) }
    })
  }

  return (
    <div className="editor-inner">
      <SetupCard cv={cv} />
      <BasicsCard cv={cv} />
      <StandardTitles />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis]}>
        <SortableContext items={cv.sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {cv.sections.map((s) => (
            <SectionCard
              key={s.id}
              section={s}
              sectorId={cv.settings.sectorId}
              onRemove={() => {
                if (window.confirm(`Delete the “${s.title}” section and everything in it?`)) update((c) => ({ ...c, sections: c.sections.filter((x) => x.id !== s.id) }))
              }}
            />
          ))}
        </SortableContext>
      </DndContext>
      <div className="card">
        <div className="card-head">
          <h2 style={{ flex: 1 }}>Add a section</h2>
          <button className="btn small" onClick={() => setAdding(!adding)}>
            {adding ? 'Done' : <><Plus /> Add</>}
          </button>
        </div>
        {adding ? (
          <div className="card-body">
            <div className="add-row">
              {[...sector.sections.filter((b) => !cv.sections.some((s) => s.title.toLowerCase() === b.title.toLowerCase())), ...ADDABLE]
                .filter((a, i, arr) => arr.findIndex((x) => x.title === a.title) === i)
                .map((a) => (
                  <button key={a.title} className="btn small" onClick={() => update((c) => ({ ...c, sections: [...c.sections, newSection(a.kind, a.title)] }))}>
                    {a.title}
                  </button>
                ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
