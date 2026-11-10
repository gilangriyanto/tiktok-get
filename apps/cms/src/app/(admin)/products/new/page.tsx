import type { Metadata } from "next";
import { Suspense } from "react";
import { can } from "@tiktok-get/shared";
import { AccessDenied } from "@/components/layout/notice";
import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import * as api from "@/lib/api";
import { requireSession } from "@/lib/session";
import { ProductForm } from "../product-form";
import { emptyProduct } from "../product-input";

export const metadata: Metadata = { title: "Tambah produk" };

export default function NewProductPage({ searchParams }: PageProps<"/products/new">) {
  return (
    <>
      <PageHeader title="Tambah produk" />
      <Suspense fallback={<PageSkeleton />}>
        {searchParams.then((sp) => (
          <NewProduct brandSlug={typeof sp.brandSlug === "string" ? sp.brandSlug : ""} />
        ))}
      </Suspense>
    </>
  );
}

async function NewProduct({ brandSlug }: { brandSlug: string }) {
  const { token, user } = await requireSession();
  if (!can(user.role, "content:write")) return <AccessDenied>Role Anda tidak bisa menambah produk.</AccessDenied>;
  const { brands } = await api.getOptions(token);
  return <ProductForm initial={emptyProduct(brandSlug)} brands={brands} readOnly={false} />;
}
