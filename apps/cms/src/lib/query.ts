import type { z } from "zod";

export type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Parse searchParams halaman dengan skema query dari shared.
 * Nilai tidak valid diabaikan per-field sehingga URL rusak tidak membuat halaman error.
 */
export function parseQuery<S extends z.ZodObject>(schema: S, sp: SearchParams): z.output<S> {
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    const value = Array.isArray(v) ? v[0] : v;
    if (value !== undefined && value !== "") flat[k] = value;
  }
  const full = schema.safeParse(flat);
  if (full.success) return full.data;
  const bad = new Set(full.error.issues.map((i) => String(i.path[0])));
  const cleaned = Object.fromEntries(Object.entries(flat).filter(([k]) => !bad.has(k)));
  return schema.parse(cleaned);
}
