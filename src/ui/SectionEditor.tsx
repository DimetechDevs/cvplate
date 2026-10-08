import { useState, type ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { newEntry, newLanguage, newListItem, newReference, newSkill } from '../model/factory'
import { formatRange, joinNonEmpty } from '../model/format'
import { blueprintFor, sectorById, STANDARD_TITLES } from '../model/sectors'
import type { CefrLevel, Entry, Section } from '../model/types'
import { CEFR_COLUMNS } from '../render/prepare'
import { useStore } from '../store'
import { Check, MonthField, SelectField, TextArea, TextField } from './fields'
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Eye, EyeOff, Grip, Plus, Trash } from './icons'

const KIND_LABEL: Record<Section['kind'], string> = {
  summary: 'text',
  entries: 'timeline',
  skills: 'skills',
  languages: 'languages',
  list: 'list',
  references: 'referees',
}

/** List operations for the items inside a section. */
function itemOps<T extends { id: string }>(items: T[], set: (items: T[]) => void) {
  return {
    patch: (id: string, p: Partial<T>) => set(items.map((i) => (i.id === id ? { ...i, ...p } : i))),
    remove: (id: string) => set(items.filter((i) => i.id !== id)),
    move: (id: string, d: -1 | 1) => {
      const i = items.findIndex((x) => x.id === id)
      const j = i + d
      if (i < 0 || j < 0 || j >= items.length) return
      const next = items.slice()
      ;[next[i], next[j]] = [next[j], next[i]]
      set(next)
    },
  }
}

function ItemShell({ label, sub, open, onToggle, onUp, onDown, onRemove, children }: {
  label: string
  sub?: string
  open: boolean
  onToggle: () => void
  onUp: () => void
  onDown: () => void
  onRemove: () => void
  children: ReactNode
}) {
  return (
    <div className="item">
      <div className="item-head" onClick={onToggle}>
        <span className="icon-btn" aria-hidden>
          {open ? <ChevronDown /> : <ChevronRight />}
        </span>
        <span className="label">
          {label || <span className="muted">Untitled</span>}
          {sub ? <span className="muted">{`  ·  ${sub}`}</span> : null}
        </span>
        <span className="row" style={{ gap: 0 }} onClick={(e) => e.stopPropagation()}>
          <button className="icon-btn" title="Move up" aria-label="Move up" onClick={onUp}>
            <ArrowUp />
          </button>
          <button className="icon-btn" title="Move down" aria-label="Move down" onClick={onDown}>
            <ArrowDown />
          </button>
          <button className="icon-btn danger" title="Remove" aria-label="Remove" onClick={onRemove}>
            <Trash />
          </button>
        </span>
      </div>
      {open ? <div className="item-body">{children}</div> : null}
    </div>
  )
}

