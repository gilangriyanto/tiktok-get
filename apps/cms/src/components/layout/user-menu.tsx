import { LogOut } from "lucide-react";
import { ROLE_LABELS } from "@tiktok-get/shared";
import { logoutAction } from "@/app/login/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/session";

/** Nama & role user di header. Membaca sesi → harus di dalam <Suspense>. */
export async function UserMenu() {
  const { user } = await requireSession();
  return (
    <div className="flex items-center gap-3">
      <div className="text-right leading-tight">
        <p className="text-sm font-medium">{user.name}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>
      <Badge variant={user.role === "viewer" ? "secondary" : "default"}>{ROLE_LABELS[user.role]}</Badge>
      <form action={logoutAction}>
        <Button type="submit" variant="ghost" size="icon" aria-label="Keluar">
          <LogOut />
        </Button>
      </form>
    </div>
  );
}
