import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { can } from "@tiktok-get/shared";
import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as api from "@/lib/api";
import { orNotFound } from "@/lib/or-not-found";
import { requireSession } from "@/lib/session";
import { ProductForm } from "../product-form";
import { productToInput } from "../product-input";
import { TikTokLinkCard } from "../tiktok-link";

export const metadata: Metadata = { title: "Ubah produk" };

export default function EditProductPage({ params }: PageProps<"/products/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {params.then(({ id }) => (
        <EditProduct id={id} />
      ))}
    </Suspense>
  );
}

async function EditProduct({ id }: { id: string }) {
  const { token, user } = await requireSession();
  const [product, options] = await Promise.all([orNotFound(api.getProduct(token, id)), api.getOptions(token)]);
  const s = product.stock;
  const stats: [string, number][] = [
    ["Total", s.total],
    ["Available", s.available],
    ["Redeem", s.redeemed],
    ["Perlu rekonsiliasi", s.needsReconciliation],
    ["Redeem & Used", s.used],
    ["Void", s.void],
  ];
  return (
    <>
      <PageHeader
        title={`${product.name} ${product.variant}`}
        description={
          <>
            {product.brandName} · /{product.brandSlug}/{product.slug}{" "}
            {product.stockStatus === "sold_out" && <Badge variant="destructive">Habis Terjual</Badge>}
          </>
        }
        actions={
          <Button asChild variant="outline">
            <Link href={`/vouchers?productSlug=${product.slug}`}>Lihat voucher</Link>
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan stok</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-3 gap-3">
              {stats.map(([label, value]) => (
                <div key={label} className="rounded-md border p-2">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="text-lg font-semibold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
        <TikTokLinkCard brandSlug={product.brandSlug} productSlug={product.slug} />
      </div>
      <ProductForm id={product.id} initial={productToInput(product)} brands={options.brands} readOnly={!can(user.role, "content:write")} />
    </>
  );
}
