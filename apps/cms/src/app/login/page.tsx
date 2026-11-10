import type { Metadata } from "next";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { USE_MOCK } from "@/lib/api";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">CMS #TikTokGet</CardTitle>
          <CardDescription>Masuk untuk mengelola campaign voucher.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            {searchParams.then((sp) => {
              const next = typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/";
              return (
                <>
                  {sp.expired && (
                    <p className="mb-4 rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-900">Sesi berakhir, silakan masuk lagi.</p>
                  )}
                  <LoginForm next={next} showDemo={USE_MOCK} />
                </>
              );
            })}
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
