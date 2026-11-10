"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  ClaimFormSchema,
  GENDER_LABELS,
  GenderSchema,
  type Brand,
  type ClaimFormInput,
  type Product,
} from "@tiktok-get/shared";
import { claimVoucher, type ClaimFailureCode } from "@/lib/api";
import { getStoredSource } from "@/lib/source";
import { Button } from "./Button";
import { TurnstileWidget } from "./TurnstileWidget";

type Props = {
  brand: Pick<Brand, "name">;
  product: Product;
  onClose: () => void;
  /** Dipanggil saat API melaporkan stok produk habis. */
  onOutOfStock: (product: Product) => void;
};

type Field = keyof ClaimFormInput;
/** Nilai mentah dari input (select gender bisa masih kosong). */
type FormState = Record<Field, string>;
type FieldErrors = Partial<Record<Field, string>>;

const FIELDS: readonly Field[] = ["fullName", "phone", "gender", "age"];
const EMPTY: FormState = { fullName: "", phone: "", gender: "", age: "" };

function isField(key: PropertyKey | undefined): key is Field {
  return typeof key === "string" && (FIELDS as readonly string[]).includes(key);
}

const ERROR_COPY: Record<ClaimFailureCode, { title: string; body: string }> = {
  QUOTA_EXCEEDED: {
    title: "Maaf, kuota habis!",
    body: "Anda sudah mencapai batas maksimum penukaran voucher.",
  },
  OUT_OF_STOCK: {
    title: "Maaf, voucher produk ini baru saja habis",
    body: "Coba pilih produk lain yang masih tersedia.",
  },
  RATE_LIMITED: {
    title: "Terlalu banyak percobaan",
    body: "Silakan tunggu sebentar lalu coba lagi.",
  },
  CAMPAIGN_INACTIVE: {
    title: "Campaign sedang tidak aktif",
    body: "Voucher belum bisa diklaim saat ini.",
  },
  VALIDATION: { title: "Data belum valid", body: "Periksa kembali isian form." },
  UNKNOWN: { title: "Terjadi kesalahan", body: "Periksa koneksi internet lalu coba lagi." },
};

function validate(values: FormState) {
  const result = ClaimFormSchema.safeParse(values);
  const errors: FieldErrors = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (isField(field)) errors[field] ??= issue.message;
    }
  }
  return { result, errors };
}

function FieldError({ id, message }: { id: string; message: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-sm font-semibold text-yellow-100">
      {message}
    </p>
  );
}

const inputClass =
  "min-h-12 w-full rounded-sm border border-white/50 bg-white/25 px-4 text-lg text-white placeholder:text-white/90 focus:bg-white/35 aria-invalid:border-yellow-200";

