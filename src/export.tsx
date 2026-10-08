import { pdf } from '@react-pdf/renderer'
import type { Cv } from './model/types'
import { registerFonts } from './pdf/fonts'
import { CvDocument } from './pdf/CvDocument'
import { prepare } from './render/prepare'

registerFonts((file) => new URL(`${import.meta.env.BASE_URL}fonts/${file}`, window.location.href).href)

export async function renderPdf(cv: Cv): Promise<Blob> {
  return pdf(<CvDocument p={prepare(cv)} />).toBlob()
}

function fileBase(cv: Cv): string {
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

export async function downloadPdf(cv: Cv) {
  save(await renderPdf(cv), `${fileBase(cv)}.pdf`)
}

export async function downloadDocx(cv: Cv) {
  // The Word builder is only needed on demand, so it loads in its own chunk.
  const { buildDocx } = await import('./docx/buildDocx')
  save(await buildDocx(prepare(cv)), `${fileBase(cv)}.docx`)
}
