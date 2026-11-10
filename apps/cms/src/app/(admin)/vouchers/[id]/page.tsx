import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { GENDER_LABELS, SMS_STATUS_LABELS, VOUCHER_STATUS_LABELS, can, type VoucherEventCause } from "@tiktok-get/shared";
import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as api from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { RETAILER_LABELS, SOURCE_LABELS } from "@/lib/labels";
import { orNotFound } from "@/lib/or-not-found";
import { requireSession } from "@/lib/session";
import { VoucherStatusBadge } from "../voucher-status-badge";
import { VoidDialog } from "./void-dialog";

export const metadata: Metadata = { title: "Detail voucher" };

const CAUSE_LABELS: Record<VoucherEventCause, string> = {
  upload: "Upload",
  claim: "Klaim",
  reconciliation: "Rekonsiliasi",
  admin: "Admin",
};

export default function VoucherDetailPage({ params }: PageProps<"/vouchers/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {params.then(({ id }) => (
        <VoucherDetail id={id} />
      ))}
    </Suspense>
  );
}

async function VoucherDetail({ id }: { id: string }) {
  const { token, user } = await requireSession();
  const v = await orNotFound(api.getVoucher(token, id));
  const info: [string, React.ReactNode][] = [
    ["Kode", <span key="c" className="font-mono">{v.code}</span>],
    ["Produk", `${v.productName} (${v.brandName})`],
    ["Retailer", RETAILER_LABELS[v.retailer]],
    ["Batch", v.batch ?? "—"],
    ["Diunggah", formatDateTime(v.uploadedAt)],
    ["Tgl redeem", formatDateTime(v.redeemedAt)],
    ["Berlaku s.d.", formatDateTime(v.expiresAt)],
    ["No. HP pemegang", <span key="p" className="font-mono">{v.phone ?? "—"}</span>],
    ["Dirilis ulang", `${v.releaseCount}×`],
  ];
  return (
    <>
      <PageHeader
        title={v.id}
        description={<VoucherStatusBadge status={v.status} needsReconciliation={v.needsReconciliation} />}
        actions={
          <>
            {can(user.role, "voucher:void") && v.status === "available" && <VoidDialog id={v.id} code={v.code} />}
            <Button asChild variant="outline">
              <Link href={`/vouchers?productSlug=${v.productSlug}`}>Voucher produk ini</Link>
            </Button>
          </>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle>Info voucher</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              {info.map(([k, val]) => (
                <div key={k} className="contents">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd>{val}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Riwayat status</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative flex flex-col gap-4 border-l pl-5">
              {v.events.map((e) => (
                <li key={e.id} className="relative text-sm">
                  <span className="absolute top-1.5 -left-[25px] size-2.5 rounded-full bg-primary" aria-hidden />
                  <p className="font-medium">
                    {e.fromStatus ? `${VOUCHER_STATUS_LABELS[e.fromStatus]} → ` : ""}
                    {VOUCHER_STATUS_LABELS[e.toStatus]}{" "}
                    <Badge variant="outline" className="ml-1">
                      {CAUSE_LABELS[e.cause]}
                    </Badge>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(e.at)}
                    {e.actor && ` · ${e.actor}`}
                    {e.refId && ` · ref ${e.refId}`}
                  </p>
                  {e.note && <p className="mt-0.5 text-xs">“{e.note}”</p>}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Riwayat klaim</CardTitle>
        </CardHeader>
        <CardContent>
          {v.claims.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum pernah diklaim.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Klaim</TableHead>
                  <TableHead>Peserta</TableHead>
                  <TableHead>Sumber</TableHead>
                  <TableHead>Redeem</TableHead>
                  <TableHead>Exp</TableHead>
                  <TableHead>Hasil</TableHead>
                  <TableHead>SMS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {v.claims.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.id}</TableCell>
                    <TableCell>
                      {c.name}
                      <span className="block font-mono text-xs text-muted-foreground">
                        {c.phone} · {GENDER_LABELS[c.gender]}, {c.age} th
                      </span>
                    </TableCell>
                    <TableCell>{SOURCE_LABELS[c.source]}</TableCell>
                    <TableCell>{formatDateTime(c.redeemedAt)}</TableCell>
                    <TableCell>{formatDateTime(c.expiresAt)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{{ active: "Aktif", used: "Dipakai", released: "Dikembalikan ke pool" }[c.outcome]}</Badge>
                    </TableCell>
                    <TableCell>{SMS_STATUS_LABELS[c.smsStatus]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
