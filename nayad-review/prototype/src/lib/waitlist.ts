// Validation for the pricing waitlist form. Pure functions so they can be unit tested.

export type ContactKind = "phone" | "email";

export type ValidationResult = { ok: true; value: string } | { ok: false; error: string };

// Mongolian mobile and landline numbers are 8 digits. Accept spaces/dashes and an optional +976.
export function normalizePhone(input: string): string {
  const digits = input.replace(/[\s\-()]/g, "").replace(/^(\+?976)(?=\d{8}$)/, "");
  return digits;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(kind: ContactKind, raw: string): ValidationResult {
  const input = raw.trim();
  if (kind === "phone") {
    if (!input) return { ok: false, error: "Утасны дугаараа оруулна уу." };
    const phone = normalizePhone(input);
    if (!/^\d{8}$/.test(phone)) {
      return { ok: false, error: "Утасны дугаар 8 оронтой байна. Жишээ нь: 9911 2233" };
    }
    return { ok: true, value: phone };
  }
  if (!input) return { ok: false, error: "Имэйл хаягаа оруулна уу." };
  if (!EMAIL_RE.test(input)) {
    return { ok: false, error: "Имэйл хаяг буруу байна. Жишээ нь: ner@gmail.com" };
  }
  return { ok: true, value: input.toLowerCase() };
}
