import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { applyCountry, createCv, uid } from './model/factory'
import { sampleCv } from './model/sample'
import type { Cv, Section } from './model/types'

interface State {
  drafts: Record<string, Cv>
  activeId: string | null
  /** Set when localStorage refuses a write (quota, private mode); shown in the toolbar. */
  saveError: string | null
  create: (opts: { sectorId: string; countryId: string; templateId?: string }) => void
  loadExample: () => void
  open: (id: string) => void
  close: () => void
  duplicate: (id: string) => void
  remove: (id: string) => void
  rename: (id: string, name: string) => void
  importCv: (cv: Cv) => void
  /** Immutable update of the active CV. */
  update: (fn: (cv: Cv) => Cv) => void
  updateSection: (sectionId: string, fn: (s: Section) => Section) => void
  setCountry: (countryId: string) => void
}

const touch = (cv: Cv): Cv => ({ ...cv, updatedAt: Date.now() })

/** localStorage wrapper that reports failures instead of throwing inside the persist middleware. */
const safeStorage = {
  getItem: (k: string) => {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  setItem: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v)
      if (useStore.getState().saveError) useStore.setState({ saveError: null })
    } catch {
      useStore.setState({ saveError: 'Browser storage is full or blocked. Download a backup to keep your work.' })
    }
  },
  removeItem: (k: string) => {
    try {
      localStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  },
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      drafts: {},
      activeId: null,
      saveError: null,
      create: (opts) => {
        const cv = createCv(opts)
        set((s) => ({ drafts: { ...s.drafts, [cv.id]: cv }, activeId: cv.id }))
      },
      loadExample: () => {
        const cv = sampleCv()
        set((s) => ({ drafts: { ...s.drafts, [cv.id]: cv }, activeId: cv.id }))
      },
      open: (id) => set({ activeId: id }),
      close: () => set({ activeId: null }),
      duplicate: (id) => {
        const src = get().drafts[id]
        if (!src) return
        const copy: Cv = { ...structuredClone(src), id: uid(), name: `${src.name} (copy)`, createdAt: Date.now(), updatedAt: Date.now() }
        set((s) => ({ drafts: { ...s.drafts, [copy.id]: copy }, activeId: copy.id }))
      },
      remove: (id) =>
        set((s) => {
          const drafts = { ...s.drafts }
          delete drafts[id]
          return { drafts, activeId: s.activeId === id ? null : s.activeId }
        }),
      rename: (id, name) => set((s) => ({ drafts: { ...s.drafts, [id]: touch({ ...s.drafts[id], name }) } })),
      importCv: (cv) => {
        const fresh: Cv = { ...cv, id: uid(), updatedAt: Date.now() }
        set((s) => ({ drafts: { ...s.drafts, [fresh.id]: fresh }, activeId: fresh.id }))
      },
      update: (fn) =>
        set((s) => {
          const cur = s.activeId ? s.drafts[s.activeId] : null
          if (!cur) return s
          return { drafts: { ...s.drafts, [cur.id]: touch(fn(cur)) } }
        }),
      updateSection: (sectionId, fn) =>
        get().update((cv) => ({ ...cv, sections: cv.sections.map((s) => (s.id === sectionId ? fn(s) : s)) })),
      setCountry: (countryId) => get().update((cv) => applyCountry(cv, countryId)),
    }),
    {
      name: 'cvplate:v1',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ drafts: s.drafts, activeId: s.activeId }),
    },
  ),
)

export const useActiveCv = (): Cv | null => useStore((s) => (s.activeId ? (s.drafts[s.activeId] ?? null) : null))
