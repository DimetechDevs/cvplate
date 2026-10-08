import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  HorizontalPositionAlign,
  HorizontalPositionRelativeFrom,
  ImageRun,
  LevelFormat,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TabStopType,
  TextRun,
  TextWrappingSide,
  TextWrappingType,
  VerticalPositionRelativeFrom,
  WidthType,
  type IBorderOptions,
  type IParagraphOptions,
  type ParagraphChild,
} from 'docx'
import { formatRange, formatYm, joinNonEmpty } from '../model/format'
import type { Entry, Section } from '../model/types'
import { CEFR_COLUMNS, DECLARATION, languageLine, todayLine, type Prepared } from '../render/prepare'
import type { Theme } from '../templates/themes'

/** Twips per point. Word measures layout in twentieths of a point. */
const TW = 20
const PAGE = { A4: { w: 11906, h: 16838 }, LETTER: { w: 12240, h: 15840 } }
const LABEL_W = 112 * TW
const DATE_W = 100 * TW
const SIDEBAR_W = 176 * TW

const hex = (c: string) => c.replace('#', '').toUpperCase()
const half = (pt: number) => Math.round(pt * 2)

interface Ctx {
  p: Prepared
  t: Theme
  accent: string
  /** Width of the column currently being filled, for right tab stops. */
  width: number
  /** Left indent applied to every paragraph (label layout). */
  indent: number
  narrow: boolean
}

const NONE: IBorderOptions = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
const NO_BORDERS = { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE }

function run(text: string, _ctx: Ctx, o: { bold?: boolean; italics?: boolean; color?: string; size?: number; font?: string; caps?: boolean; spacing?: number } = {}) {
  return new TextRun({
    text,
    bold: o.bold,
    italics: o.italics,
    color: o.color ? hex(o.color) : undefined,
    size: o.size ? half(o.size) : undefined,
    font: o.font,
    allCaps: o.caps,
    characterSpacing: o.spacing ? Math.round(o.spacing * TW) : undefined,
  })
}

function para(ctx: Ctx, children: ParagraphChild[], o: Partial<IParagraphOptions> & { after?: number; before?: number; rightTab?: boolean } = {}) {
  const { after, before, rightTab, ...rest } = o
  return new Paragraph({
    children,
    spacing: { before: (before ?? 0) * TW, after: (after ?? 0) * TW, line: Math.round(ctx.t.lineHeight * 240) },
    indent: ctx.indent ? { left: ctx.indent } : undefined,
    tabStops: rightTab ? [{ type: TabStopType.RIGHT, position: ctx.width }] : undefined,
    keepLines: true,
    ...rest,
  })
}

function heading(ctx: Ctx, title: string, first: boolean): Paragraph {
  const { t, accent } = ctx
  const h = t.heading
  const color = h.color === 'accent' ? accent : t.ink
  const before = first ? 0 : t.rhythm.section
  if (t.layout === 'label' && !ctx.narrow) {
    return new Paragraph({
      style: 'Heading1',
      children: [new TextRun({ text: `\t${title}`, allCaps: h.case === 'upper' })],
      tabStops: [{ type: TabStopType.RIGHT, position: LABEL_W - 10 * TW }],
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: hex(accent), space: 2 } },
      spacing: { before: before * TW, after: 6 * TW },
      keepNext: true,
    })
  }
  const border =
    h.rule === 'hairline'
      ? { bottom: { style: BorderStyle.SINGLE, size: 4, color: h.color === 'accent' ? hex(accent) : '9A9A9A', space: 2 } }
      : h.rule === 'accent'
        ? { bottom: { style: BorderStyle.SINGLE, size: 10, color: hex(accent), space: 2 } }
        : undefined
  return new Paragraph({
    style: 'Heading1',
    children: [new TextRun({ text: title, allCaps: h.case === 'upper' || ctx.narrow, color: hex(color) })],
    border: ctx.narrow ? undefined : border,
    spacing: { before: before * TW, after: 5 * TW },
    keepNext: true,
  })
}

function bullets(ctx: Ctx, items: string[]): Paragraph[] {
  return items.map(
    (b) =>
      new Paragraph({
        children: [new TextRun(b)],
        numbering: { reference: 'cv-bullets', level: 0 },
        spacing: { before: 1.5 * TW, line: Math.round(ctx.t.lineHeight * 240) },
        indent: { left: ctx.indent + 10 * TW, hanging: 10 * TW },
      }),
  )
}

