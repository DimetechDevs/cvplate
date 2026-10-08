import { Document, Image, Link, Page, Text, View } from '@react-pdf/renderer'
import type { Style } from '@react-pdf/stylesheet'
import type { ReactNode } from 'react'
import { formatRange, formatYm, joinNonEmpty } from '../model/format'
import type { Entry, ListItem, Section } from '../model/types'
import { CEFR_COLUMNS, DECLARATION, languageLine, todayLine, type Prepared } from '../render/prepare'
import type { Theme } from '../templates/themes'

/** Width of the left column in the label (Europass) and hanging-date layouts. */
const LABEL_W = 112
const DATE_W = 100
const SIDEBAR_W = 176

interface Ctx {
  p: Prepared
  t: Theme
  accent: string
}

function styles(t: Theme, accent: string) {
  const base: Style = { fontFamily: t.pdf.body, fontSize: t.size.body, lineHeight: t.lineHeight, color: t.ink }
  return {
    base,
    bold: { fontWeight: 700 } as Style,
    semibold: { fontWeight: 600 } as Style,
    italic: { fontStyle: 'italic' } as Style,
    muted: { color: t.muted } as Style,
    small: { fontSize: t.size.small } as Style,
    accent: { color: accent } as Style,
  }
}

function Heading({ ctx, children, inLabel = false }: { ctx: Ctx; children: string; inLabel?: boolean }) {
  const { t, accent } = ctx
  const h = t.heading
  const text = h.case === 'upper' ? children.toUpperCase() : children
  const style: Style = {
    fontFamily: t.pdf.heading,
    fontSize: t.size.heading,
    fontWeight: h.weight,
    letterSpacing: h.tracking,
    color: h.color === 'accent' ? accent : t.ink,
    lineHeight: 1.2,
  }
  if (inLabel) return <Text style={{ ...style, textAlign: 'right' }}>{text}</Text>
  const rule: Style =
    h.rule === 'hairline'
      ? { borderBottomWidth: 0.6, borderBottomColor: h.color === 'accent' ? accent : '#9a9a9a', paddingBottom: 2.5 }
      : h.rule === 'accent'
        ? { borderBottomWidth: 1.4, borderBottomColor: accent, paddingBottom: 2.5 }
        : {}
  return (
    <View style={{ ...rule, marginBottom: 5 }} minPresenceAhead={36}>
      <Text style={style}>{text}</Text>
    </View>
  )
}

function Bullets({ ctx, items }: { ctx: Ctx; items: string[] }) {
  const { t } = ctx
  if (!items.length) return null
  return (
    <View style={{ marginTop: 2 }}>
      {items.map((b, i) => (
        <View key={i} style={{ flexDirection: 'row', marginTop: i ? 1.5 : 0 }}>
          <Text style={{ width: 10, color: t.muted }}>{t.entry.bullet}</Text>
          <Text style={{ flex: 1 }}>{b}</Text>
        </View>
      ))}
    </View>
  )
}

/** A title line with something right-aligned on the same baseline (dates, location). */
function TitleRow({ left, right, style }: { left: ReactNode; right?: string; style?: Style }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', ...style }}>
      <Text style={{ flex: 1, paddingRight: 8 }}>{left}</Text>
      {right ? <Text style={{ flexShrink: 0, textAlign: 'right' }}>{right}</Text> : null}
    </View>
  )
}

