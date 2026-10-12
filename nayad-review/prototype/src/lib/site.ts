// Single place for values the owner must confirm or replace before this goes live.
// Anything in PLACEHOLDER is shown on the page as-is, so it is easy to spot.

export const SITE = {
  name: "NAYAD",
  url: "https://nayad.store",
  // Prototype has no backend: both CTAs land on a stub page that explains this.
  signupUrl: "/app",
  loginUrl: "/app",
  title: "NAYAD — өглөг, падаан, төлөлтийн бүртгэл",
  description:
    "Жижиг бизнест зориулсан өглөг, падаан, төлөлт, зээлийн бүртгэлийн апп. Хэн танд хэдэн төгрөг өртэйг утаснаасаа хараарай.",
  themeColor: "#FFC107",
} as const;

export const PLACEHOLDER = {
  company: "Компанийн нэр",
  phone: "+976 0000 0000",
  phoneHref: "tel:+97600000000",
  email: "hello@example.com",
} as const;
