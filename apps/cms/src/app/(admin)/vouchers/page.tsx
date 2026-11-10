import type { Metadata } from "next";
import Link from "next/link";
import { Upload } from "lucide-react";
import { Suspense } from "react";
import { VoucherListQuerySchema, can } from "@tiktok-get/shared";
import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { Button } from "@/components/ui/button";
import * as api from "@/lib/api";
import { parseQuery } from "@/lib/query";
import { requireSession } from "@/lib/session";
import { VouchersTable } from "./vouchers-table";

export const metadata: Metadata = { title: "Voucher" };

export default function VouchersPage({ searchParams }: PageProps<"/vouchers">) {
  return (
    <Suspense fallback={<PageSkeleton rows={12} />}>
      {searchParams.then((sp) => (
        <VouchersContent sp={sp} />
      ))}
    </Suspense>
  );
}

async function VouchersContent({ sp }: { sp: Awaited<PageProps<"/vouchers">["searchParams"]> }) {
  const { token, user } = await requireSession();
  const query = parseQuery(VoucherListQuerySchema, sp);
  const [result, options] = await Promise.all([api.listVouchers(token, query), api.getOptions(token)]);
  return (
    <>
      <PageHeader
        title="Voucher"
        description="Kode voucher dari merchant. Status: Available → Redeem → Redeem & Used (PRD Bab 8)."
        actions={
          can(user.role, "voucher:upload") && (
            <Button asChild>
              <Link href={query.productSlug ? `/vouchers/upload?productSlug=${query.productSlug}` : "/vouchers/upload"}>
                <Upload /> Upload kode
              </Link>
            </Button>
          )
        }
      />
      <VouchersTable result={result} options={options} />
    </>
  );
}
