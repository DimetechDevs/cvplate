import { useEffect, useRef, useState } from 'react'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { countryById } from '../model/countries'
import type { Cv } from '../model/types'
import { renderPdf } from '../export'
import { themeById } from '../templates/themes'

GlobalWorkerOptions.workerSrc = workerSrc

const MAX_W = 820

/**
 * Renders the exact PDF the user will download, page by page, onto canvases.
 * New renders are drawn off-screen and swapped in, so typing never flashes a blank page.
 */
export function Preview({ cv }: { cv: Cv }) {
  const stackRef = useRef<HTMLDivElement>(null)
  const paneRef = useRef<HTMLDivElement>(null)
  const gen = useRef(0)
  const [pages, setPages] = useState(0)
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = paneRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!width) return
    const id = ++gen.current
    setBusy(true)
    const timer = setTimeout(async () => {
      try {
        const blob = await renderPdf(cv)
        if (id !== gen.current) return
        const task = getDocument({ data: new Uint8Array(await blob.arrayBuffer()) })
        const doc = await task.promise
        const target = Math.min(MAX_W, width - (width < 600 ? 24 : 48))
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5)
        const canvases: HTMLCanvasElement[] = []
        for (let n = 1; n <= doc.numPages; n++) {
          const page = await doc.getPage(n)
          const base = page.getViewport({ scale: 1 })
          const scale = target / base.width
          const vp = page.getViewport({ scale: scale * dpr })
          const c = document.createElement('canvas')
          c.width = Math.floor(vp.width)
          c.height = Math.floor(vp.height)
          c.style.width = `${Math.floor(base.width * scale)}px`
          c.style.height = `${Math.floor(base.height * scale)}px`
          c.setAttribute('role', 'img')
          c.setAttribute('aria-label', `Page ${n} of ${doc.numPages}`)
          await page.render({ canvasContext: c.getContext('2d')!, viewport: vp }).promise
          canvases.push(c)
        }
        void task.destroy()
        if (id !== gen.current || !stackRef.current) return
        stackRef.current.replaceChildren(...canvases)
        setPages(doc.numPages)
        setError(null)
      } catch (e) {
        if (id === gen.current) setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (id === gen.current) setBusy(false)
      }
    }, 320)
    return () => clearTimeout(timer)
  }, [cv, width])

  const country = countryById(cv.settings.countryId)
  const theme = themeById(cv.settings.templateId)
  const longFor =
    (country.id === 'us' || country.id === 'ca') && pages > 2
      ? `${country.docLabel}s in ${country.label} are usually 1–2 pages; yours is ${pages}.`
      : pages > 3 && theme.id !== 'scholar'
        ? `Most recruiters expect 2 pages or fewer; yours is ${pages}.`
        : null

  return (
    <div className="preview-pane" ref={paneRef}>
      <div className="preview-meta">
        <span>
          {theme.name} · {cv.settings.pageSize === 'A4' ? 'A4' : 'US Letter'} · {pages || '–'} {pages === 1 ? 'page' : 'pages'}
        </span>
        {longFor ? <span style={{ color: 'var(--warn-ink)' }}>{longFor}</span> : null}
        <span className="spacer" />
        <span className="mono" aria-live="polite">
          {busy ? 'Rendering…' : 'Up to date'}
        </span>
      </div>
      {error ? <p className="preview-error">The preview could not be drawn: {error}</p> : null}
      <div className="preview-stack" ref={stackRef} />
    </div>
  )
}
