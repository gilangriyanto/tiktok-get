import { ClaimListQuerySchema } from "@tiktok-get/shared";
import * as api from "@/lib/api";
import { ApiError } from "@/lib/api-error";
import { parseQuery } from "@/lib/query";
import { sessionFor } from "@/lib/session";

/** GET /claims/export?{filter} → CSV peserta & klaim (admin & super_admin). */
export async function GET(request: Request) {
  try {
    const { token } = await sessionFor("participant:export");
    const sp = Object.fromEntries(new URL(request.url).searchParams);
    const csv = await api.exportClaims(token, parseQuery(ClaimListQuerySchema, sp));
    const stamp = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10).replace(/-/g, "");
    // BOM agar Excel membaca UTF-8 dengan benar.
    return new Response(`﻿${csv}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="peserta-klaim-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    if (e instanceof ApiError) return new Response(e.body.message ?? e.body.code, { status: e.status });
    throw e;
  }
}