function entry(ctx: Ctx, e: Entry, first: boolean): Paragraph[] {
  const { t, p } = ctx
  const dates = formatRange(e, p.dateStyle)
  const before = first ? 0 : t.rhythm.entry
  const out: Paragraph[] = []
  const muted = t.muted
  const titleRun = run(e.title || e.org, ctx, { bold: true, size: t.size.entryTitle })
  const orgLine = e.title && (e.org || e.location) ? joinNonEmpty([e.org, e.location], ', ') : ''

  if (t.entry.dates === 'left' && !ctx.narrow) {
    // Hanging dates: the date sits in the indent, the rest of the entry aligns to the text column.
    const col = t.layout === 'label' ? LABEL_W : DATE_W
    const inner: Ctx = { ...ctx, indent: col }
    const tabs =
      t.layout === 'label'
        ? [{ type: TabStopType.RIGHT, position: col - 10 * TW }, { type: TabStopType.LEFT, position: col }]
        : [{ type: TabStopType.LEFT, position: col }]
    out.push(
      new Paragraph({
        children: [
          run(t.layout === 'label' ? `\t${dates}\t` : `${dates}\t`, ctx, { color: muted, size: t.size.small }),
          titleRun,
        ],
        tabStops: tabs,
        indent: { left: col, hanging: col },
        spacing: { before: before * TW, line: Math.round(t.lineHeight * 240) },
        keepNext: true,
        keepLines: true,
      }),
    )
    if (orgLine) out.push(para(inner, [run(orgLine, ctx, { color: muted })], { keepNext: true }))
    if (e.note) out.push(para(inner, [run(e.note, ctx, { italics: true })], { keepNext: !!e.bullets.length }))
    out.push(...bullets(inner, e.bullets))
    return out
  }

  if (t.entry.lead === 'org' && !ctx.narrow) {
    out.push(para(ctx, [run(e.org || e.title, ctx, { bold: true, size: t.size.entryTitle }), ...(e.location ? [run(`\t${e.location}`, ctx)] : [])], { before, rightTab: true, keepNext: true }))
    if (e.org && e.title) out.push(para(ctx, [run(e.title, ctx, { italics: true }), run(`\t${dates}`, ctx)], { rightTab: true, keepNext: true }))
    else if (dates) out.push(para(ctx, [run(`\t${dates}`, ctx)], { rightTab: true, keepNext: true }))
  } else {
    out.push(para(ctx, [titleRun, ...(dates ? [run(`\t${dates}`, ctx)] : [])], { before, rightTab: true, keepNext: true }))
    if (orgLine)
      out.push(
        para(ctx, [run(e.org, ctx, { bold: true, color: muted }), run(e.org && e.location ? `, ${e.location}` : e.org ? '' : e.location, ctx, { color: muted })], { keepNext: true }),
      )
  }
  if (e.note) out.push(para(ctx, [run(e.note, ctx, { italics: true })], { keepNext: !!e.bullets.length }))
  out.push(...bullets(ctx, e.bullets))
  return out
}

