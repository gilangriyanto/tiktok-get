import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import { ProductListQuerySchema, can } from "@tiktok-get/shared";
import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { Button } from "@/components/ui/button";
import * as api from "@/lib/api";
import { parseQuery } from "@/lib/query";
import { requireSession } from "@/lib/session";
import { ProductsTable } from "./products-table";

export const metadata: Metadata = { title: "Produk" };

export default function ProductsPage({ searchParams }: PageProps<"/products">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {searchParams.then((sp) => (
        <ProductsContent sp={sp} />
      ))}
    </Suspense>
  );
}

async function ProductsContent({ sp }: { sp: Awaited<PageProps<"/products">["searchParams"]> }) {
  const { token, user } = await requireSession();
  const query = parseQuery(ProductListQuerySchema, sp);
  const [result, options] = await Promise.all([api.listProducts(token, query), api.getOptions(token)]);
  const canWrite = can(user.role, "content:write");
  return (
    <>
      <PageHeader
        title="Produk"
        description="Produk per brand, harga tampilan, retailer, dan stok kode voucher."
        actions={
          canWrite && (
            <Button asChild>
              <Link href={query.brandSlug ? `/products/new?brandSlug=${query.brandSlug}` : "/products/new"}>
                <Plus /> Tambah produk
              </Link>
            </Button>
          )
        }
      />
      <ProductsTable result={result} brands={options.brands} />
    </>
  );
}