function EntryFields({ e, patch, kindTitle, examples }: { e: Entry; patch: (p: Partial<Entry>) => void; kindTitle: string; examples?: string[] }) {
  const isEdu = /educat|qualif/i.test(kindTitle)
  const isProject = /project|audit|research/i.test(kindTitle)
  return (
    <>
      <div className="grid-2">
        <TextField label={isEdu ? 'Qualification' : isProject ? 'Project' : 'Job title'} value={e.title} onChange={(v) => patch({ title: v })} />
        <TextField label={isEdu ? 'Institution' : isProject ? 'Organisation or link' : 'Employer'} value={e.org} onChange={(v) => patch({ org: v })} />
        <TextField label="Location" value={e.location} onChange={(v) => patch({ location: v })} placeholder="City, Country" />
        <TextField label={isEdu ? 'Grade or honours' : 'Note'} value={e.note} onChange={(v) => patch({ note: v })} placeholder={isEdu ? 'First Class Honours' : 'Optional one-line remit'} />
        <MonthField label="Start" value={e.start} onChange={(v) => patch({ start: v })} />
        <div className="field">
          <MonthField label="End" value={e.current ? '' : e.end} disabled={e.current} onChange={(v) => patch({ end: v })} />
        </div>
      </div>
      <Check label={isEdu ? 'Still studying here' : 'I currently work here'} checked={e.current} onChange={(v) => patch({ current: v })} />
      <TextArea
        label={isEdu ? 'Details' : 'Achievements'}
        hint="One per line. Each line becomes a bullet."
        value={e.bullets.join('\n')}
        onChange={(v) => patch({ bullets: v.split('\n') })}
        placeholder={isEdu ? 'Dissertation: …' : 'Start with a verb, end with a result.'}
        rows={3}
      />
      {examples?.length ? (
        <details className="examples">
          <summary>Example bullets for this sector</summary>
          <ul>
            {examples.map((x) => (
              <li key={x}>
                <span>{x}</span>
                <button className="btn small" onClick={() => patch({ bullets: [...e.bullets.filter((b) => b.trim()), x] })}>
                  Add
                </button>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </>
  )
}

function Body({ section, sectorId }: { section: Section; sectorId: string }) {
  const updateSection = useStore((s) => s.updateSection)
  const dateStyle = 'short' as const
  const [openId, setOpenId] = useState<string | null>(null)
  const set = (fn: (s: Section) => Section) => updateSection(section.id, fn)
  const bp = blueprintFor(sectorId, section.title)

  switch (section.kind) {
    case 'summary':
      return (
        <TextArea
          label="Text"
          hint="Two to four lines. Write in the first person without “I”."
          value={section.text}
          onChange={(v) => set((s) => ({ ...s, text: v }) as Section)}
          placeholder={sectorById(sectorId).summaryExample}
          rows={4}
        />
      )

    case 'entries': {
      const ops = itemOps(section.items, (items) => set((s) => ({ ...s, items }) as Section))
      return (
        <>
          {section.items.map((e) => (
            <ItemShell
              key={e.id}
              label={e.title || e.org}
              sub={joinNonEmpty([e.title ? e.org : '', formatRange(e, dateStyle)], ', ')}
              open={openId === e.id}
              onToggle={() => setOpenId(openId === e.id ? null : e.id)}
              onUp={() => ops.move(e.id, -1)}
              onDown={() => ops.move(e.id, 1)}
              onRemove={() => ops.remove(e.id)}
            >
              <EntryFields e={e} patch={(p) => ops.patch(e.id, p)} kindTitle={section.title} examples={bp?.examples} />
            </ItemShell>
          ))}
          <div className="add-row">
            <button
              className="btn small"
              onClick={() => {
                const e = newEntry()
                set((s) => ({ ...s, items: [e, ...(s as typeof section).items] }) as Section)
                setOpenId(e.id)
              }}
            >
              <Plus /> Add entry
            </button>
          </div>
        </>
      )
    }

    case 'skills': {
      const ops = itemOps(section.items, (items) => set((s) => ({ ...s, items }) as Section))
      return (
        <>
          {section.items.map((g) => (
            <div key={g.id} className="row" style={{ alignItems: 'flex-end' }}>
              <TextField className="" label="Group" value={g.name} onChange={(v) => ops.patch(g.id, { name: v })} placeholder="e.g. Languages" />
              <div style={{ flex: 2, minWidth: 0 }}>
                <TextField label="Skills, comma separated" value={g.keywords} onChange={(v) => ops.patch(g.id, { keywords: v })} />
              </div>
              <button className="icon-btn danger" style={{ marginBottom: 3 }} aria-label="Remove group" onClick={() => ops.remove(g.id)}>
                <Trash />
              </button>
            </div>
          ))}
          <div className="add-row">
            <button className="btn small" onClick={() => set((s) => ({ ...s, items: [...(s as typeof section).items, newSkill()] }) as Section)}>
              <Plus /> Add group
            </button>
          </div>
        </>
      )
    }

    case 'languages': {
      const ops = itemOps(section.items, (items) => set((s) => ({ ...s, items }) as Section))
      const levels: CefrLevel[] = ['', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
      return (
        <>
          <Check label="Use the CEFR self-assessment grid (Europass)" checked={section.useCefr} onChange={(v) => set((s) => ({ ...s, useCefr: v }) as Section)} />
          {section.items.map((l) => (
            <div key={l.id} className="item" style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="row" style={{ alignItems: 'flex-end' }}>
                <TextField label="Language" value={l.language} onChange={(v) => ops.patch(l.id, { language: v })} />
                {!section.useCefr || l.native ? (
                  <TextField label="Level" value={l.native ? 'Native' : l.fluency} onChange={(v) => ops.patch(l.id, { fluency: v })} placeholder="Fluent, Professional…" />
                ) : null}
                <button className="icon-btn danger" style={{ marginBottom: 3 }} aria-label="Remove language" onClick={() => ops.remove(l.id)}>
                  <Trash />
                </button>
              </div>
              <Check label="Native / mother tongue" checked={l.native} onChange={(v) => ops.patch(l.id, { native: v })} />
              {section.useCefr && !l.native ? (
                <div className="grid-3" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                  {CEFR_COLUMNS.map(([k, label]) => (
                    <SelectField key={k} label={label.replace('Spoken ', '')} value={l.cefr[k]} onChange={(v) => ops.patch(l.id, { cefr: { ...l.cefr, [k]: v as CefrLevel } })}>
                      {levels.map((x) => (
                        <option key={x} value={x}>
                          {x || '–'}
                        </option>
                      ))}
                    </SelectField>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          <div className="add-row">
            <button className="btn small" onClick={() => set((s) => ({ ...s, items: [...(s as typeof section).items, newLanguage()] }) as Section)}>
              <Plus /> Add language
            </button>
          </div>
        </>
      )
    }

    case 'list': {
      const ops = itemOps(section.items, (items) => set((s) => ({ ...s, items }) as Section))
      return (
        <>
          {section.items.map((i) => (
            <ItemShell
              key={i.id}
              label={i.title}
              sub={i.issuer}
              open={openId === i.id}
              onToggle={() => setOpenId(openId === i.id ? null : i.id)}
              onUp={() => ops.move(i.id, -1)}
              onDown={() => ops.move(i.id, 1)}
              onRemove={() => ops.remove(i.id)}
            >
              <div className="grid-2">
                <TextField className="span-2" label="Title" value={i.title} onChange={(v) => ops.patch(i.id, { title: v })} />
                <TextField label="Issuer, publisher or body" value={i.issuer} onChange={(v) => ops.patch(i.id, { issuer: v })} />
                <MonthField label="Date" value={i.date} onChange={(v) => ops.patch(i.id, { date: v })} />
                <TextField className="span-2" label="Detail" value={i.detail} onChange={(v) => ops.patch(i.id, { detail: v })} placeholder="Licence number, expiry, DOI…" />
              </div>
            </ItemShell>
          ))}
          <div className="add-row">
            <button
              className="btn small"
              onClick={() => {
                const i = newListItem()
                set((s) => ({ ...s, items: [...(s as typeof section).items, i] }) as Section)
                setOpenId(i.id)
              }}
            >
              <Plus /> Add item
            </button>
          </div>
        </>
      )
    }

    case 'references': {
      const ops = itemOps(section.items, (items) => set((s) => ({ ...s, items }) as Section))
      return (
        <>
          <Check label="Show “Available on request” instead of names" checked={section.onRequest} onChange={(v) => set((s) => ({ ...s, onRequest: v }) as Section)} />
          {!section.onRequest ? (
            <>
              {section.items.map((r) => (
                <ItemShell
                  key={r.id}
                  label={r.name}
                  sub={r.org}
                  open={openId === r.id}
                  onToggle={() => setOpenId(openId === r.id ? null : r.id)}
                  onUp={() => ops.move(r.id, -1)}
                  onDown={() => ops.move(r.id, 1)}
                  onRemove={() => ops.remove(r.id)}
                >
                  <div className="grid-2">
                    <TextField label="Name" value={r.name} onChange={(v) => ops.patch(r.id, { name: v })} />
                    <TextField label="Role" value={r.role} onChange={(v) => ops.patch(r.id, { role: v })} />
                    <TextField className="span-2" label="Organisation" value={r.org} onChange={(v) => ops.patch(r.id, { org: v })} />
                    <TextField label="Email" type="email" value={r.email} onChange={(v) => ops.patch(r.id, { email: v })} />
                    <TextField label="Phone" type="tel" value={r.phone} onChange={(v) => ops.patch(r.id, { phone: v })} />
                  </div>
                </ItemShell>
              ))}
              <div className="add-row">
                <button
                  className="btn small"
                  onClick={() => {
                    const r = newReference()
                    set((s) => ({ ...s, items: [...(s as typeof section).items, r] }) as Section)
                    setOpenId(r.id)
                  }}
                >
                  <Plus /> Add referee
                </button>
              </div>
            </>
          ) : null}
        </>
      )
    }
  }
}

export function SectionCard({ section, sectorId, onRemove }: { section: Section; sectorId: string; onRemove: () => void }) {
  const updateSection = useStore((s) => s.updateSection)
  const [open, setOpen] = useState(true)
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })
  const bp = blueprintFor(sectorId, section.title)
  return (
    <section
      ref={setNodeRef}
      className={`card${isDragging ? ' dragging' : ''}${section.hidden ? ' is-hidden' : ''}`}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      <div className="card-head">
        <button ref={setActivatorNodeRef} className="icon-btn handle" aria-label={`Reorder ${section.title}`} {...attributes} {...listeners}>
          <Grip />
        </button>
        <input
          className="section-title"
          value={section.title}
          list="standard-titles"
          aria-label="Section title"
          onChange={(e) => updateSection(section.id, (s) => ({ ...s, title: e.target.value }))}
        />
        <span className="kind-tag hide-sm">{KIND_LABEL[section.kind]}</span>
        <button
          className="icon-btn"
          title={section.hidden ? 'Show on CV' : 'Hide from CV'}
          aria-label={section.hidden ? 'Show on CV' : 'Hide from CV'}
          onClick={() => updateSection(section.id, (s) => ({ ...s, hidden: !s.hidden }))}
        >
          {section.hidden ? <EyeOff /> : <Eye />}
        </button>
        <button className="icon-btn danger" title="Delete section" aria-label="Delete section" onClick={onRemove}>
          <Trash />
        </button>
        <button className="icon-btn" aria-label={open ? 'Collapse' : 'Expand'} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <ChevronDown /> : <ChevronRight />}
        </button>
      </div>
      {open ? (
        <div className="card-body">
          {bp?.tip ? <p className="tip">{bp.tip}</p> : null}
          <Body section={section} sectorId={sectorId} />
        </div>
      ) : null}
    </section>
  )
}

export function StandardTitles() {
  return (
    <datalist id="standard-titles">
      {STANDARD_TITLES.map((t) => (
        <option key={t} value={t} />
      ))}
    </datalist>
  )
}