function sectionBody(ctx: Ctx, s: Section): (Paragraph | Table)[] {
  const { t, p } = ctx
  const muted = t.muted
  // Non-entry content in the label layout is indented to the text column.
  const body: Ctx = t.layout === 'label' && !ctx.narrow && s.kind !== 'entries' ? { ...ctx, indent: LABEL_W } : ctx
  switch (s.kind) {
    case 'summary':
      return s.text
        .trim()
        .split(/\n+/)
        .map((line) => para(body, [run(line, ctx)], { after: 2 }))
    case 'entries':
      return s.items.flatMap((e, i) => entry(ctx, e, i === 0))
    case 'skills':
      if (ctx.narrow)
        return s.items.flatMap((g, i) => [
          ...(g.name ? [para(body, [run(g.name, ctx, { bold: true })], { before: i ? 5 : 0, keepNext: true })] : []),
          para(body, [run(g.keywords, ctx, { size: t.size.small })]),
        ])
      return s.items.map((g, i) => para(body, [...(g.name ? [run(`${g.name}: `, ctx, { bold: true })] : []), run(g.keywords, ctx)], { before: i ? 2 : 0 }))
    case 'languages': {
      const natives = s.items.filter((l) => l.native)
      const others = s.items.filter((l) => !l.native)
      if (s.useCefr && !ctx.narrow && others.length) {
        const out: (Paragraph | Table)[] = []
        if (natives.length) out.push(para(body, [run('Mother tongue: ', ctx, { bold: true }), run(natives.map((l) => l.language).join(', '), ctx)], { after: 4 }))
        const cellW = Math.floor((body.width - body.indent - 78 * TW) / 5)
        const cell = (text: string, o: { bold?: boolean; small?: boolean; center?: boolean; w: number }) =>
          new TableCell({
            width: { size: o.w, type: WidthType.DXA },
            children: [
              new Paragraph({
                alignment: o.center ? AlignmentType.CENTER : AlignmentType.LEFT,
                spacing: { before: 2 * TW, after: 2 * TW },
                children: [run(text, ctx, { bold: o.bold, size: o.small ? t.size.small : undefined, color: o.small ? muted : undefined })],
              }),
            ],
          })
        const line = { style: BorderStyle.SINGLE, size: 4, color: 'B5B5B5' }
        out.push(
          new Table({
            layout: TableLayoutType.FIXED,
            indent: body.indent ? { size: body.indent, type: WidthType.DXA } : undefined,
            width: { size: body.width - body.indent, type: WidthType.DXA },
            columnWidths: [78 * TW, ...CEFR_COLUMNS.map(() => cellW)],
            borders: { ...NO_BORDERS, top: line, bottom: line, insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'DDDDDD' } },
            rows: [
              new TableRow({ tableHeader: true, children: [cell('', { w: 78 * TW }), ...CEFR_COLUMNS.map(([, label]) => cell(label, { small: true, center: true, w: cellW }))] }),
              ...others.map((l) => new TableRow({ cantSplit: true, children: [cell(l.language, { bold: true, w: 78 * TW }), ...CEFR_COLUMNS.map(([k]) => cell(l.cefr[k] || '–', { center: true, w: cellW }))] })),
            ],
          }),
        )
        out.push(para(body, [run('Levels: A1–A2 basic user; B1–B2 independent user; C1–C2 proficient user (Common European Framework of Reference).', ctx, { size: t.size.small, color: muted })], { before: 2 }))
        return out
      }
      if (ctx.narrow) return s.items.map((l) => para(body, [run(l.language, ctx, { bold: true }), run(` ${l.native ? 'Native' : l.fluency}`, ctx, { color: muted })]))
      return [para(body, [run(s.items.map(languageLine).join('   ·   '), ctx)])]
    }
    case 'list':
      return s.items.flatMap((i, idx) => {
        const date = formatYm(i.date, p.dateStyle)
        if (ctx.narrow)
          return [
            para(body, [run(i.title, ctx, { bold: true })], { before: idx ? 4 : 0, keepNext: true }),
            para(body, [run(joinNonEmpty([i.issuer, date], ', '), ctx, { size: t.size.small, color: muted })]),
            ...(i.detail ? [para(body, [run(i.detail, ctx, { size: t.size.small })])] : []),
          ]
        return [
          para(body, [run(i.title, ctx, { bold: true }), ...(i.issuer ? [run(`, ${i.issuer}`, ctx, { color: muted })] : []), ...(date ? [run(`\t${date}`, ctx)] : [])], {
            before: idx ? 3 : 0,
            rightTab: true,
            keepNext: !!i.detail,
          }),
          ...(i.detail ? [para(body, [run(i.detail, ctx, { size: t.size.small, color: muted })])] : []),
        ]
      })
    case 'references':
      if (s.onRequest || !s.items.length) return [para(body, [run('Available on request.', ctx)])]
      return s.items.map((r, i) => {
        const lines = [joinNonEmpty([r.role, r.org], ', '), r.email, r.phone].filter(Boolean)
        return para(body, [run(r.name, ctx, { bold: true }), ...lines.map((l) => new TextRun({ text: l, break: 1, color: hex(muted) }))], { before: i ? 6 : 0 })
      })
  }
}

function contactRuns(ctx: Ctx, vertical: boolean, align: 'left' | 'center'): Paragraph[] {
  const { p, t } = ctx
  const size = t.size.small
  const piece = (c: { text: string; href?: string }) =>
    c.href ? new ExternalHyperlink({ link: c.href, children: [run(c.text, ctx, { size, color: t.ink })] }) : run(c.text, ctx, { size })
  if (vertical) return p.contacts.map((c) => para(ctx, [piece(c)]))
  if (!p.contacts.length) return []
  const children: ParagraphChild[] = []
  p.contacts.forEach((c, i) => {
    if (i) children.push(run(t.header.contactSeparator, ctx, { size, color: '9A9A9A' }))
    children.push(piece(c))
  })
  return [para(ctx, children, { alignment: align === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT })]
}

