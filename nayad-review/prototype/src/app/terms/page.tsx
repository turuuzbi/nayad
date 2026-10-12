import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Үйлчилгээний нөхцөл",
  description: "NAYAD үйлчилгээг ашиглах нөхцөл.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Үйлчилгээний нөхцөл"
      sections={[
        { title: "Үйлчилгээний тухай", body: "NAYAD юу хийдэг, юу хийдэггүй (жишээ нь нягтлан бодох бүртгэл, татварын тайланг орлохгүй)." },
        { title: "Бүртгэл ба нууц үг", body: "Бүртгэлээ хамгаалах хэрэглэгчийн үүрэг, хуваалцахгүй байх." },
        { title: "Төлбөр", body: "Үнийн төлөвлөгөө зарлагдсаны дараа энд тусгагдана." },
        { title: "Таны мэдээлэл", body: "Оруулсан мэдээллийн өмчлөл таных болохыг, экспорт хийх боломж." },
        { title: "Хариуцлагын хязгаар", body: "Тасалдал, өгөгдөл алдагдах үеийн хариуцлага, нөөцлөлт." },
        { title: "Нөхцөлийн өөрчлөлт", body: "Өөрчлөлтийг хэрхэн, хэдий хугацааны өмнө мэдэгдэх." },
      ]}
    />
  );
}