function EntryView({ ctx, e, hanging }: { ctx: Ctx; e: Entry; hanging: boolean }) {
  const { t, p } = ctx
  const s = styles(t, ctx.accent)
  const dates = formatRange(e, p.dateStyle)
  const titleStyle: Style = { ...s.bold, fontSize: t.size.entryTitle }

  if (hanging) {
    // Dates sit in their own left column; used by Scholar and the Europass-style label layout.
    const leftW = t.layout === 'label' ? LABEL_W : DATE_W
    return (
      <View style={{ flexDirection: 'row' }}>
        <Text style={{ width: leftW, paddingRight: 10, color: t.muted, fontSize: t.size.small, textAlign: t.layout === 'label' ? 'right' : 'left', paddingTop: 0.8 }}>
          {dates}
        </Text>
        <View style={{ flex: 1 }}>
          <Text style={titleStyle}>{e.title || e.org}</Text>
          {e.title && (e.org || e.location) ? <Text style={s.muted}>{joinNonEmpty([e.org, e.location], ', ')}</Text> : null}
          {e.note ? <Text style={s.italic}>{e.note}</Text> : null}
          <Bullets ctx={ctx} items={e.bullets} />
        </View>
      </View>
    )
  }

  if (t.entry.lead === 'org') {
    return (
      <View>
        <TitleRow left={<Text style={titleStyle}>{e.org || e.title}</Text>} right={e.location} />
        {e.org && e.title ? <TitleRow left={<Text style={s.italic}>{e.title}</Text>} right={dates} /> : dates ? <TitleRow left="" right={dates} /> : null}
        {e.note ? <Text style={s.italic}>{e.note}</Text> : null}
        <Bullets ctx={ctx} items={e.bullets} />
      </View>
    )
  }

  return (
    <View>
      <TitleRow left={<Text style={titleStyle}>{e.title || e.org}</Text>} right={dates} style={{ color: t.ink }} />
      {e.title && (e.org || e.location) ? (
        <Text style={{ color: t.muted }}>
          <Text style={s.semibold}>{e.org}</Text>
          {e.org && e.location ? `, ${e.location}` : e.location}
        </Text>
      ) : null}
      {e.note ? <Text style={s.italic}>{e.note}</Text> : null}
      <Bullets ctx={ctx} items={e.bullets} />
    </View>
  )
}

function ListItemView({ ctx, i, compact }: { ctx: Ctx; i: ListItem; compact: boolean }) {
  const { t, p } = ctx
  const s = styles(t, ctx.accent)
  const date = formatYm(i.date, p.dateStyle)
  if (compact) {
    return (
      <View style={{ marginBottom: 4 }}>
        <Text style={s.semibold}>{i.title}</Text>
        <Text style={{ ...s.muted, ...s.small }}>{joinNonEmpty([i.issuer, date], ', ')}</Text>
        {i.detail ? <Text style={s.small}>{i.detail}</Text> : null}
      </View>
    )
  }
  return (
    <View wrap={false}>
      <TitleRow
        left={
          <Text>
            <Text style={s.semibold}>{i.title}</Text>
            {i.issuer ? <Text style={s.muted}>{`, ${i.issuer}`}</Text> : null}
          </Text>
        }
        right={date}
      />
      {i.detail ? <Text style={{ ...s.muted, ...s.small }}>{i.detail}</Text> : null}
    </View>
  )
}

