import type { Cv } from './model/types'

const fileBase = (cv: Cv): string => {
  const name = cv.basics.name.trim() || cv.name.trim() || 'CV'
  return `${name.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '')}-CV`
}

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export function downloadBackup(cv: Cv) {
  save(new Blob([JSON.stringify({ format: 'cvplate', version: 1, cv }, null, 2)], { type: 'application/json' }), `${fileBase(cv)}.cvplate.json`)
}

/** Accepts a CVPlate backup. Throws with a readable message when the file is not one. */
export async function readBackup(file: File): Promise<Cv> {
  let data: unknown
  try {
    data = JSON.parse(await file.text())
  } catch {
    throw new Error('That file is not valid JSON.')
  }
  const cv = (data as { format?: string; cv?: Cv })?.cv
  if ((data as { format?: string })?.format !== 'cvplate' || !cv?.basics || !Array.isArray(cv.sections) || !cv.settings) {
    throw new Error('That file is not a CVPlate backup.')
  }
  return cv
}
