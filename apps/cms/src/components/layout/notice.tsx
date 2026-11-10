import { Construction, Lock } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

function Notice({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <Card className="mx-auto mt-10 w-full max-w-lg">
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">{icon}</div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="text-sm text-muted-foreground">{children}</div>
      </CardContent>
    </Card>
  );
}

export function ComingSoon({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Notice icon={<Construction className="size-6" />} title={`${title} — segera hadir`}>
      {children}
    </Notice>
  );
}

export function AccessDenied({ children = "Halaman ini hanya untuk Super Admin." }: { children?: ReactNode }) {
  return (
    <Notice icon={<Lock className="size-6" />} title="Akses ditolak">
      {children}
    </Notice>
  );
}
