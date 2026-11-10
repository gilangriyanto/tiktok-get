import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { can } from "@tiktok-get/shared";
import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { Button } from "@/components/ui/button";
import * as api from "@/lib/api";
import { orNotFound } from "@/lib/or-not-found";
import { requireSession } from "@/lib/session";
import { BrandForm } from "../brand-form";
import { brandToInput } from "../brand-input";

export const metadata: Metadata = { title: "Ubah brand" };

export default function EditBrandPage({ params }: PageProps<"/brands/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {params.then(({ id }) => (
        <EditBrand id={id} />
      ))}
    </Suspense>
  );
}

async function EditBrand({ id }: { id: string }) {
  const { token, user } = await requireSession();
  const brand = await orNotFound(api.getBrand(token, id));
  return (
    <>
      <PageHeader
        title={brand.name}
        description={`/${brand.slug} · ${brand.productCount} produk`}
        actions={
          <Button asChild variant="outline">
            <Link href={`/products?brandSlug=${brand.slug}`}>Lihat produk</Link>
          </Button>
        }
      />
      <BrandForm id={brand.id} initial={brandToInput(brand)} readOnly={!can(user.role, "content:write")} />
    </>
  );
}
