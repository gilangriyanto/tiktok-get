import type { Campaign } from "@tiktok-get/shared";
import { USE_MOCK } from "./api";

export type CampaignState = "upcoming" | "active" | "ended";

const STATES: readonly CampaignState[] = ["upcoming", "active", "ended"];

/**
 * Status campaign berdasarkan startAt/endAt.
 * Mode mock: NEXT_PUBLIC_MOCK_CAMPAIGN_STATE (active|upcoming|ended) memaksa status;
 * "dates" memakai tanggal asli; kosong = "active" agar mock bisa langsung dicoba.
 */
export function getCampaignState(campaign: Campaign, now: number): CampaignState {
  if (USE_MOCK) {
    const forced = process.env.NEXT_PUBLIC_MOCK_CAMPAIGN_STATE ?? "";
    if (forced === "") return "active";
    const match = STATES.find((s) => s === forced);
    if (match) return match;
  }
  if (now < Date.parse(campaign.startAt)) return "upcoming";
  if (now > Date.parse(campaign.endAt)) return "ended";
  return "active";
}

export const CAMPAIGN_STATE_PATH: Record<Exclude<CampaignState, "active">, string> = {
  upcoming: "/belum-mulai",
  ended: "/berakhir",
};
