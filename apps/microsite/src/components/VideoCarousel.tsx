"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Video } from "@tiktok-get/shared";
import { PLACEHOLDER } from "@/lib/placeholders";

const MAX_VIDEOS = 3;

function embedUrl(video: Video): string {
  // Dimuat hanya setelah user menekan play, jadi autoplay di sini dipicu user (bukan autoplay bersuara).
  return video.provider === "youtube"
    ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.videoId)}?autoplay=1&playsinline=1`
    : `https://www.tiktok.com/embed/v2/${encodeURIComponent(video.videoId)}`;
}

/**
 * Maks. 3 video, 2 terlihat sekaligus, indikator titik.
 * Facade: thumbnail + tombol play; iframe baru dimuat saat diklik (lazy, tanpa autoplay).
 */
export function VideoCarousel({ videos }: { videos: Video[] }) {
  const items = videos.slice(0, MAX_VIDEOS);
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState<number | null>(null);

  if (items.length === 0) return null;
  // Dengan 2 kartu terlihat, posisi scroll yang mungkin = jumlah video - 1 (min. 1).
  const pages = Math.max(1, items.length - 1);

  function onScroll() {
    const track = trackRef.current;
    const first = track?.firstElementChild;
    if (!track || !(first instanceof HTMLElement)) return;
    setActive(Math.min(pages - 1, Math.round(track.scrollLeft / first.offsetWidth)));
  }

  function goTo(index: number) {
    const track = trackRef.current;
    const item = track?.children[index];
    if (track && item instanceof HTMLElement) {
      track.scrollTo({ left: item.offsetLeft - track.offsetLeft, behavior: "smooth" });
    }
  }

  return (
    <section aria-label="Video" className="container-site">
      <ul
        ref={trackRef}
        onScroll={onScroll}
        className="mx-auto flex max-w-[30rem] snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none] desktop:gap-5"
      >
        {items.map((video, i) => (
          <li
            key={video.videoId}
            className="relative aspect-9/16 w-[calc(50%-0.375rem)] shrink-0 snap-start overflow-hidden rounded-lg border border-pink/60 bg-placeholder desktop:w-[calc(50%-0.625rem)]"
          >
            {playing === i ? (
              <iframe
                src={embedUrl(video)}
                title={video.title}
                loading="lazy"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 size-full"
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(i)}
                aria-label={`Putar video: ${video.title}`}
                className="group absolute inset-0 flex items-center justify-center"
              >
                <Image
                  src={video.thumbnail ?? PLACEHOLDER.videoThumb}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 240px, 45vw"
                  className="object-cover"
                />
                <span
                  aria-hidden
                  className="relative flex size-14 items-center justify-center rounded-full bg-black/60 transition group-hover:scale-110"
                >
                  <svg viewBox="0 0 24 24" className="ml-1 size-7 fill-white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </button>
            )}
          </li>
        ))}
      </ul>

      {pages > 1 && (
        <div className="mt-4 flex justify-center gap-1">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Tampilkan video ${i + 1}`}
              aria-current={active === i}
              className="flex min-h-11 min-w-11 items-center justify-center"
            >
              <span
                aria-hidden
                className={`h-2 rounded-full transition-all ${active === i ? "w-10 bg-teal" : "w-2 bg-teal/40"}`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
