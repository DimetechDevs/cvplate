import type { DateStyle } from './countries'
import type { Entry, YearMonth } from './types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatYm(ym: YearMonth, style: DateStyle): string {
  if (!ym) return ''
  const [y, m] = ym.split('-')
  if (!m) return y
  const mi = Number(m) - 1
  if (style === 'numeric') return `${m}/${y}`
  return `${MONTHS[mi] ?? ''} ${y}`.trim()
}

/** "Mar 2022 – Present", using an en-dash with thin spacing as typeset CVs do. */
export function formatRange(e: Pick<Entry, 'start' | 'end' | 'current'>, style: DateStyle): string {
  const a = formatYm(e.start, style)
  const b = e.current ? 'Present' : formatYm(e.end, style)
  if (a && b) return a === b ? a : `${a} – ${b}`
  return a || b
}

export const joinNonEmpty = (parts: (string | undefined | false)[], sep: string): string =>
  parts.filter((p): p is string => !!p && !!p.trim()).join(sep)

/** Strips the scheme and trailing slash so links read cleanly on paper. */
export const displayUrl = (url: string): string => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

export const hrefFor = (url: string): string => (/^(https?:|mailto:|tel:)/.test(url) ? url : `https://${url}`)

export const cleanBullets = (bullets: string[]): string[] => bullets.map((b) => b.trim()).filter(Boolean)
