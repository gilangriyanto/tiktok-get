import { NextResponse, type NextRequest } from "next/server";
import { getCampaign } from "@/lib/api";
import { CAMPAIGN_STATE_PATH, getCampaignState } from "@/lib/campaign-state";

/**
 * Mengalihkan home & halaman brand ke /belum-mulai atau /berakhir
 * sesuai periode campaign. Halaman voucher (/v/*) tetap bisa dibuka.
 *
 * TODO(api): saat memakai API asli, pertimbangkan cache hasil getCampaign di sini.
 */
export async function proxy(request: NextRequest) {
  let campaign;
  try {
    campaign = await getCampaign();
  } catch {
    return NextResponse.next();
  }

  const state = getCampaignState(campaign, Date.now());
  if (state === "active") return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = CAMPAIGN_STATE_PATH[state];
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/|api/|v/|belum-mulai|berakhir|voucher-kedaluwarsa|syarat-ketentuan|kebijakan-privasi|placeholders/|.*\\..*).*)",
  ],
};
