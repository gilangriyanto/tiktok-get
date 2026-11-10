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

const timeWib = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TZ,
});

/** "4 Januari 2027, 23.59 WIB" */
export function formatDateTimeWib(iso: string): string {
  const date = new Date(iso);
  return `${longDate.format(date)}, ${timeWib.format(date)} WIB`;
}
