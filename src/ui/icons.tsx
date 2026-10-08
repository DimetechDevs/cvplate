import type { SVGProps } from 'react'

/** 16px stroke icons drawn for this app; one weight, one corner style. */
const Svg = (props: SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props} />
)

export const ChevronDown = () => (
  <Svg>
    <path d="M4 6l4 4 4-4" />
  </Svg>
)
export const ChevronRight = () => (
  <Svg>
    <path d="M6 4l4 4-4 4" />
  </Svg>
)
export const Grip = () => (
  <Svg strokeWidth="0" fill="currentColor">
    <circle cx="6" cy="4" r="1.1" />
    <circle cx="10" cy="4" r="1.1" />
    <circle cx="6" cy="8" r="1.1" />
    <circle cx="10" cy="8" r="1.1" />
    <circle cx="6" cy="12" r="1.1" />
    <circle cx="10" cy="12" r="1.1" />
  </Svg>
)
export const Eye = () => (
  <Svg>
    <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" />
    <circle cx="8" cy="8" r="2" />
  </Svg>
)
export const EyeOff = () => (
  <Svg>
    <path d="M2 2l12 12M6.6 3.7A6.6 6.6 0 018 3.5c4 0 6.5 4.5 6.5 4.5a11 11 0 01-1.9 2.4M10.6 11.9A6 6 0 018 12.5C4 12.5 1.5 8 1.5 8a11 11 0 012.2-2.7" />
  </Svg>
)
export const Trash = () => (
  <Svg>
    <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" />
  </Svg>
)
export const Plus = () => (
  <Svg>
    <path d="M8 3v10M3 8h10" />
  </Svg>
)
export const Copy = () => (
  <Svg>
    <rect x="5" y="5" width="8" height="8" rx="1" />
    <path d="M3 10.5V3.5A.5.5 0 013.5 3h7" />
  </Svg>
)
export const More = () => (
  <Svg strokeWidth="0" fill="currentColor">
    <circle cx="3.5" cy="8" r="1.2" />
    <circle cx="8" cy="8" r="1.2" />
    <circle cx="12.5" cy="8" r="1.2" />
  </Svg>
)
export const Close = () => (
  <Svg>
    <path d="M4 4l8 8M12 4l-8 8" />
  </Svg>
)
export const ArrowUp = () => (
  <Svg>
    <path d="M8 13V3M4 7l4-4 4 4" />
  </Svg>
)
export const ArrowDown = () => (
  <Svg>
    <path d="M8 3v10M4 9l4 4 4-4" />
  </Svg>
)
export const Download = () => (
  <Svg>
    <path d="M8 2.5v8M4.5 7.5L8 11l3.5-3.5M3 13.5h10" />
  </Svg>
)
