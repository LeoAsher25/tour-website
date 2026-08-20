"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { Container } from "@/components/container";
import { SectionHeader } from "@/components/section-header";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import type { Tour } from "@/types/domain";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Shared Ha Giang loop imagery used to enrich tour galleries. */
const SHARED_IMAGES: { url: string; alt: string }[] = [
  {
    url: "/images/gallery/layer-20_1678645520.png.webp",
    alt: "Riders descending a misty pass",
  },
  {
    url: "/images/gallery/layer-7631_1678682722.jpg.webp",
    alt: "Village street in Ha Giang",
  },
  {
    url: "/images/gallery/unnamed_1763885473.jpg.webp",
    alt: "Mountain valley in golden light",
  },
  {
    url: "/images/gallery/doc-tham-ma-2_1678682709.png.webp",
    alt: "The Tham Ma pass switchbacks",
  },
  {
    url: "/images/gallery/layer-151_1678682754.png.webp",
    alt: "Karst mountains at sunset",
  },
];

function buildGallery(tour: Tour) {
  const images = tour.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt }));
  // 1 hero tile (2×2) + 4 small tiles fills the 4-column grid exactly.
  for (const shared of SHARED_IMAGES) {
    if (images.length >= 5) break;
    if (!images.some((i) => i.url === shared.url)) {
      images.push({ id: `shared-${images.length}`, ...shared });
    }
  }
  return images;
}

/** Masonry-style gallery with a simple lightbox. */
export function TourGallery({ tour }: { tour: Tour }) {
  const reduce = useReducedMotion();
  const t = useTranslations("tourDetail.gallery");
  const [open, setOpen] = useState<number | null>(null);
  const images = buildGallery(tour);

  // Escape closes the lightbox.
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? null : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? null : (i - 1 + images.length) % images.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  const go = useCallback(
    (dir: 1 | -1) =>
      setOpen((i) =>
        i === null ? null : (i + dir + images.length) % images.length
      ),
    [images.length]
  );

  if (images.length === 0) return null;

  return (
    <section id="gallery" className="scroll-mt-24 bg-background py-20 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={
            <>
              {t("title1")}{" "}
              <span className="accent-word">{t("titleAccent")}</span>
            </>
          }
          description={t("description")}
          align="center"
        />

        <Stagger className="mt-14 grid auto-rows-[200px] grid-cols-1 gap-4 sm:grid-cols-2 md:auto-rows-[240px] lg:grid-cols-4">
          {images.map((image, i) => (
            <StaggerItem
              key={image.id}
              className={i === 0 ? "sm:col-span-2 sm:row-span-2" : ""}
            >
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={t("openPhoto", { alt: image.alt })}
                className="group relative block h-full w-full overflow-hidden rounded-2xl border border-border text-left"
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-dark-bg/0 transition-colors duration-300 group-hover:bg-dark-bg/25" />
                <span className="absolute bottom-4 left-4 translate-y-2 text-xs font-medium uppercase tracking-[0.16em] text-dark-text opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {image.alt}
                </span>
              </button>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>

      {/* Lightbox */}
      <AnimatePresence>
        {open !== null && images[open] && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-dark-bg/95 p-4 backdrop-blur-sm"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <button
              type="button"
              aria-label={t("closePhoto")}
              onClick={() => setOpen(null)}
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-dark-text/30 text-dark-text transition-colors hover:border-accent hover:text-accent"
            >
              <X className="h-5 w-5" />
            </button>

            <button
              type="button"
              aria-label={t("previousPhoto")}
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              className="absolute left-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-dark-text/30 text-dark-text transition-colors hover:border-accent hover:text-accent sm:left-6"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              aria-label={t("nextPhoto")}
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              className="absolute right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-dark-text/30 text-dark-text transition-colors hover:border-accent hover:text-accent sm:right-6"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <motion.figure
              key={open}
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="relative h-[80vh] w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[open].url}
                alt={images[open].alt}
                fill
                sizes="100vw"
                className="rounded-2xl object-contain"
              />
              <figcaption className="absolute inset-x-0 -bottom-10 text-center text-sm font-light text-dark-muted">
                {t("caption", { alt: images[open].alt, index: open + 1, total: images.length })}
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
