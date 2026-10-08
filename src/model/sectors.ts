import type { SectionKind } from './types'

export interface SectionBlueprint {
  kind: SectionKind
  title: string
  /** One-line guidance shown above the section in the editor. */
  tip?: string
  /** Example bullets or entries the user can borrow. */
  examples?: string[]
}

export interface SectorPreset {
  id: string
  label: string
  template: string
  headlineHint: string
  summaryTip: string
  summaryExample: string
  sections: SectionBlueprint[]
  keywords: string[]
}

const summary = (tip: string): SectionBlueprint => ({ kind: 'summary', title: 'Profile', tip })
const skills: SectionBlueprint = {
  kind: 'skills',
  title: 'Skills',
  tip: 'Group skills by type. Use the exact terms from the job advert so applicant tracking systems match them.',
}
const languages: SectionBlueprint = { kind: 'languages', title: 'Languages' }
const certs = (title = 'Certifications', tip?: string): SectionBlueprint => ({ kind: 'list', title, tip })
const education = (tip?: string): SectionBlueprint => ({
  kind: 'entries',
  title: 'Education',
  tip: tip ?? 'Most recent first. Add grades only when they help (e.g. First Class, 3.8 GPA, Distinction).',
})
const references: SectionBlueprint = { kind: 'references', title: 'References' }

