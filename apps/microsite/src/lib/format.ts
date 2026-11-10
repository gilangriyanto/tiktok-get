const TZ = "Asia/Jakarta";

const shortDate = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "2-digit",
  timeZone: TZ,
});

const longDate = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TZ,
});

/** "30 Nov 26" (WIB) */
export function formatShortDate(iso: string): string {
  return shortDate.format(new Date(iso)).replace(/\./g, "");
}

/** "4 Januari 2027" (WIB) */
export function formatLongDate(iso: string): string {
  return longDate.format(new Date(iso));
}

/** "30 Nov 26 s/d 4 Jan 27" */
export function formatPeriod(startAt: string, endAt: string, separator = " s/d "): string {
  return `${formatShortDate(startAt)}${separator}${formatShortDate(endAt)}`;
}

/** "Rp 8.000" */
export function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}
