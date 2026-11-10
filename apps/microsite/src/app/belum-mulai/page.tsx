import type { Metadata } from "next";
import { StatusPage } from "@/components/StatusPage";
import { formatLongDate, formatPeriod } from "@/lib/format";
import { getCachedCampaign } from "@/lib/queries";

export const metadata: Metadata = { title: "Campaign belum dimulai — #TikTokGet" };

export default async function NotStartedPage() {
  const campaign = await getCachedCampaign();
  return (
    <StatusPage eyebrow="Segera!" title="Campaign belum dimulai">
      <p>
        #TikTokGet mulai <strong>{formatLongDate(campaign.startAt)}</strong>. Nantikan voucher
        diskon untuk belanja produk favoritmu!
      </p>
      <p className="mt-2 text-sm">Periode {formatPeriod(campaign.startAt, campaign.endAt)}</p>
    </StatusPage>
  );
}
