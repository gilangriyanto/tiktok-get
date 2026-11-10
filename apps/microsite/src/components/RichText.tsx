import { Fragment } from "react";

/** Menebalkan hashtag (`#TikTokGet`, `[#TikTokGetBrandA]`) di teks dari data. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\[#[^\]]+\]|#\w+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^(\[#|#)/.test(part) ? (
          <strong key={i} className="font-bold">
            {part}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
