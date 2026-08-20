"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Play, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Container } from "@/components/container";
import { MaskReveal } from "@/components/motion/reveal";

const VIDEO_ID = "7qY_IB5vvQA";

export function VideoSection() {
  const reduce = useReducedMotion();
  const t = useTranslations("home.video");
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  return (
    <section className="relative py-24 lg:py-32">
      <Container>
        <MaskReveal>
          <div className="group relative overflow-hidden rounded-[2rem] border border-border shadow-xl transition-shadow duration-300 hover:shadow-2xl">
            <div className="relative h-[420px] sm:h-[520px] lg:h-[620px]">
              <Image
                src="/images/videos/maxresdefault-2-_1678809870.jpg.webp"
                alt={t("alt")}
                fill
                sizes="100vw"
                className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-dark-bg/20 to-transparent" />

              {/* Play button — pulsing halo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  aria-label={t("play")}
                  onClick={() => setIsOpen(true)}
                  className="group/play relative flex h-20 w-20 items-center justify-center rounded-full border border-dark-text/40 bg-dark-bg/30 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-accent sm:h-24 sm:w-24">
                  {!reduce && (
                    <motion.span
                      className="absolute inset-0 rounded-full border border-accent/50"
                      animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                      aria-hidden="true"
                    />
                  )}
                  <Play className="ml-1 h-8 w-8 text-dark-text transition-colors group-hover/play:text-accent-foreground" />
                </button>
              </div>

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-accent-tint">
                  {t("eyebrow")}
                </p>
                <h2 className="mt-3 max-w-xl font-serif text-3xl text-dark-text sm:text-4xl">
                  {t("title")}
                </h2>
              </div>
            </div>
          </div>
        </MaskReveal>
      </Container>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-dark-bg/90 p-4 backdrop-blur-sm sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={t("play")}>
            <button
              type="button"
              onClick={close}
              aria-label={t("close")}
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-dark-text/30 bg-dark-bg/50 text-dark-text transition-colors hover:bg-accent hover:text-accent-foreground sm:right-6 sm:top-6">
              <X className="h-5 w-5" />
            </button>

            <motion.div
              className="relative aspect-video w-full max-h-full max-w-7xl overflow-hidden rounded-2xl border border-border bg-black shadow-2xl"
              initial={{ scale: reduce ? 1 : 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: reduce ? 1 : 0.94, opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.25 }}
              onClick={(e) => e.stopPropagation()}>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/7qY_IB5vvQA?si=00I0j5RS272ezLem"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
