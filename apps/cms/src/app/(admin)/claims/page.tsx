import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Suspense } from "react";
import { ClaimListQuerySchema, can } from "@tiktok-get/shared";
import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { Button } from "@/components/ui/button";
import * as api from "@/lib/api";
import { parseQuery } from "@/lib/query";
import { requireSession } from "@/lib/session";
import { ClaimsTable } from "./claims-table";

export const metadata: Metadata = { title: "Peserta & klaim" };

export default function ClaimsPage({ searchParams }: PageProps<"/claims">) {
  return (
    <Suspense fallback={<PageSkeleton rows={12} />}>
      {searchParams.then((sp) => (
        <ClaimsContent sp={sp} />
      ))}
    </Suspense>
  );
}

async function ClaimsContent({ sp }: { sp: Awaited<PageProps<"/claims">["searchParams"]> }) {
  const { token, user } = await requireSession();
  const query = parseQuery(ClaimListQuerySchema, sp);
  const [result, options] = await Promise.all([api.listClaims(token, query), api.getOptions(token)]);
  const canExport = can(user.role, "participant:export");
  const exportQs = new URLSearchParams(
    Object.entries(query).filter(([k, v]) => v !== undefined && !["page", "pageSize", "sort", "order"].includes(k)).map(([k, v]) => [k, String(v)]),
  ).toString();
  return (
    <>
      <PageHeader
        title="Peserta & klaim"
        description={
          can(user.role, "participant:viewPhone")
            ? "Data klaim per peserta. Export tercatat di audit log (segera hadir)."
            : "Nomor HP ditampilkan termasking untuk role Anda."
        }
        actions={
          canExport && (
            <Button asChild variant="outline">
              <a href={`/claims/export${exportQs ? `?${exportQs}` : ""}`} download>
                <Download /> Export CSV ({result.total})
              </a>
            </Button>
          )
        }
      />
      <ClaimsTable result={result} options={options} />
    </>
  );
}