function SectionBody({ ctx, section, narrow = false }: { ctx: Ctx; section: Section; narrow?: boolean }) {
  const { t } = ctx
  const s = styles(t, ctx.accent)
  const hanging = t.entry.dates === 'left' && !narrow
  switch (section.kind) {
    case 'summary':
      return <Text>{section.text.trim()}</Text>

    case 'entries':
      return (
        <View>
          {section.items.map((e, idx) => (
            // Keep short entries whole across page breaks; very long ones are allowed to split.
            <View key={e.id} wrap={e.bullets.length > 8} style={{ marginTop: idx ? t.rhythm.entry : 0 }}>
              <EntryView ctx={ctx} e={e} hanging={hanging} />
            </View>
          ))}
        </View>
      )

    case 'skills':
      if (narrow) {
        return (
          <View>
            {section.items.map((g, idx) => (
              <View key={g.id} style={{ marginTop: idx ? 5 : 0 }}>
                {g.name ? <Text style={s.semibold}>{g.name}</Text> : null}
                <Text style={s.small}>{g.keywords}</Text>
              </View>
            ))}
          </View>
        )
      }
      return (
        <View>
          {section.items.map((g, idx) => (
            <Text key={g.id} style={{ marginTop: idx ? 2 : 0 }}>
              {g.name ? <Text style={s.semibold}>{`${g.name}: `}</Text> : null}
              {g.keywords}
            </Text>
          ))}
        </View>
      )

    case 'languages': {
      const natives = section.items.filter((l) => l.native)
      const others = section.items.filter((l) => !l.native)
      if (section.useCefr && !narrow && others.length) {
        const cell: Style = { flex: 1, textAlign: 'center', paddingVertical: 2 }
        return (
          <View>
            {natives.length ? (
              <Text style={{ marginBottom: 4 }}>
                <Text style={s.semibold}>Mother tongue: </Text>
                {natives.map((l) => l.language).join(', ')}
              </Text>
            ) : null}
            <View style={{ borderTopWidth: 0.6, borderBottomWidth: 0.6, borderColor: '#b5b5b5' }} wrap={false}>
              <View style={{ flexDirection: 'row', borderBottomWidth: 0.4, borderColor: '#d0d0d0', ...s.small, ...s.muted }}>
                <Text style={{ width: 78, paddingVertical: 2 }}>{''}</Text>
                {CEFR_COLUMNS.map(([, label]) => (
                  <Text key={label} style={cell}>
                    {label}
                  </Text>
                ))}
              </View>
              {others.map((l) => (
                <View key={l.id} style={{ flexDirection: 'row' }}>
                  <Text style={{ width: 78, paddingVertical: 2, ...s.semibold }}>{l.language}</Text>
                  {CEFR_COLUMNS.map(([k]) => (
                    <Text key={k} style={cell}>
                      {l.cefr[k] || '–'}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
            <Text style={{ ...s.small, ...s.muted, marginTop: 2 }}>
              Levels: A1–A2 basic user; B1–B2 independent user; C1–C2 proficient user (Common European Framework of Reference).
            </Text>
          </View>
        )
      }
      if (narrow) {
        return (
          <View>
            {section.items.map((l) => (
              <Text key={l.id}>
                <Text style={s.semibold}>{l.language}</Text>
                <Text style={s.muted}>{` ${l.native ? 'Native' : l.fluency}`}</Text>
              </Text>
            ))}
          </View>
        )
      }
      return <Text>{section.items.map(languageLine).join('   ·   ')}</Text>
    }

    case 'list':
      return (
        <View>
          {section.items.map((i, idx) => (
            <View key={i.id} style={{ marginTop: idx && !narrow ? 3 : 0 }}>
              <ListItemView ctx={ctx} i={i} compact={narrow} />
            </View>
          ))}
        </View>
      )

    case 'references':
      if (section.onRequest || !section.items.length) return <Text>Available on request.</Text>
      return (
        <View style={{ flexDirection: narrow ? 'column' : 'row', flexWrap: 'wrap' }}>
          {section.items.map((r) => (
            <View key={r.id} style={{ width: narrow ? '100%' : '50%', paddingRight: 10, marginBottom: 6 }} wrap={false}>
              <Text style={s.semibold}>{r.name}</Text>
              {r.role || r.org ? <Text>{joinNonEmpty([r.role, r.org], ', ')}</Text> : null}
              {r.email ? <Text style={s.muted}>{r.email}</Text> : null}
              {r.phone ? <Text style={s.muted}>{r.phone}</Text> : null}
            </View>
          ))}
        </View>
      )
  }
}

function SectionView({ ctx, section, first }: { ctx: Ctx; section: Section; first: boolean }) {
  const { t } = ctx
  const mt = first ? 0 : t.rhythm.section
  if (t.layout === 'label') {
    // Europass rhythm: label in the left column, a rule running across the content column.
    return (
      <View style={{ marginTop: mt }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }} minPresenceAhead={36}>
          <View style={{ width: LABEL_W, paddingRight: 10 }}>
            <Heading ctx={ctx} inLabel>
              {section.title}
            </Heading>
          </View>
          <View style={{ flex: 1, borderBottomWidth: 0.6, borderBottomColor: ctx.accent, marginTop: 1 }} />
        </View>
        {section.kind === 'entries' ? (
          <SectionBody ctx={ctx} section={section} />
        ) : (
          <View style={{ paddingLeft: LABEL_W }}>
            <SectionBody ctx={ctx} section={section} />
          </View>
        )}
      </View>
    )
  }
  return (
    <View style={{ marginTop: mt }}>
      <Heading ctx={ctx}>{section.title}</Heading>
      <SectionBody ctx={ctx} section={section} />
    </View>
  )
}

function Contacts({ ctx, separator, align, color }: { ctx: Ctx; separator: string; align: 'left' | 'center'; color?: string }) {
  const { p, t } = ctx
  if (!p.contacts.length) return null
  const vertical = separator === '\n'
  const linkStyle: Style = { color: color ?? t.ink, textDecoration: 'none' }
  if (vertical) {
    return (
      <View>
        {p.contacts.map((c, i) =>
          c.href ? (
            <Link key={i} src={c.href} style={{ ...linkStyle, fontSize: t.size.small }}>
              {c.text}
            </Link>
          ) : (
            <Text key={i} style={{ fontSize: t.size.small, color: color ?? t.ink }}>
              {c.text}
            </Text>
          ),
        )}
      </View>
    )
  }
  return (
    <Text style={{ fontSize: t.size.small, textAlign: align, color: color ?? t.ink }}>
      {p.contacts.map((c, i) => (
        <Text key={i}>
          {i ? <Text style={{ color: '#9a9a9a' }}>{separator}</Text> : null}
          {c.href ? (
            <Link src={c.href} style={linkStyle}>
              {c.text}
            </Link>
          ) : (
            c.text
          )}
        </Text>
      ))}
    </Text>
  )
}

function PersonalLine({ ctx, align, vertical = false }: { ctx: Ctx; align: 'left' | 'center'; vertical?: boolean }) {
  const { p, t } = ctx
  if (!p.personal.length) return null
  if (vertical) {
    return (
      <View style={{ marginTop: 6 }}>
        {p.personal.map((x) => (
          <Text key={x.label} style={{ fontSize: t.size.small }}>
            <Text style={{ color: t.muted }}>{`${x.label}: `}</Text>
            {x.value}
          </Text>
        ))}
      </View>
    )
  }
  return (
    <Text style={{ fontSize: t.size.small, textAlign: align, marginTop: 1.5, color: t.muted }}>
      {p.personal.map((x, i) => `${i ? '   ·   ' : ''}${x.label}: ${x.value}`).join('')}
    </Text>
  )
}

function Header({ ctx }: { ctx: Ctx }) {
  const { p, t, accent } = ctx
  const b = p.cv.basics
  const h = t.header
  const name = h.nameCase === 'upper' ? b.name.toUpperCase() : b.name
  const text = (
    <View style={p.photo ? { flex: 1 } : {}}>
      <Text
        style={{
          fontFamily: t.pdf.name,
          fontSize: t.size.name,
          fontWeight: h.nameWeight,
          letterSpacing: h.nameTracking,
          textAlign: h.align,
          lineHeight: 1.1,
          color: t.layout === 'label' || t.id === 'executive' ? accent : t.ink,
        }}
      >
        {name || ' '}
      </Text>
      {b.headline ? (
        <Text style={{ fontSize: t.size.headline, textAlign: h.align, marginTop: 3, color: t.muted }}>{b.headline}</Text>
      ) : null}
      <View style={{ marginTop: 5 }}>
        <Contacts ctx={ctx} separator={h.contactSeparator} align={h.align} />
        <PersonalLine ctx={ctx} align={h.align} />
      </View>
    </View>
  )
  return (
    <View
      style={{
        marginBottom: t.rhythm.section + 2,
        ...(h.rule ? { paddingBottom: 8, borderBottomWidth: t.id === 'tradesman' ? 2 : 0.8, borderBottomColor: accent } : {}),
      }}
    >
      {p.photo ? (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {text}
          <Image src={p.photo} style={{ width: 66, height: 82, objectFit: 'cover', marginLeft: 14, borderRadius: 2 }} />
        </View>
      ) : (
        text
      )}
    </View>
  )
}

function Closing({ ctx }: { ctx: Ctx }) {
  const { p, t } = ctx
  if (p.closing.kind === 'none') return null
  return (
    <View style={{ marginTop: t.rhythm.section + 6 }} wrap={false}>
      {p.closing.kind === 'declaration' ? <Text style={{ marginBottom: 10 }}>{DECLARATION}</Text> : null}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Text style={{ color: t.muted }}>{todayLine(p.closing.place)}</Text>
        <View style={{ width: 170, borderTopWidth: 0.6, borderTopColor: '#777', paddingTop: 2 }}>
          <Text style={{ fontSize: t.size.small, color: t.muted, textAlign: 'center' }}>{p.closing.name}</Text>
        </View>
      </View>
    </View>
  )
}

function Footer({ ctx, margin }: { ctx: Ctx; margin: number }) {
  const { t, p } = ctx
  return (
    <Text
      fixed
      style={{ position: 'absolute', bottom: margin / 2 - 4, left: margin, right: margin, fontSize: 7.5, color: '#8a8a8a', textAlign: 'right', fontFamily: t.pdf.body }}
      render={({ pageNumber, totalPages }) => (totalPages > 1 ? `${p.cv.basics.name}  ·  ${pageNumber} / ${totalPages}` : '')}
    />
  )
}

function SidebarPage({ ctx, margin }: { ctx: Ctx; margin: number }) {
  const { p, t, accent } = ctx
  const b = p.cv.basics
  const sideHeading = (title: string) => (
    <Text style={{ fontFamily: t.pdf.heading, fontSize: t.size.heading, fontWeight: 600, letterSpacing: t.heading.tracking, color: accent, marginBottom: 5 }}>
      {title.toUpperCase()}
    </Text>
  )
  return (
    <>
      <View fixed style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: SIDEBAR_W, backgroundColor: t.sidebarTint }} />
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: SIDEBAR_W - margin * 0.75 - 4, marginRight: margin * 0.75 + 4 + 18 }}>
          {p.photo ? <Image src={p.photo} style={{ width: 96, height: 118, objectFit: 'cover', marginBottom: 14, borderRadius: 2 }} /> : null}
          {sideHeading('Contact')}
          <Contacts ctx={ctx} separator={'\n'} align="left" />
          <PersonalLine ctx={ctx} align="left" vertical />
          {p.sideSections.map((s) => (
            <View key={s.id} style={{ marginTop: t.rhythm.section }}>
              {sideHeading(s.title)}
              <SectionBody ctx={ctx} section={s} narrow />
            </View>
          ))}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: t.pdf.name, fontSize: t.size.name, fontWeight: 600, letterSpacing: t.header.nameTracking, lineHeight: 1.1 }}>{b.name || ' '}</Text>
          {b.headline ? <Text style={{ fontSize: t.size.headline, color: accent, marginTop: 3, marginBottom: t.rhythm.section }}>{b.headline}</Text> : null}
          {p.sections.map((s, i) => (
            <SectionView key={s.id} ctx={ctx} section={s} first={i === 0 && !b.headline} />
          ))}
          <Closing ctx={ctx} />
        </View>
      </View>
    </>
  )
}

export function CvDocument({ p }: { p: Prepared }) {
  const t = p.theme
  const ctx: Ctx = { p, t, accent: p.accent }
  const margin = p.pageSize === 'A4' ? t.margins.a4 : t.margins.letter
  const s = styles(t, p.accent)
  const b = p.cv.basics
  return (
    <Document title={joinNonEmpty([b.name, 'CV'], ' – ')} author={b.name} subject={b.headline} creator="CVPlate" producer="CVPlate" language="en">
      <Page size={p.pageSize} style={{ ...s.base, paddingTop: margin, paddingBottom: margin, paddingHorizontal: margin, paddingLeft: t.layout === 'sidebar' ? margin * 0.75 : margin }}>
        {t.layout === 'sidebar' ? (
          <SidebarPage ctx={ctx} margin={margin} />
        ) : (
          <>
            <Header ctx={ctx} />
            {p.sections.map((sec, i) => (
              <SectionView key={sec.id} ctx={ctx} section={sec} first={i === 0} />
            ))}
            <Closing ctx={ctx} />
          </>
        )}
        <Footer ctx={ctx} margin={margin} />
      </Page>
    </Document>
  )
}
