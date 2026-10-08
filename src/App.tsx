import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { downloadBackup } from './backup'
import { useActiveCv, useStore } from './store'
import { Home } from './ui/Home'
import { Download, More } from './ui/icons'

const Workspace = lazy(() => import('./ui/Workspace'))

function useToast() {
  const [msg, setMsg] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const notify = (m: string) => {
    setMsg(m)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMsg(null), 3200)
  }
  return { msg, notify }
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOut: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOut()
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [ref, onOut, active])
}

export default function App() {
  const cv = useActiveCv()
  const { close, rename, duplicate, saveError } = useStore()
  const { msg, notify } = useToast()
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [menu, setMenu] = useState(false)
  const [busy, setBusy] = useState<'pdf' | 'docx' | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  useClickOutside(menuRef, () => setMenu(false), menu)

  useEffect(() => {
    document.title = cv ? `${cv.name || 'Untitled CV'} · CVPlate` : 'CVPlate · CV builder'
  }, [cv?.name, cv])

  const run = async (kind: 'pdf' | 'docx') => {
    if (!cv) return
    setBusy(kind)
    try {
      const { downloadPdf, downloadDocx } = await import('./export')
      await (kind === 'pdf' ? downloadPdf(cv) : downloadDocx(cv))
    } catch (e) {
      notify(`Export failed: ${(e as Error).message}`)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="shell">
      <header className="topbar">
        <button className="brand" onClick={close} aria-label="CVPlate home">
          <span className="brand-mark" aria-hidden />
          <span className={cv ? 'hide-sm' : ''}>CVPlate</span>
        </button>
        {cv ? (
          <>
            <span className="divider" />
            <input className="name-input" value={cv.name} aria-label="Draft name" onChange={(e) => rename(cv.id, e.target.value)} />
            <span className={`save-state hide-sm${saveError ? ' error' : ''}`} title={saveError ?? 'Saved in this browser'}>
              {saveError ? 'Not saved' : `Saved ${new Date(cv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            </span>
            <span className="spacer" />
            <button className="btn hide-sm" disabled={!!busy} onClick={() => run('docx')}>
              {busy === 'docx' ? 'Preparing…' : 'Word'}
            </button>
            <button className="btn primary" disabled={!!busy} onClick={() => run('pdf')}>
              <Download /> {busy === 'pdf' ? 'Preparing…' : 'PDF'}
            </button>
            <div className="menu-wrap" ref={menuRef}>
              <button className="icon-btn" style={{ width: 32, height: 32 }} aria-label="More" aria-expanded={menu} onClick={() => setMenu(!menu)}>
                <More />
              </button>
              {menu ? (
                <div className="menu" role="menu" onClick={() => setMenu(false)}>
                  <button role="menuitem" onClick={() => run('docx')}>
                    Download Word (.docx)
                  </button>
                  <button role="menuitem" onClick={() => run('pdf')}>
                    Download PDF
                  </button>
                  <hr />
                  <button role="menuitem" onClick={() => duplicate(cv.id)}>
                    Duplicate this CV
                  </button>
                  <button role="menuitem" onClick={() => downloadBackup(cv)}>
                    Download backup (.json)
                  </button>
                  <hr />
                  <button role="menuitem" onClick={close}>
                    All drafts
                  </button>
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </header>

      {cv ? (
        <Suspense fallback={<div className="workspace" />}>
          <Workspace cv={cv} tab={tab} setTab={setTab} />
        </Suspense>
      ) : (
        <Home notify={notify} />
      )}
      {msg ? (
        <div className="toast" role="status">
          {msg}
        </div>
      ) : null}
    </div>
  )
}
