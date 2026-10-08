# CVPlate: template and standards spec

This is the brief the builder is built against. It covers what the CV formats we reviewed have in common, where countries and sectors differ, and the ten templates we ship along with the rules they follow.

## 1. What we reviewed

We looked at around 50 templates and format guides from these sources:

- **Official and institutional sources:** the Europass CV and its instructions (EU), UK National Careers Service guidance, Harvard and MIT career office résumé guides, and NHS/GMC medical CV structures.
- **Open-source and typesetting templates:** JSON Resume themes, Reactive Resume (12 templates), the LaTeX templates moderncv (classic, banking, casual), Awesome-CV, Jake's Resume and Deedy, plus Overleaf's academic CVs.
- **Commercial template galleries:** the free sets from Microsoft Word, Google Docs (Serif, Swiss, Coral, Spearmint, Modern Writer), Canva, Novoresume, Zety, Enhancv, Resume.io and Kickresume.
- **Country guides:** the US, Canada, UK, Ireland, the EU/Europass, Germany (Lebenslauf), the Gulf states, Nigeria, Kenya, South Africa, India, Australia and Japan (rirekisho, out of scope).

The strong templates share six traits:

1. They use one column, or a narrow label column. The heaviest two-column graphic designs often extract out of order in applicant tracking systems (ATS).
2. They stick to one typeface, or one serif and one sans at most, with body text at 10–11 pt and the name at 18–24 pt.
3. Section headings are plain words that an ATS recognises, such as "Experience" and "Education". Cute labels like "My Journey" don't parse.
4. Entries run most recent first, with dates aligned to the right in one consistent format ("Mar 2022 – Present", with an en-dash).
5. Achievements are written as bullets starting with a verb, with numbers where possible. They aren't paragraphs.
6. Decoration is minimal: one accent colour at most, no skill bars or star ratings (they mean nothing to a reader or an ATS), and no icons in ATS-safe templates.

Weak templates have the opposite traits: skill bars, too many icons, text in images, tables for layout, three fonts, and wasted whitespace.

## 2. Country presets

Choosing a country sets the page size, which personal fields appear and the document label. The user can still override each one.

| Preset | Page | Label | Photo | DOB / nationality | Typical length | Notes |
|---|---|---|---|---|---|---|
| United States | Letter | Résumé | Never | Never | 1 page (2 if 10+ yrs) | No references section. |
| Canada | Letter | Résumé | Never | Never | 1–2 | No SIN. |
| United Kingdom / Ireland | A4 | CV | Never | Never | 2 | "References available on request" is optional. |
| EU (Europass) | A4 | CV | Optional | Optional | 2 | Uses the CEFR language grid. Education goes first for early-career users. |
| Germany / Austria / Switzerland | A4 | Lebenslauf / CV | Common | DOB common | 1–2 | Can close with place, date and signature. |
| Gulf (UAE, KSA, Qatar…) | A4 | CV | Common | Nationality and visa status common | 2–3 | Driving licence is often listed. |
| Africa (NG, KE, ZA, GH) | A4 | CV | Optional | Optional | 2–3 | Referees with contact details are customary. |
| India | A4 | Résumé / CV | Optional | Optional | 1–2 | A closing declaration line is optional. |
| Australia / NZ | A4 | Résumé | Never | Never | 2–3 | Referees are customary. Work rights can be listed. |
| International (default) | A4 | CV | Off | Off | 2 | The safest choice everywhere. |

Date display follows the preset. "Mar 2022" is the default, and Europass uses "03/2022".

## 3. Data model

The data model is a superset of JSON Resume, so users can import and export JSON Resume files.

- **basics:** name, headline, email, phone, location, links[], photo (optional), and personal details (DOB, nationality, visa/work rights, driving licence), each shown only when the preset or the user enables it.
- **summary:** a short profile of 2–4 lines.
- **Sections:** work, education, skills (named groups of keywords, with no levels), languages (fluency text, or a CEFR grid for Europass), certifications and licences, projects, publications, awards, volunteering, references, and any number of custom sections.
- Every section can be renamed (from a list of recognised names), reordered or hidden.

## 4. Sector presets

A sector sets the default section order, suggests sections, and gives each section writing tips and example bullets.

