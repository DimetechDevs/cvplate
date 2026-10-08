import { Font } from '@react-pdf/renderer'
import type { PdfFamily } from '../templates/themes'

const FACES: Record<PdfFamily, { weight: number; italic?: boolean }[]> = {
  Carlito: [{ weight: 400 }, { weight: 700 }, { weight: 400, italic: true }, { weight: 700, italic: true }],
  Caladea: [{ weight: 400 }, { weight: 700 }, { weight: 400, italic: true }, { weight: 700, italic: true }],
  Gelasio: [{ weight: 400 }, { weight: 600 }, { weight: 700 }, { weight: 400, italic: true }],
  SourceSans3: [{ weight: 400 }, { weight: 600 }, { weight: 700 }, { weight: 400, italic: true }],
  SourceSerif4: [{ weight: 400 }, { weight: 600 }, { weight: 700 }],
  EBGaramond: [{ weight: 400 }, { weight: 600 }, { weight: 700 }, { weight: 400, italic: true }],
  IBMPlexSans: [{ weight: 400 }, { weight: 600 }, { weight: 700 }, { weight: 400, italic: true }],
  LibreFranklin: [{ weight: 400 }, { weight: 600 }, { weight: 700 }, { weight: 400, italic: true }],
  Inter: [{ weight: 400 }, { weight: 600 }, { weight: 700 }, { weight: 400, italic: true }],
}

let registered = false

/**
 * Registers every PDF face. Files are only fetched when a document actually uses the family.
 * `resolve` maps a file name to a URL (browser) or absolute path (Node scripts and tests).
 */
export function registerFonts(resolve: (file: string) => string): void {
  if (registered) return
  registered = true
  for (const [family, faces] of Object.entries(FACES)) {
    Font.register({
      family,
      fonts: faces.map((f) => ({
        src: resolve(`${family}-${f.weight}${f.italic ? '-italic' : ''}.ttf`),
        fontWeight: f.weight,
        fontStyle: f.italic ? 'italic' : 'normal',
      })),
    })
  }
  // CVs read better unhyphenated; words wrap whole.
  Font.registerHyphenationCallback((word) => [word])
}
