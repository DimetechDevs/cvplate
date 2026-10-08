// Writes a .docx per template with the sample CV to out/: npx tsx scripts/render-docx.ts
import { mkdirSync, writeFileSync } from 'node:fs'
import { buildDocx } from '../src/docx/buildDocx'
import { prepare } from '../src/render/prepare'
import { sampleCv } from '../src/model/sample'
import { THEMES } from '../src/templates/themes'

mkdirSync('out', { recursive: true })
for (const t of THEMES) {
  const cv = sampleCv(t.id)
  if (t.id === 'continental') { cv.settings.countryId = 'eu'; cv.sections.forEach((s) => { if (s.kind === 'languages') s.useCefr = true }) }
  const blob = await buildDocx(prepare(cv))
  writeFileSync(`out/${t.id}.docx`, Buffer.from(await blob.arrayBuffer()))
  console.log(t.id, blob.size)
}
