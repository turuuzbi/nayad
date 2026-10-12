import { InstallIcon, InvoiceIcon, LedgerIcon, LoanIcon, PaymentIcon, ShieldIcon } from "./icons";

// Only capabilities named in the product brief. Anything more specific must be confirmed
// by the owner first (see prototype README, "Claims to confirm").
const FEATURES = [
  { icon: LedgerIcon, title: "Өглөг", text: "Харилцагч бүр танд хэдэн төгрөг өртэйг тус тусад нь харна." },
  { icon: InvoiceIcon, title: "Падаан", text: "Өгсөн бараа, үйлчилгээгээ падаанаар бичиж, баримттай болно." },
  { icon: PaymentIcon, title: "Төлөлт", text: "Төлөлт бүртгэх бүрд харилцагчийн үлдэгдэл шинэчлэгдэнэ." },
  { icon: LoanIcon, title: "Зээл", text: "Бизнесийнхээ зээлийг бүртгэж, хэдийг төлж, хэд үлдсэнээ мэднэ." },
  {
    icon: InstallIcon,
    title: "Утсандаа суулгана",
    text: "App Store, Play Store хэрэггүй. Хөтчөөсөө шууд нүүр дэлгэцэндээ нэмнэ.",
  },
  { icon: ShieldIcon, title: "Хялбар нэвтрэлт", text: "Утасны дугаар, Google эсвэл Face ID-гаар нэвтэрнэ." },
];

export function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 id="features-title" className="text-3xl font-extrabold tracking-tight md:text-4xl">
          Тооцоогоо цэгцлэх бүх зүйл
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-muted">
          Дэлгүүр, үйлчилгээ, бөөний худалдаа — зээлээр бараа өгдөг бизнес бүрт зориулсан.
        </p>
        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4 rounded-2xl border border-line bg-surface p-4 sm:flex-col sm:p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-on-brand">
                <Icon size={22} />
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-1 leading-relaxed text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