export function ClaimModal({ brand, product, onClose, onOutOfStock }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [values, setValues] = useState<FormState>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<ClaimFailureCode | null>(null);

  const { result, errors } = validate(values);
  const canSubmit =
    result.success && turnstileToken !== null && !submitting && failure !== "OUT_OF_STOCK";

  // Buka sebagai modal (fokus terkunci + Esc native) dan kunci scroll background.
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      dialog?.close();
    };
  }, []);

  const handleToken = useCallback((token: string | null) => setTurnstileToken(token), []);

  function update(field: Field, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    setFailure(null);
  }

  function errorFor(field: Field): string | undefined {
    return touched[field] ? errors[field] : undefined;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched({ fullName: true, phone: true, gender: true, age: true });
    if (!result.success || !turnstileToken || submitting) return;

    setSubmitting(true);
    setFailure(null);
    const res = await claimVoucher({
      productSlug: product.slug,
      ...result.data,
      source: getStoredSource(),
      turnstileToken,
    });

    if (res.ok) {
      router.push(`/v/${encodeURIComponent(res.data.viewToken)}`);
      return; // tetap dalam state loading sampai navigasi selesai
    }
    setSubmitting(false);
    setFailure(res.error.code);
    if (res.error.code === "OUT_OF_STOCK") onOutOfStock(product);
  }

  const fieldIds = {
    fullName: `${id}-name`,
    phone: `${id}-phone`,
    gender: `${id}-gender`,
    age: `${id}-age`,
  } satisfies Record<Field, string>;

  function describedBy(field: Field) {
    return errorFor(field) ? `${fieldIds[field]}-error` : undefined;
  }

  function errorProps(field: Field) {
    return { id: `${fieldIds[field]}-error`, message: errorFor(field) };
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-desc`}
      onClose={onClose}
      className="m-auto max-h-dvh w-[calc(100%-2rem)] max-w-md overflow-y-auto bg-transparent p-0 text-white backdrop:bg-[rgb(160_8_45/0.78)] backdrop:backdrop-blur-[2px]"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 py-4">
        <div className="relative rounded-card border border-white/40 bg-linear-to-b from-pink to-pink-deep px-5 pt-5 pb-6 shadow-glow-pink">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Tutup"
            className="absolute top-2 right-2 flex size-11 items-center justify-center"
          >
            <span
              aria-hidden
              className="flex size-7 items-center justify-center rounded-full bg-white text-xl leading-none font-bold text-pink"
            >
              ×
            </span>
          </button>

          <h2 id={`${id}-title`} className="font-heading pr-10 text-2xl">
            <span className="text-mint">#TikTokGet</span>
            <span className="text-black">{brand.name}</span>
          </h2>
          <p id={`${id}-desc`} className="mt-6 text-xl leading-snug font-bold text-mint">
            Lengkapi form berikut untuk mendapatkan <span className="text-black">vouchermu!</span>
          </p>
          <p className="mt-1 text-sm text-white/90">
            {product.name} {product.variant}
          </p>

          <div className="mt-4 flex flex-col gap-3">
            <div>
              <label htmlFor={fieldIds.fullName} className="sr-only">
                Nama Lengkap
              </label>
              <input
                id={fieldIds.fullName}
                name="fullName"
                autoComplete="name"
                placeholder="Nama Lengkap"
                maxLength={100}
                value={values.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
                aria-invalid={Boolean(errorFor("fullName"))}
                aria-describedby={describedBy("fullName")}
                className={inputClass}
              />
              <FieldError {...errorProps("fullName")} />
            </div>

            <div>
              <label htmlFor={fieldIds.phone} className="sr-only">
                No. HP
              </label>
              <input
                id={fieldIds.phone}
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="No. HP"
                maxLength={16}
                value={values.phone}
                onChange={(e) => update("phone", e.target.value.replace(/[^\d+\s-]/g, ""))}
                onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                aria-invalid={Boolean(errorFor("phone"))}
                aria-describedby={describedBy("phone")}
                className={inputClass}
              />
              <FieldError {...errorProps("phone")} />
            </div>

            <div>
              <label htmlFor={fieldIds.gender} className="sr-only">
                Jenis Kelamin
              </label>
              <select
                id={fieldIds.gender}
                name="gender"
                value={values.gender}
                onChange={(e) => update("gender", e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, gender: true }))}
                aria-invalid={Boolean(errorFor("gender"))}
                aria-describedby={describedBy("gender")}
                className={`${inputClass} select-arrow pr-10`}
              >
                <option value="" disabled className="text-black">
                  Jenis Kelamin
                </option>
                {GenderSchema.options.map((g) => (
                  <option key={g} value={g} className="text-black">
                    {GENDER_LABELS[g]}
                  </option>
                ))}
              </select>
              <FieldError {...errorProps("gender")} />
            </div>

            <div>
              <label htmlFor={fieldIds.age} className="sr-only">
                Umur
              </label>
              <input
                id={fieldIds.age}
                name="age"
                inputMode="numeric"
                placeholder="Umur"
                maxLength={2}
                value={values.age}
                onChange={(e) => update("age", e.target.value.replace(/\D/g, ""))}
                onBlur={() => setTouched((t) => ({ ...t, age: true }))}
                aria-invalid={Boolean(errorFor("age"))}
                aria-describedby={describedBy("age")}
                className={inputClass}
              />
              <FieldError {...errorProps("age")} />
            </div>
          </div>

          <TurnstileWidget onToken={handleToken} />
        </div>

        <div>
          <Button
            type="submit"
            size="lg"
            disabled={!canSubmit}
            aria-busy={submitting}
            className="w-full"
          >
            {submitting ? (
              <>
                <span
                  aria-hidden
                  className="mr-3 size-6 animate-spin rounded-full border-3 border-white/40 border-t-white"
                />
                Memproses…
              </>
            ) : (
              "Daftar"
            )}
          </Button>
          <p className="mt-3 text-center text-xs text-white/90">
            Dengan menekan Daftar, kamu menyetujui{" "}
            <Link href="/syarat-ketentuan" target="_blank" className="underline">
              Syarat &amp; Ketentuan
            </Link>{" "}
            dan{" "}
            <Link href="/kebijakan-privasi" target="_blank" className="underline">
              Kebijakan Privasi
            </Link>
          </p>
        </div>

        <div aria-live="assertive">
          {failure && (
            <div
              role="alert"
              className="rounded-card border-2 border-pink bg-black px-5 py-6 text-center shadow-glow-pink"
            >
              <p className="text-2xl font-bold text-pink">{ERROR_COPY[failure].title}</p>
              <p className="mt-1 text-pink/95">{ERROR_COPY[failure].body}</p>
            </div>
          )}
        </div>
      </form>
    </dialog>
  );
}
