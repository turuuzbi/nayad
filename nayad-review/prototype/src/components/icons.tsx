// Decorative inline icons (24px grid, 2px stroke). Always aria-hidden: the text next to
// each icon carries the meaning, so screen readers never hear an icon instead of a word.

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 24, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const LedgerIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z" />
    <path d="M5 17a3 3 0 0 0 3 3M9 8h6M9 12h6" />
  </Svg>
);
export const InvoiceIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
    <path d="M9 8h6M9 12h6M9 16h3" />
  </Svg>
);
export const PaymentIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M6.5 9.5v.01M17.5 14.5v.01" />
  </Svg>
);
export const LoanIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" />
  </Svg>
);
export const InstallIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="6" y="2" width="12" height="20" rx="2.5" />
    <path d="M12 7v7M9 11l3 3 3-3M11 18.5h2" />
  </Svg>
);
export const ShieldIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </Svg>
);
export const LanguageIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 5h16v11H9l-5 4V5z" />
    <path d="M8 9h8M8 12h5" />
  </Svg>
);
export const ArrowRightIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);
export const ChevronDownIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 9l6 6 6-6" />
  </Svg>
);
export const ShareIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3v12M8 7l4-4 4 4M6 11v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8" />
  </Svg>
);
export const DotsIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth={3}>
    <path d="M12 5h.01M12 12h.01M12 19h.01" />
  </Svg>
);
export const MailIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
  </Svg>
);
export const PhoneIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 4h3.5l1.8 4.5-2.3 1.4a11 11 0 0 0 6.1 6.1l1.4-2.3 4.5 1.8V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </Svg>
);
export const CheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12l5 5 9-10" />
  </Svg>
);

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="9" fill="#FFC107" />
      <path
        d="M10.5 22V10l11 12V10"
        fill="none"
        stroke="#1A1A1A"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