function personalParas(ctx: Ctx, vertical: boolean, align: 'left' | 'center'): Paragraph[] {
  const { p, t } = ctx
  if (!p.personal.length) return []
  if (vertical) return p.personal.map((x, i) => para(ctx, [run(`${x.label}: `, ctx, { size: t.size.small, color: t.muted }), run(x.value, ctx, { size: t.size.small })], { before: i ? 0 : 6 }))
  return [
    para(ctx, [run(p.personal.map((x) => `${x.label}: ${x.value}`).join('   ·   '), ctx, { size: t.size.small, color: t.muted })], {
      alignment: align === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT,
      before: 1.5,
    }),
  ]
}

function dataUrlToImage(dataUrl: string): { data: Uint8Array; type: 'jpg' | 'png' } | null {
  const m = /^data:image\/(jpeg|jpg|png);base64,(.+)$/.exec(dataUrl)
  if (!m) return null
  const bin = atob(m[2])
  const data = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) data[i] = bin.charCodeAt(i)
  return { data, type: m[1] === 'png' ? 'png' : 'jpg' }
}

function photoRun(p: Prepared, w: number, h: number, floating: boolean): ImageRun | null {
  const img = p.photo ? dataUrlToImage(p.photo) : null
  if (!img) return null
  return new ImageRun({
    type: img.type,
    data: img.data,
    transformation: { width: Math.round((w * 96) / 72), height: Math.round((h * 96) / 72) },
    altText: { name: 'Photo', description: `Photo of ${p.cv.basics.name}`, title: 'Photo' },
    floating: floating
      ? {
          horizontalPosition: { relative: HorizontalPositionRelativeFrom.MARGIN, align: HorizontalPositionAlign.RIGHT },
          verticalPosition: { relative: VerticalPositionRelativeFrom.PARAGRAPH, offset: 0 },
          wrap: { type: TextWrappingType.SQUARE, side: TextWrappingSide.LEFT },
          margins: { left: 14 * 12700 },
        }
      : undefined,
  })
}

function header(ctx: Ctx): Paragraph[] {
  const { p, t, accent } = ctx
  const b = p.cv.basics
  const h = t.header
  const align = h.align === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT
  const photo = photoRun(p, 66, 82, true)
  const nameColor = t.layout === 'label' || t.id === 'executive' ? accent : t.ink
  const out: Paragraph[] = [
    new Paragraph({
      style: 'Title',
      alignment: align,
      children: [...(photo ? [photo] : []), new TextRun({ text: b.name, allCaps: h.nameCase === 'upper', color: hex(nameColor) })],
    }),
  ]
  if (b.headline) out.push(para(ctx, [run(b.headline, ctx, { size: t.size.headline, color: t.muted })], { alignment: align, before: 3, after: 4 }))
  out.push(...contactRuns(ctx, false, h.align), ...personalParas(ctx, false, h.align))
  // A spacer paragraph carries the header rule so it spans the full measure.
  out.push(
    new Paragraph({
      children: [],
      spacing: { before: 0, after: (t.rhythm.section + 2) * TW, line: 120 },
      border: h.rule ? { top: { style: BorderStyle.SINGLE, size: t.id === 'tradesman' ? 16 : 6, color: hex(accent), space: 6 } } : undefined,
    }),
  )
  return out
}

function closing(ctx: Ctx): Paragraph[] {
  const { p, t } = ctx
  if (p.closing.kind === 'none') return []
  const out: Paragraph[] = []
  if (p.closing.kind === 'declaration') out.push(para(ctx, [run(DECLARATION, ctx)], { before: t.rhythm.section + 6, after: 10 }))
  out.push(
    para(ctx, [run(todayLine(p.closing.place), ctx, { color: t.muted }), run('\t________________________', ctx, { color: '777777' })], {
      before: p.closing.kind === 'declaration' ? 6 : t.rhythm.section + 18,
      rightTab: true,
    }),
    para(ctx, [run(`\t${p.closing.name}`, ctx, { size: t.size.small, color: t.muted })], { rightTab: true }),
  )
  return out
}