| Sector | Order |
|---|---|
| General / corporate | Summary, Experience, Education, Skills, Certifications |
| Technology / engineering | Summary, Skills, Experience, Projects, Education, Certifications |
| Finance / law / consulting | Experience, Education, Skills & qualifications, Awards |
| Healthcare | Summary, Registration & licences, Clinical experience, Education, Audit & research, CPD, References |
| Academia / research | Education, Appointments, Publications, Grants & awards, Teaching, Conferences, References |
| Education / teaching | Summary, Teaching experience, Qualifications, Certifications, Skills |
| Creative / design / media | Summary, Experience, Selected projects, Skills, Education |
| Skilled trades / construction | Summary, Licences & tickets, Experience, Skills, Education |
| Hospitality / retail / customer service | Summary, Experience, Skills, Certifications, Education |
| Graduate / entry level | Education, Projects, Experience, Volunteering, Skills |
| Executive / leadership | Executive profile, Key achievements, Experience, Board roles, Education |

## 5. Type and spacing rules (all templates)

- The page margins are 16 mm on A4 and 0.65 in on Letter. Body text is set at 10–10.5 pt with 1.3–1.35 line height.
- Spacing uses one scale: 2, 4, 6, 10 and 14 pt. Entries get 6 pt between them, and sections get 14 pt above the heading. No other values are used.
- The name is set at 20–24 pt and the headline at 11 pt. Section headings are 9–10.5 pt in small caps or letterspaced caps, with an optional 0.5 pt rule.
- Dates use tabular figures and are right-aligned on a tab stop.
- Only one accent colour is allowed, and it is applied to headings and rules only. Body text is #1a1a1a, never pure black or grey-on-grey.
- No entry splits across a page break, and no heading is left alone at the bottom of a page.
- Fonts are open-licence and embedded in the PDF. Every PDF font is paired with a Word font so the .docx looks the same when opened in Word. The Carlito/Calibri, Caladea/Cambria and Gelasio/Georgia pairs are metric-compatible, so line breaks match exactly.

## 6. The ten templates

| # | Name | Layout | PDF font → Word font | ATS | Built for |
|---|---|---|---|---|---|
| 1 | **Meridian** | Single column, rules under headings | Carlito → Calibri | ✔ | Default, corporate, admin, hospitality |
| 2 | **Ledger** | Centred name, serif, dense (Harvard style) | Gelasio → Georgia | ✔ | Finance, law, consulting |
| 3 | **Continental** | Europass-style left label column, CEFR grid | Source Sans 3 → Arial | ✔ | EU applications, public sector |
| 4 | **Scholar** | Classic academic CV, multi-page, hanging dates | EB Garamond → Garamond | ✔ | Academia, research |
| 5 | **Clinician** | Single column, registration block up top | Source Sans 3 → Calibri | ✔ | Doctors, nurses, allied health |
| 6 | **Circuit** | Compact, skills first, links inline | IBM Plex Sans → Arial | ✔ | Software, engineering, data |
| 7 | **Studio** | Two column with tinted sidebar, optional photo | Libre Franklin → Franklin Gothic Book | ◐ | Creative, design, media |
| 8 | **Executive** | Serif name, achievements band, generous measure | Caladea + Carlito → Cambria + Calibri | ✔ | Senior leadership |
| 9 | **Foundation** | Education first, light accent | Inter → Arial | ✔ | Students, graduates, career changers |
| 10 | **Tradesman** | Licences and tickets block, availability line | Carlito → Calibri | ✔ | Trades, construction, logistics |

The editor shows a warning on ◐ templates: "Best for direct applications and portfolios. Some ATS systems may misread two-column layouts."

## 7. Exports and drafts

- **PDF:** generated with react-pdf. The text is real, selectable and ATS-parsable, the fonts are embedded, and the file has metadata (title, author). The live preview renders this same PDF, so what the user sees is exactly what they download.
- **Word (.docx):** generated with the `docx` library as native Word structure, so each template's formatting carries over as real Word elements:
  - Paragraphs use named styles (Heading 1/2, List Bullet).
  - Dates are right-aligned with tab stops.
  - Heading rules are paragraph borders.
  - Table cells are used only for Continental's label column and Studio's sidebar.

  The result stays fully editable in Word, Google Docs and LibreOffice.
- **Drafts:** drafts autosave to the browser on every change. Users can keep several CVs (rename, duplicate, delete) and can back up and restore a CV as a JSON file. Accounts and cloud sync come later.

## 8. App UI rules (the "not vibe-coded" list)

- The UI font is Source Sans 3, and IBM Plex Mono is used for small metadata. There is no Inter-on-everything.
- Colours are neutral paper (#f6f5f2) and ink (#1b1b1b), with one accent (deep teal #0f5f5c). There are no gradients, glassmorphism or drop-shadow stacks.
- Corners have a 4 px radius and borders are 1 px. Form controls are 32 px tall on an 8 px grid, with dense, aligned forms and labels above fields.
- No emoji, mascots or marketing filler is used in the app. Copy is short and specific.
- The layout has the editor on the left and the paper preview on the right. On mobile, the editor and preview become tabs.
