# CVPlate

CVPlate is a free CV and résumé builder that follows international conventions. Users pick a sector and the country they're applying in, edit with a live preview, and download a PDF or an editable Word file. Drafts are saved in the browser.

The full template and standards spec is in `docs/template-spec.md`.

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/, deployable to any static host
```

## How it fits together

| Path | What it does |
|---|---|
| `src/model/` | CV data model, country presets (`countries.ts`), sector presets with tips and example bullets (`sectors.ts`), sample CV |
| `src/templates/themes.ts` | The 10 templates. Each one is a set of typographic decisions (fonts, sizes, heading style, layout), not its own component tree. |
| `src/render/prepare.ts` | Turns a CV into what renderers need: it drops empty content and applies country rules. Both outputs share it. |
| `src/pdf/` | react-pdf document and font registration. The live preview renders this same PDF through pdf.js, so the preview always matches the download. |
| `src/docx/buildDocx.ts` | Native Word output built with real styles: Title and Heading 1, bullet numbering, tab stops for dates and paragraph borders for rules. It stays fully editable. |
| `src/store.ts` | Drafts in `localStorage` (zustand persist), with multiple CVs and a JSON backup/restore. |
| `src/ui/` | The editor, preview, start page and template picker. |

Each PDF font is paired with a Word font that ships with Microsoft Office. Three pairs are metric-compatible, so line breaks match between the PDF and the .docx:

- Carlito → Calibri
- Caladea → Cambria
- Gelasio → Georgia

## Checking changes

```sh
npx tsx --tsconfig scripts/tsconfig.json scripts/render-samples.tsx   # every template → out/*.pdf
npx tsx --tsconfig scripts/tsconfig.json scripts/render-docx.ts       # every template → out/*.docx
./scripts/thumbs.sh                                                   # regenerate public/thumbs
npm run build && npx vite preview --port 4173 &
node scripts/smoke.mjs out && node scripts/flow.mjs out              # browser tests (set CHROMIUM_PATH if needed)
```
