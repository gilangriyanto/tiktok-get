const TZ = "Asia/Jakarta";

const dateTime = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TZ,
});

const dateOnly = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: TZ,
});

/** "10 Des 2026 23.59 WIB" */
export function formatDateTime(iso: string | null | undefined): string {
  return iso ? `${dateTime.format(new Date(iso)).replace(/\./g, ":").replace(",", "")} WIB` : "—";
}

/** "10 Des 2026" */
export function formatDate(iso: string | null | undefined): string {
  return iso ? dateOnly.format(new Date(iso)) : "—";
}

/** "Rp 8.000" */
export function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

/** ISO (offset apa pun) → nilai <input type="datetime-local"> dalam WIB. */
export function isoToWibInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return "";
  return new Date(ms + 7 * 3600_000).toISOString().slice(0, 16);
}

/** Nilai <input type="datetime-local"> (dianggap WIB) → ISO +07:00. */
export function wibInputToIso(value: string): string {
  return value ? `${value.length === 16 ? `${value}:00` : value}+07:00` : "";
}
