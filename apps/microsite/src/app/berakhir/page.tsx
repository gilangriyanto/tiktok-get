import type { Metadata } from "next";
import { StatusPage } from "@/components/StatusPage";
import { formatPeriod } from "@/lib/format";
import { getCachedCampaign } from "@/lib/queries";

export const metadata: Metadata = { title: "Campaign telah berakhir — #TikTokGet" };

export default async function EndedPage() {
  const campaign = await getCachedCampaign();
  return (
    <StatusPage title="Campaign telah berakhir">
      <p>
        Terima kasih sudah ikut #TikTokGet periode{" "}
        {formatPeriod(campaign.startAt, campaign.endAt)}. Nantikan promo berikutnya!
      </p>
      <p className="mt-2 text-sm">
        Voucher yang sudah diklaim tetap bisa dibuka lewat link voucher masing-masing selama masih
        berlaku.
      </p>
    </StatusPage>
  );
}
