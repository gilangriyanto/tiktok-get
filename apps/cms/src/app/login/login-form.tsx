"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { LoginRequestSchema, ROLE_LABELS, type LoginRequest, type Role } from "@tiktok-get/shared";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginAction } from "./actions";

const DEMO: { role: Role; email: string }[] = [
  { role: "super_admin", email: "superadmin@tiktokget.test" },
  { role: "admin", email: "admin@tiktokget.test" },
  { role: "viewer", email: "viewer@tiktokget.test" },
];

export function LoginForm({ next, showDemo }: { next: string; showDemo: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    setError(null);
    startTransition(async () => {
      const res = await loginAction(values);
      if (res.ok) router.replace(next);
      else setError(res.error.message ?? "Login gagal");
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <FieldGroup>
        <Field data-invalid={Boolean(form.formState.errors.email)}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" autoComplete="username" aria-invalid={Boolean(form.formState.errors.email)} {...form.register("email")} />
          <FieldError errors={[form.formState.errors.email]} />
        </Field>
        <Field data-invalid={Boolean(form.formState.errors.password)}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" type="password" autoComplete="current-password" aria-invalid={Boolean(form.formState.errors.password)} {...form.register("password")} />
          <FieldError errors={[form.formState.errors.password]} />
        </Field>
      </FieldGroup>

      {error && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Memproses…" : "Masuk"}
      </Button>

      {showDemo && (
        <div className="rounded-lg border border-dashed p-3 text-sm">
          <p className="font-medium">Akun demo (mock) — password: demo1234</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {DEMO.map((d) => (
              <Button
                key={d.role}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  form.setValue("email", d.email);
                  form.setValue("password", "demo1234");
                }}
              >
                {ROLE_LABELS[d.role]}
              </Button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
