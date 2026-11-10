import type { Metadata } from "next";
import { Suspense } from "react";
import { can } from "@tiktok-get/shared";
import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import * as api from "@/lib/api";
import { requireSession } from "@/lib/session";
import { CampaignForm } from "./campaign-form";

export const metadata: Metadata = { title: "Pengaturan campaign" };

export default function CampaignPage() {
  return (
    <>
      <PageHeader
        title="Pengaturan campaign"
        description="Periode, retailer, masa berlaku voucher, kuota klaim, anti-abuse, Cara Redeem, dan teks legal."
      />
      <Suspense fallback={<PageSkeleton rows={12} />}>
        <CampaignContent />
      </Suspense>
    </>
  );
}

async function CampaignContent() {
  const { token, user } = await requireSession();
  const settings = await api.getCampaignSettings(token);
  return <CampaignForm initial={settings} readOnly={!can(user.role, "content:write")} />;
}
