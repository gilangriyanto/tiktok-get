"use client";

import { Check, Copy } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Salin teks ke clipboard dengan umpan balik singkat. */
export function CopyButton({
  text,
  label = "Salin",
  iconOnly = false,
  ...props
}: { text: string; label?: string; iconOnly?: boolean } & Omit<ComponentProps<typeof Button>, "onClick" | "children">) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Tersalin ke clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Gagal menyalin — salin manual dari kolom teks");
    }
  }
  return (
    <Button type="button" variant="outline" size={iconOnly ? "icon-sm" : "default"} aria-label={iconOnly ? label : undefined} onClick={copy} {...props}>
      {copied ? <Check /> : <Copy />}
      {!iconOnly && label}
    </Button>
  );
}