export async function buildDocx(p: Prepared): Promise<Blob> {
  const t = p.theme
  const page = PAGE[p.pageSize]
  const margin = (p.pageSize === 'A4' ? t.margins.a4 : t.margins.letter) * TW
  const contentW = page.w - margin * 2
  const ctx: Ctx = { p, t, accent: p.accent, width: contentW, indent: 0, narrow: false }

  let children: (Paragraph | Table)[]
  if (t.layout === 'sidebar') {
    const sideW = SIDEBAR_W - margin * 0.75
    const mainW = contentW + margin * 0.25 - sideW
    const side: Ctx = { ...ctx, width: sideW - 14 * TW, narrow: true }
    const main: Ctx = { ...ctx, width: mainW - 18 * TW }
    const photo = photoRun(p, 96, 118, false)
    const sideHeading = (title: string, first: boolean) =>
      para(side, [run(title, side, { bold: true, caps: true, size: t.size.heading, color: p.accent, spacing: t.heading.tracking })], { before: first ? 0 : t.rhythm.section, after: 5, keepNext: true })
    const sideContent: Paragraph[] = [
      ...(photo ? [new Paragraph({ children: [photo], spacing: { after: 14 * TW } })] : []),
      sideHeading('Contact', true),
      ...contactRuns(side, true, 'left'),
      ...personalParas(side, true, 'left'),
      ...p.sideSections.flatMap((s) => [sideHeading(s.title, false), ...(sectionBody(side, s) as Paragraph[])]),
    ]
    const b = p.cv.basics
    const mainContent: (Paragraph | Table)[] = [
      new Paragraph({ style: 'Title', children: [new TextRun(b.name)] }),
      ...(b.headline ? [para(main, [run(b.headline, main, { size: t.size.headline, color: p.accent })], { before: 3, after: t.rhythm.section })] : []),
      ...p.sections.flatMap((s, i) => [heading(main, s.title, i === 0 && !b.headline), ...sectionBody(main, s)]),
      ...closing(main),
    ]
    children = [
      new Table({
        layout: TableLayoutType.FIXED,
        width: { size: contentW + margin * 0.25, type: WidthType.DXA },
        indent: { size: -margin * 0.25, type: WidthType.DXA },
        columnWidths: [sideW, mainW],
        borders: NO_BORDERS,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: sideW, type: WidthType.DXA },
                shading: { type: ShadingType.CLEAR, color: 'auto', fill: hex(t.sidebarTint ?? '#f3efe9') },
                margins: { top: 14 * TW, bottom: 14 * TW, left: 12 * TW, right: 12 * TW },
                children: sideContent,
              }),
              new TableCell({ width: { size: mainW, type: WidthType.DXA }, margins: { left: 18 * TW, right: 0 }, children: mainContent }),
            ],
          }),
        ],
      }),
    ]
  } else {
    children = [...header(ctx), ...p.sections.flatMap((s, i) => [heading(ctx, s.title, i === 0), ...sectionBody(ctx, s)]), ...closing(ctx)]
  }

  const h = t.heading
  const doc = new Document({
    creator: 'CVPlate',
    title: joinNonEmpty([p.cv.basics.name, 'CV'], ' – '),
    description: p.cv.basics.headline,
    styles: {
      default: {
        document: {
          run: { font: t.docx.body, size: half(t.size.body), color: hex(t.ink) },
          paragraph: { spacing: { line: Math.round(t.lineHeight * 240) } },
        },
        title: {
          run: { font: t.docx.name, size: half(t.size.name), bold: t.header.nameWeight >= 600, color: hex(t.ink), characterSpacing: Math.round(t.header.nameTracking * TW) },
          paragraph: { spacing: { after: 0, line: 264 } },
        },
        heading1: {
          run: {
            font: t.docx.heading,
            size: half(t.size.heading),
            bold: h.weight >= 600,
            color: hex(h.color === 'accent' ? p.accent : t.ink),
            characterSpacing: Math.round(h.tracking * TW),
          },
          paragraph: { spacing: { line: 240 } },
        },
      },
    },
    numbering: {
      config: [
        {
          reference: 'cv-bullets',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: t.entry.bullet,
              alignment: AlignmentType.LEFT,
              style: { run: { color: hex(t.muted) }, paragraph: { indent: { left: 10 * TW, hanging: 10 * TW } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: page.w, height: page.h },
            margin: { top: margin, bottom: margin, left: t.layout === 'sidebar' ? margin * 0.75 : margin, right: margin, header: 360, footer: 360 },
          },
        },
        children,
      },
    ],
  })
  return Packer.toBlob(doc)
}
