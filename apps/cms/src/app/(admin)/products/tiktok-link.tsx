"use client";

import { useState } from "react";
import { buildTikTokLink } from "@tiktok-get/shared";
import { CopyButton } from "@/components/copy-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SITE_URL } from "@/lib/site";

/** Generator link TikTok per produk (FR-CMS-06), opsional utm_campaign. */
export function TikTokLinkCard({ brandSlug, productSlug }: { brandSlug: string; productSlug: string }) {
  const [utm, setUtm] = useState("");
  const link = buildTikTokLink(SITE_URL, brandSlug, productSlug, utm);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Link TikTok</CardTitle>
        <CardDescription>Mendarat di brand page dengan voucher produk ini disorot; sumber tercatat “tiktok”.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Field>
          <FieldLabel htmlFor="utm">utm_campaign (opsional)</FieldLabel>
          <Input id="utm" value={utm} onChange={(e) => setUtm(e.target.value)} placeholder="mis. konten-desember" className="max-w-xs" />
        </Field>
        <div className="flex gap-2">
          <Input readOnly value={link} aria-label="Link TikTok" className="font-mono text-xs" onFocus={(e) => e.target.select()} />
          <CopyButton text={link} label="Salin link" />
        </div>
      </CardContent>
    </Card>
  );
}
