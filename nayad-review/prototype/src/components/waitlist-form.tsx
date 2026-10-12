"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { validateContact, type ContactKind } from "@/lib/waitlist";

const KINDS: { value: ContactKind; label: string }[] = [
  { value: "phone", label: "Утас" },
  { value: "email", label: "Имэйл" },
];

// Prototype stub: validates on the client and shows a confirmation. Nothing is sent anywhere.
// To go live, post `{ kind, value }` to a server action with rate limiting and a consent record.
export function WaitlistForm() {
  const id = useId();
  const [kind, setKind] = useState<ContactKind>("phone");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = validateContact(kind, value);
    if (!result.ok) {
      setError(result.error);
      inputRef.current?.focus();
      return;
    }
    setError(null);
    setSaved(kind === "phone" ? `${result.value.slice(0, 4)} ${result.value.slice(4)}` : result.value);
    requestAnimationFrame(() => statusRef.current?.focus());
  }

  const isPhone = kind === "phone";
  const describedBy = error ? `${id}-error` : `${id}-hint`;

  return (
    <div>
      {saved === null && (
        <form noValidate onSubmit={onSubmit} aria-label="Үнийн мэдээлэл гармагц мэдэгдэл авах">
          <fieldset>
            <legend className="text-sm font-semibold">Хаашаа мэдэгдэх вэ?</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {KINDS.map((k) => (
                <label
                  key={k.value}
                  className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3 font-semibold has-[:checked]:border-ink has-[:checked]:bg-surface-2"
                >
                  <input
                    type="radio"
                    name="kind"
                    value={k.value}
                    checked={kind === k.value}
                    onChange={() => {
                      setKind(k.value);
                      setValue("");
                      setError(null);
                    }}
                    className="size-4"
                    style={{ accentColor: "var(--focus)" }}
                  />
                  {k.label}
                </label>
              ))}
            </div>
          </fieldset>

          <label htmlFor={`${id}-contact`} className="mt-4 block text-sm font-semibold">
            {isPhone ? "Утасны дугаар" : "Имэйл хаяг"}
          </label>
          <input
            ref={inputRef}
            id={`${id}-contact`}
            name="contact"
            type={isPhone ? "tel" : "email"}
            autoComplete={isPhone ? "tel-national" : "email"}
            placeholder={isPhone ? "9911 2233" : "ner@gmail.com"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={`mt-1.5 block min-h-12 w-full rounded-xl border bg-surface px-4 text-base placeholder:text-muted/80 ${
              error ? "border-danger" : "border-line"
            }`}
          />
          {error ? (
            <p id={`${id}-error`} className="mt-2 text-sm font-medium text-danger">
              {error}
            </p>
          ) : (
            <p id={`${id}-hint`} className="mt-2 text-sm text-muted">
              {isPhone ? "8 оронтой дугаар. Зөвхөн үнийн мэдээлэл илгээнэ." : "Зөвхөн үнийн мэдээлэл илгээнэ."}
            </p>
          )}

          <button
            type="submit"
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-brand px-6 font-bold text-on-brand hover:bg-brand-strong"
          >
            Мэдэгдэл авах
          </button>
        </form>
      )}

      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className={saved ? "rounded-xl border border-line bg-surface-2 p-4" : "sr-only"}
      >
        {saved && (
          <>
            <p className="font-bold">Баярлалаа!</p>
            <p className="mt-1">Үнийн мэдээлэл гармагц танд мэдэгдэнэ.</p>
            <p className="mt-1">
              Бүртгэсэн: <span className="font-semibold">{saved}</span>
            </p>
            <p className="mt-2 text-xs text-muted">Загвар хувилбар: энэ мэдээлэл хаана ч илгээгдээгүй.</p>
          </>
        )}
      </div>
    </div>
  );
}
