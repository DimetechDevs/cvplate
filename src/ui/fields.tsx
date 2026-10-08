import { useLayoutEffect, useRef, type ReactNode } from 'react'

interface Base {
  label: string
  hint?: string
  className?: string
}

export function TextField({ label, hint, className, value, onChange, placeholder, type = 'text', autoComplete, list }: Base & {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  autoComplete?: string
  list?: string
}) {
  return (
    <label className={`field ${className ?? ''}`}>
      <span>{label}</span>
      <input className="input" type={type} value={value} placeholder={placeholder} autoComplete={autoComplete ?? 'off'} list={list} onChange={(e) => onChange(e.target.value)} />
      {hint ? <small>{hint}</small> : null}
    </label>
  )
}

/** Textarea that grows with its content, so long bullet lists never scroll inside a box. */
export function TextArea({ label, hint, className, value, onChange, placeholder, rows = 3 }: Base & {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight + 2}px`
  }, [value])
  return (
    <label className={`field ${className ?? ''}`}>
      <span>{label}</span>
      <textarea ref={ref} className="textarea" rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      {hint ? <small>{hint}</small> : null}
    </label>
  )
}

export function SelectField({ label, hint, className, value, onChange, children }: Base & { value: string; onChange: (v: string) => void; children: ReactNode }) {
  return (
    <label className={`field ${className ?? ''}`}>
      <span>{label}</span>
      <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
      {hint ? <small>{hint}</small> : null}
    </label>
  )
}

/** Month picker storing "YYYY-MM". Falls back to a plain text input where `type=month` is unsupported. */
export function MonthField({ label, value, onChange, disabled }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input className="input" type="month" value={value} placeholder="YYYY-MM" disabled={disabled} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}
