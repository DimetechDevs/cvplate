import { useRef, useState } from 'react'
import { COUNTRIES, countryById } from '../model/countries'
import { SECTORS, sectorById } from '../model/sectors'
import { readBackup } from '../backup'
import { useStore } from '../store'
import { themeById } from '../templates/themes'
import { SelectField } from './fields'
import { Copy, Trash } from './icons'
import { TemplateGrid } from './TemplateGrid'

const ago = (t: number) => {
  const m = Math.round((Date.now() - t) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} h ago`
  return new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function Home({ notify }: { notify: (msg: string) => void }) {
  const { drafts, create, open, duplicate, remove, loadExample, importCv } = useStore()
  const [sectorId, setSectorId] = useState('general')
  const [countryId, setCountryId] = useState('intl')
  const [templateId, setTemplateId] = useState(sectorById('general').template)
  const fileRef = useRef<HTMLInputElement>(null)
  const list = Object.values(drafts).sort((a, b) => b.updatedAt - a.updatedAt)
  const country = countryById(countryId)

  return (
    <div className="home">
      <div className="home-inner">
        <h1>Build a CV that reads well to people and to applicant tracking systems.</h1>
        <p className="lede">
          Pick your sector and the country you are applying in. The template, section order and conventions are set for you, and you can change any of them.
          Everything stays in this browser until you download it.
        </p>

        <div className="home-grid">
          <section className="card">
            <div className="new-cv">
              <div className="grid-2">
                <SelectField
                  label="Sector"
                  value={sectorId}
                  onChange={(v) => {
                    setSectorId(v)
                    setTemplateId(sectorById(v).template)
                  }}
                >
                  {SECTORS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </SelectField>
                <SelectField label="Applying in" value={countryId} onChange={setCountryId}>
                  {COUNTRIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </SelectField>
              </div>
              <ul className="country-notes">
                <li>
                  {country.docLabel}, {country.pageSize === 'A4' ? 'A4' : 'US Letter'}, {country.length}.
                </li>
                {country.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <div>
                <p className="panel-title">Template</p>
                <TemplateGrid value={templateId} recommended={sectorById(sectorId).template} onPick={setTemplateId} />
              </div>
              <div className="row">
                <button className="btn primary" onClick={() => create({ sectorId, countryId, templateId })}>
                  Create CV with {themeById(templateId).name}
                </button>
                <button className="btn ghost" onClick={loadExample}>
                  Open an example
                </button>
              </div>
            </div>
          </section>

          <aside>
            <p className="panel-title">Your drafts</p>
            <div className="card drafts">
              {list.length ? (
                list.map((cv) => (
                  <div key={cv.id} className="draft-row">
                    <button className="open" onClick={() => open(cv.id)}>
                      <span className="title">{cv.name || 'Untitled CV'}</span>
                      <span className="meta">
                        {themeById(cv.settings.templateId).name} · edited {ago(cv.updatedAt)}
                      </span>
                    </button>
                    <button className="icon-btn" title="Duplicate" aria-label="Duplicate" onClick={() => duplicate(cv.id)}>
                      <Copy />
                    </button>
                    <button
                      className="icon-btn danger"
                      title="Delete"
                      aria-label="Delete"
                      onClick={() => {
                        if (window.confirm(`Delete “${cv.name || 'Untitled CV'}”? This cannot be undone.`)) remove(cv.id)
                      }}
                    >
                      <Trash />
                    </button>
                  </div>
                ))
              ) : (
                <p className="muted" style={{ padding: 12, fontSize: 13 }}>
                  No drafts yet. Drafts save automatically as you type.
                </p>
              )}
            </div>
            <div className="row" style={{ marginTop: 8 }}>
              <button className="btn small ghost" onClick={() => fileRef.current?.click()}>
                Restore from backup…
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  e.target.value = ''
                  if (!f) return
                  try {
                    importCv(await readBackup(f))
                    notify('Backup restored.')
                  } catch (err) {
                    notify((err as Error).message)
                  }
                }}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
