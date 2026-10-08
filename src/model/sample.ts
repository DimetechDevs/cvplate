import type { Cv } from './types'
import { createCv, uid } from './factory'

/** A complete fictional CV used for template thumbnails and "Load example". */
export function sampleCv(templateId = 'meridian'): Cv {
  const cv = createCv({ sectorId: 'general', countryId: 'intl', templateId, name: 'Example: Amara Okafor' })
  cv.basics = {
    name: 'Amara Okafor',
    headline: 'Operations Manager',
    email: 'amara.okafor@example.com',
    phone: '+44 7700 900123',
    location: 'Manchester, United Kingdom',
    links: [{ id: uid(), label: 'LinkedIn', url: 'linkedin.com/in/amaraokafor' }],
    photo: '',
    personal: { dateOfBirth: '', nationality: 'British', workRights: '', drivingLicence: 'Full UK licence' },
  }
  cv.sections = [
    {
      id: uid(),
      kind: 'summary',
      title: 'Profile',
      hidden: false,
      text: 'Operations manager with eight years in logistics and retail distribution. Known for turning around under-performing sites through better planning, clear metrics and well-run teams. Currently responsible for a 420-person fulfilment centre shipping 60,000 orders a day.',
    },
    {
      id: uid(),
      kind: 'entries',
      title: 'Experience',
      hidden: false,
      items: [
        {
          id: uid(),
          title: 'Operations Manager',
          org: 'Northgate Fulfilment Ltd',
          location: 'Manchester',
          start: '2021-04',
          end: '',
          current: true,
          note: '',
          bullets: [
            'Run day-to-day operations for a 420-person, three-shift fulfilment centre with a £14m annual budget.',
            'Cut cost per order 18% in two years by redesigning pick paths and introducing labour planning by hour.',
            'Raised on-time dispatch from 91% to 98.6% through a daily tiered KPI review across all shifts.',
            'Led the site through a warehouse management system migration with no lost trading days.',
          ],
        },
        {
          id: uid(),
          title: 'Shift Manager',
          org: 'Halden Retail Distribution',
          location: 'Warrington',
          start: '2018-02',
          end: '2021-03',
          current: false,
          note: '',
          bullets: [
            'Managed a night shift of 120 associates and 6 team leaders across inbound, picking and returns.',
            'Reduced agency spend £310k a year by building a cross-trained core team.',
            'Brought lost-time injuries to zero for 14 consecutive months.',
          ],
        },
        {
          id: uid(),
          title: 'Graduate Supply Chain Analyst',
          org: 'Halden Retail Distribution',
          location: 'Warrington',
          start: '2016-09',
          end: '2018-01',
          current: false,
          note: '',
          bullets: ['Built the weekly volume forecast used to staff three regional sites (MAPE 6%).'],
        },
      ],
    },
    {
      id: uid(),
      kind: 'entries',
      title: 'Education',
      hidden: false,
      items: [
        {
          id: uid(),
          title: 'BSc (Hons) Logistics and Supply Chain Management',
          org: 'Aston University',
          location: 'Birmingham',
          start: '2012-09',
          end: '2016-06',
          current: false,
          note: 'First Class Honours',
          bullets: [],
        },
      ],
    },
    {
      id: uid(),
      kind: 'skills',
      title: 'Skills',
      hidden: false,
      items: [
        { id: uid(), name: 'Operations', keywords: 'Lean, labour planning, KPI design, budgeting, health and safety' },
        { id: uid(), name: 'Systems', keywords: 'Manhattan WMS, SAP, Power BI, Excel (advanced)' },
        { id: uid(), name: 'Leadership', keywords: 'Coaching, change management, union consultation' },
      ],
    },
    {
      id: uid(),
      kind: 'list',
      title: 'Certifications',
      hidden: false,
      items: [
        { id: uid(), title: 'Lean Six Sigma Green Belt', issuer: 'BSI', date: '2020-05', detail: '' },
        { id: uid(), title: 'NEBOSH General Certificate', issuer: 'NEBOSH', date: '2019-03', detail: '' },
      ],
    },
    {
      id: uid(),
      kind: 'languages',
      title: 'Languages',
      hidden: false,
      useCefr: false,
      items: [
        { id: uid(), language: 'English', fluency: 'Native', native: true, cefr: { listening: '', reading: '', interaction: '', production: '', writing: '' } },
        { id: uid(), language: 'Yoruba', fluency: 'Fluent', native: false, cefr: { listening: 'C1', reading: 'B2', interaction: 'C1', production: 'C1', writing: 'B1' } },
        { id: uid(), language: 'French', fluency: 'Intermediate', native: false, cefr: { listening: 'B1', reading: 'B2', interaction: 'B1', production: 'A2', writing: 'A2' } },
      ],
    },
  ]
  return cv
}
