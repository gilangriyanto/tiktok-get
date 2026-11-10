import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import { BrandListQuerySchema, can } from "@tiktok-get/shared";
import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { Button } from "@/components/ui/button";
import * as api from "@/lib/api";
import { parseQuery } from "@/lib/query";
import { requireSession } from "@/lib/session";
import { BrandsTable } from "./brands-table";

export const metadata: Metadata = { title: "Brand" };

export default function BrandsPage({ searchParams }: PageProps<"/brands">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {searchParams.then((sp) => (
        <BrandsContent sp={sp} />
      ))}
    </Suspense>
  );
}

async function BrandsContent({ sp }: { sp: Awaited<PageProps<"/brands">["searchParams"]> }) {
  const { token, user } = await requireSession();
  const query = parseQuery(BrandListQuerySchema, sp);
  const result = await api.listBrands(token, query);
  const canWrite = can(user.role, "content:write");
  return (
    <>
      <PageHeader
        title="Brand"
        description="Brand peserta campaign: halaman brand, kartu di home, dan maks. 3 video."
        actions={
          canWrite && (
            <Button asChild>
              <Link href="/brands/new">
                <Plus /> Tambah brand
              </Link>
            </Button>
          )
        }
      />
      <BrandsTable result={result} canWrite={canWrite} />
    </>
  );
}
