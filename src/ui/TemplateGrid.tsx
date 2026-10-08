import { THEMES } from '../templates/themes'

export function TemplateGrid({ value, recommended, onPick }: { value: string; recommended?: string; onPick: (id: string) => void }) {
  return (
    <div className="template-grid">
      {THEMES.map((t) => (
        <button key={t.id} className="template-card" aria-pressed={value === t.id} onClick={() => onPick(t.id)}>
          <span className="thumb" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}thumbs/${t.id}.png)` }} />
          <span className="name">
            {t.name}
            {recommended === t.id ? <span className="badge rec">recommended</span> : null}
            {!t.ats ? <span className="badge" title="Two-column layouts can confuse some applicant tracking systems">not ATS</span> : null}
          </span>
          <span className="blurb">{t.blurb}</span>
        </button>
      ))}
    </div>
  )
}
