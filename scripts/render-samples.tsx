// Renders every template with the sample CV to out/ for visual checks: npx tsx scripts/render-samples.tsx
import { renderToFile } from '@react-pdf/renderer'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
import { registerFonts } from '../src/pdf/fonts'
import { CvDocument } from '../src/pdf/CvDocument'
import { prepare } from '../src/render/prepare'
import { sampleCv } from '../src/model/sample'
import { THEMES } from '../src/templates/themes'

registerFonts((f) => path.resolve('public/fonts', f))
const only = process.argv[2]
mkdirSync('out', { recursive: true })
for (const t of THEMES) {
  if (only && t.id !== only) continue
  const cv = sampleCv(t.id)
  if (t.id === 'continental') { cv.settings.countryId = 'eu'; cv.sections.forEach((s) => { if (s.kind === 'languages') s.useCefr = true }) }
  const t0 = Date.now()
  await renderToFile(<CvDocument p={prepare(cv)} />, `out/${t.id}.pdf`)
  console.log(t.id, Date.now() - t0, 'ms')
}
