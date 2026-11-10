import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import * as api from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl tabular-nums">{typeof value === "number" ? value.toLocaleString("id-ID") : value}</CardTitle>
      </CardHeader>
      {hint && <CardContent className="-mt-2 text-xs text-muted-foreground">{hint}</CardContent>}
    </Card>
  );
}

async function Dashboard() {
  const { token } = await requireSession();
  const [s, campaign] = await Promise.all([api.getDashboard(token), api.getCampaignSettings(token)]);
  const totalClaims = s.sourceSplit.tiktok + s.sourceSplit.reguler;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={
          <>
            {campaign.name} · {formatDateTime(campaign.startAt)} – {formatDateTime(campaign.endAt)}{" "}
            <Badge variant={campaign.isActive ? "default" : "secondary"} className="ml-1">
              {campaign.isActive ? "Aktif" : "Nonaktif"}
            </Badge>
          </>
        }
      />
      <section aria-label="Stok voucher" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Total stok" value={s.stock.total} hint="Kode non-void" />
        <Stat label="Available" value={s.stock.available} />
        <Stat label="Redeem (aktif)" value={s.stock.redeemed - s.stock.needsReconciliation} />
        <Stat label="Perlu rekonsiliasi" value={s.stock.needsReconciliation} hint="Redeem & lewat masa berlaku" />
        <Stat label="Redeem & Used" value={s.stock.used} hint="Data merchant" />
      </section>
      <section aria-label="Klaim" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Klaim hari ini" value={s.claimsToday} />
        <Stat label="Peserta unik" value={s.uniqueParticipants} />
        <Stat
          label="Sumber TikTok vs Reguler"
          value={totalClaims ? `${Math.round((s.sourceSplit.tiktok / totalClaims) * 100)}% / ${Math.round((s.sourceSplit.reguler / totalClaims) * 100)}%` : "—"}
          hint={`${s.sourceSplit.tiktok} TikTok · ${s.sourceSplit.reguler} Reguler`}
        />
        <Stat label="SMS gagal" value={s.smsFailed} hint="Masuk antrean retry" />
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Stok rendah</CardTitle>
          <CardDescription>Produk dengan stok Available &lt; 50 kode.</CardDescription>
        </CardHeader>
        <CardContent>
          {s.lowStockProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Semua produk aman.</p>
          ) : (
            <ul className="divide-y">
              {s.lowStockProducts.map((p) => (
                <li key={p.productSlug} className="flex items-center justify-between py-2 text-sm">
                  <Link href={`/vouchers?productSlug=${p.productSlug}`} className="hover:underline">
                    {p.productName}
                  </Link>
                  <Badge variant={p.available === 0 ? "destructive" : "outline"}>{p.available} available</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