export const SECTORS: SectorPreset[] = [
  {
    id: 'general',
    label: 'General / corporate',
    template: 'meridian',
    headlineHint: 'Operations Manager',
    summaryTip: 'Three lines: who you are, what you are best at, and what you want next.',
    summaryExample:
      'Operations manager with 8 years in logistics and retail. Cut fulfilment costs 18% at a 400-person distribution centre. Looking to lead regional operations.',
    sections: [
      summary('Three lines: who you are, what you are best at, and what you want next.'),
      {
        kind: 'entries',
        title: 'Experience',
        tip: 'Start each bullet with a verb and end with a result. Numbers beat adjectives.',
        examples: [
          'Led a team of 14 across two shifts; reduced overtime 22% in the first year.',
          'Introduced a weekly KPI review that lifted on-time delivery from 91% to 97%.',
          'Negotiated new carrier contracts, saving £340k annually.',
        ],
      },
      education(),
      skills,
      certs(),
      languages,
    ],
    keywords: ['stakeholder management', 'budgeting', 'process improvement', 'reporting', 'team leadership'],
  },
  {
    id: 'tech',
    label: 'Technology / engineering',
    template: 'circuit',
    headlineHint: 'Senior Software Engineer',
    summaryTip: 'Name your core stack and the scale you have worked at.',
    summaryExample:
      'Backend engineer with 6 years building payment systems in Go and PostgreSQL. Designed services handling 3,000 requests per second at 99.95% availability.',
    sections: [
      summary('Name your core stack and the scale you have worked at.'),
      {
        kind: 'skills',
        title: 'Technical skills',
        tip: 'Group as Languages, Frameworks, Infrastructure, Data. List only what you would be happy to be interviewed on.',
      },
      {
        kind: 'entries',
        title: 'Experience',
        tip: 'Describe the problem, what you built, and the measurable outcome (latency, cost, users, revenue).',
        examples: [
          'Rebuilt the billing pipeline as event-driven services; cut invoice errors 87% and month-end close from 5 days to 1.',
          'Reduced p95 API latency from 820 ms to 140 ms by introducing read replicas and query caching.',
          'Mentored 4 engineers; two promoted within a year.',
        ],
      },
      {
        kind: 'entries',
        title: 'Projects',
        tip: 'Open-source work, side projects or hackathons. Link the repo or demo.',
      },
      education(),
      certs('Certifications', 'Cloud and security certifications (AWS, Azure, CKA, CISSP) with the year obtained.'),
    ],
    keywords: ['TypeScript', 'Python', 'AWS', 'Kubernetes', 'CI/CD', 'system design', 'SQL'],
  },
  {
    id: 'finance',
    label: 'Finance / law / consulting',
    template: 'ledger',
    headlineHint: 'Associate, Corporate Finance',
    summaryTip: 'Often omitted in these sectors. If used, keep it to two lines.',
    summaryExample: '',
    sections: [
      {
        kind: 'entries',
        title: 'Experience',
        tip: 'Lead with deal size, client type and your role. Keep client names confidential where required.',
        examples: [
          'Built the operating model for a $1.2bn take-private of a European logistics business.',
          'Drafted share purchase agreements for 6 mid-market acquisitions (£20–150m).',
          'Advised a FTSE 250 retailer on a cost programme delivering £45m run-rate savings.',
        ],
      },
      education('Include classification or GPA, honours and relevant modules. Professional exams (CFA, ACA, LPC, SQE) go here or in Qualifications.'),
      { kind: 'skills', title: 'Skills & qualifications', tip: 'Technical tools (Excel modelling, Bloomberg, Capital IQ), languages, admissions.' },
      certs('Awards', 'Scholarships, prizes, rankings.'),
    ],
    keywords: ['financial modelling', 'due diligence', 'valuation', 'M&A', 'regulatory', 'client management'],
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    template: 'clinician',
    headlineHint: 'Specialty Registrar, Emergency Medicine',
    summaryTip: 'State your grade, specialty and the setting you want to work in.',
    summaryExample:
      'ST4 emergency medicine registrar with 18 months in a major trauma centre. Interested in pre-hospital care and simulation teaching.',
    sections: [
      summary('State your grade, specialty and the setting you want to work in.'),
      certs('Registration & licences', 'Registration body, number and status (e.g. GMC 7654321, full registration with licence to practise; NMC PIN; state licence).'),
      {
        kind: 'entries',
        title: 'Clinical experience',
        tip: 'Grade, specialty, hospital and dates. Mention case mix, procedures and responsibilities.',
        examples: [
          'Managed a 28-bed acute medical unit overnight as the most senior on-site doctor.',
          'Performed 40+ supervised chest drain insertions and central lines.',
        ],
      },
      education('Medical or nursing degree, intercalated degrees, postgraduate exams (MRCP, MRCS, FRCEM).'),
      certs('Courses & CPD', 'ALS, ATLS, APLS and other courses with year of completion.'),
      { kind: 'entries', title: 'Audit, quality improvement & research' },
      { kind: 'list', title: 'Teaching' },
      references,
    ],
    keywords: ['patient safety', 'clinical governance', 'audit', 'multidisciplinary team', 'triage'],
  },
  {
    id: 'academia',
    label: 'Academia / research',
    template: 'scholar',
    headlineHint: 'Postdoctoral Research Fellow, Computational Biology',
    summaryTip: 'Academic CVs usually skip the profile. A research statement goes in your cover letter.',
    summaryExample: '',
    sections: [
      education('PhD first: thesis title, supervisor, institution and year.'),
      { kind: 'entries', title: 'Academic appointments' },
      certs('Publications', 'Use the citation style of your field. Bold your own name in author lists.'),
      certs('Grants & awards', 'Funder, amount and year. Say whether you were PI or co-I.'),
      { kind: 'entries', title: 'Teaching' },
      certs('Conference presentations'),
      { kind: 'list', title: 'Service', tip: 'Peer review, committees, organising.' },
      references,
    ],
    keywords: ['peer-reviewed', 'principal investigator', 'grant funding', 'supervision'],
  },
  {
    id: 'education',
    label: 'Education / teaching',
    template: 'meridian',
    headlineHint: 'Secondary Mathematics Teacher',
    summaryTip: 'Subject, age range, curriculum and one result you are proud of.',
    summaryExample:
      'Qualified secondary mathematics teacher with 5 years teaching GCSE and A-level. 82% of my 2025 GCSE class achieved grade 6 or above.',
    sections: [
      summary('Subject, age range, curriculum and one result you are proud of.'),
      {
        kind: 'entries',
        title: 'Teaching experience',
        tip: 'School, subjects, key stages or grades taught, extra responsibilities.',
        examples: ['Raised Year 11 mathematics pass rate from 64% to 79% over two years.', 'Led the department’s move to mastery-based schemes of work for KS3.'],
      },
      education(),
      certs('Qualifications', 'Teaching licence or QTS, PGCE, B.Ed, TEFL/CELTA, safeguarding training.'),
      skills,
      references,
    ],
    keywords: ['curriculum design', 'differentiation', 'assessment', 'safeguarding', 'classroom management'],
  },
  {
    id: 'creative',
    label: 'Creative / design / media',
    template: 'studio',
    headlineHint: 'Product Designer',
    summaryTip: 'Your discipline, the kinds of products or clients, and a link to your portfolio.',
    summaryExample:
      'Product designer with 7 years shaping consumer fintech apps used by 2M+ people. Portfolio: example.com/work',
    sections: [
      summary('Your discipline, the kinds of products or clients, and a link to your portfolio.'),
      {
        kind: 'entries',
        title: 'Experience',
        examples: ['Redesigned onboarding, lifting completion from 41% to 68%.', 'Built and maintained a design system used by 9 product teams.'],
      },
      { kind: 'entries', title: 'Selected projects', tip: 'Three to five projects, each with your role and the result.' },
      skills,
      education(),
      certs('Awards & exhibitions'),
    ],
    keywords: ['Figma', 'user research', 'prototyping', 'design systems', 'brand identity'],
  },
  {
    id: 'trades',
    label: 'Skilled trades / construction',
    template: 'tradesman',
    headlineHint: 'Qualified Electrician',
    summaryTip: 'Trade, qualification level, years on the tools and the kinds of sites.',
    summaryExample: 'Fully qualified electrician (NVQ Level 3, 18th Edition) with 9 years on commercial and residential sites. Own tools and full driving licence.',
    sections: [
      summary('Trade, qualification level, years on the tools and the kinds of sites.'),
      certs('Licences & tickets', 'Trade licence, safety cards (CSCS, OSHA 30, White Card), plant tickets, with expiry dates.'),
      {
        kind: 'entries',
        title: 'Experience',
        examples: ['Completed first and second fix on 46 new-build homes to schedule.', 'Zero reportable safety incidents across 4 years as site supervisor.'],
      },
      skills,
      education('Apprenticeships and trade school.'),
      references,
    ],
    keywords: ['health and safety', 'blueprint reading', 'installation', 'maintenance', 'compliance'],
  },
  {
    id: 'hospitality',
    label: 'Hospitality / retail / customer service',
    template: 'meridian',
    headlineHint: 'Front of House Supervisor',
    summaryTip: 'The setting you work in, the team size and your strongest service skill.',
    summaryExample: 'Front of house supervisor with 5 years in high-volume restaurants (300+ covers). Trained 20+ new starters and kept guest satisfaction above 4.7/5.',
    sections: [
      summary('The setting you work in, the team size and your strongest service skill.'),
      {
        kind: 'entries',
        title: 'Experience',
        examples: ['Supervised a team of 12 across lunch and dinner service.', 'Increased average spend per cover 9% through upselling training.'],
      },
      skills,
      certs('Certifications', 'Food hygiene, licensing, first aid.'),
      education(),
      languages,
    ],
    keywords: ['customer service', 'cash handling', 'POS', 'stock control', 'team training'],
  },
  {
    id: 'graduate',
    label: 'Graduate / entry level',
    template: 'foundation',
    headlineHint: 'BSc Economics graduate',
    summaryTip: 'Your degree, what you are good at, and the role you are looking for.',
    summaryExample: 'Economics graduate (First Class) with internship experience in market research. Looking for an analyst role where I can use Python and statistics.',
    sections: [
      summary('Your degree, what you are good at, and the role you are looking for.'),
      education('Put this first. Include your dissertation, relevant modules and grade.'),
      { kind: 'entries', title: 'Projects', tip: 'Coursework, dissertations, societies, competitions: anything that shows the skills the role needs.' },
      { kind: 'entries', title: 'Experience', tip: 'Internships, part-time jobs and placements all count. Say what you learned or achieved.' },
      { kind: 'entries', title: 'Volunteering' },
      skills,
      languages,
    ],
    keywords: ['analysis', 'teamwork', 'communication', 'Excel', 'research'],
  },
  {
    id: 'executive',
    label: 'Executive / leadership',
    template: 'executive',
    headlineHint: 'Chief Operating Officer',
    summaryTip: 'Scope (revenue, headcount, geography) and the kind of transformation you lead.',
    summaryExample:
      'COO with 20 years leading operations in consumer goods across EMEA. Ran a £600m P&L and 3,200 people; delivered two turnarounds to profitability.',
    sections: [
      { kind: 'summary', title: 'Executive profile', tip: 'Scope (revenue, headcount, geography) and the kind of transformation you lead.' },
      { kind: 'list', title: 'Key achievements', tip: 'Three to five headline results from your whole career.' },
      { kind: 'entries', title: 'Experience' },
      { kind: 'list', title: 'Board & advisory roles' },
      education(),
    ],
    keywords: ['P&L', 'transformation', 'M&A integration', 'board reporting', 'strategy'],
  },
]

export const sectorById = (id: string): SectorPreset => SECTORS.find((s) => s.id === id) ?? SECTORS[0]

/** Finds the blueprint guidance for a section by its title within a sector, for editor tips. */
export function blueprintFor(sectorId: string, title: string): SectionBlueprint | undefined {
  const t = title.trim().toLowerCase()
  return sectorById(sectorId).sections.find((s) => s.title.toLowerCase() === t)
}

/** Recognised section names that ATS parsers map reliably. Offered as suggestions when renaming. */
export const STANDARD_TITLES = [
  'Profile',
  'Summary',
  'Experience',
  'Work experience',
  'Education',
  'Skills',
  'Technical skills',
  'Certifications',
  'Licences & certifications',
  'Languages',
  'Projects',
  'Publications',
  'Awards',
  'Volunteering',
  'Interests',
  'References',
]
