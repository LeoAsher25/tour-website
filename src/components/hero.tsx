"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { ArrowDown, ChevronRight, MapPin } from "lucide-react";

const slides = [
  {
    src: "/images/hero/image-1.avif",
    alt: "Motorbike tour group crossing a high mountain pass",
  },
  {
    src: "/images/hero/image-2.avif",
    alt: "Lush karst mountains and terraced valley in Ha Giang",
  },
  {
    src: "/images/hero/image-3.avif",
    alt: "Riders descending a misty mountain road on the Ha Giang Loop",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

const headline: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.14 } },
};

const line: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: EASE },
  },
};

const fade: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: EASE },
  },
};

export function Hero() {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Keep hero content visible while it naturally scrolls out of view.
  // A small translation adds depth without creating a visibility dead zone.
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -20]);

  useEffect(() => {
    if (reduce) return;

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] items-end overflow-hidden bg-dark-bg">
      {/* Keep every slide mounted and lazy-load non-first slides. */}
      <div className="absolute inset-0" aria-hidden="true">
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            style={{ pointerEvents: "none" }}>
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              preload={i === 0}
              loading={i === 0 ? undefined : "lazy"}
              sizes="100vw"
              className={
                reduce ? "object-cover" : "animate-ken-burns object-cover"
              }
            />
          </div>
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/25 to-dark-bg/20"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-dark-bg/80 via-dark-bg/40 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-[linear-gradient(to_bottom,rgba(8,12,10,0.8),rgba(8,12,10,0.4),transparent)]"
        aria-hidden="true"
      />

      <div className="absolute right-6 top-24 z-10 hidden items-center gap-3 lg:flex">
        <span className="font-serif text-sm text-dark-text/80">
          0{index + 1}
        </span>
        <span className="h-px w-10 bg-dark-text/40" />
        <span className="font-serif text-sm text-dark-text/80">
          0{slides.length}
        </span>
      </div>

      <div className="absolute left-4 top-24 z-10 hidden items-center gap-2 rounded-full border border-dark-text/20 bg-dark-bg/30 px-4 py-2 text-xs uppercase tracking-[0.18em] text-dark-text/90 backdrop-blur-md md:flex">
        <MapPin className="h-3.5 w-3.5 text-accent" />
        Ha Giang, Vietnam
      </div>

      <motion.div
        style={{ y: contentY }}
        className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-28 pt-40 sm:px-6 sm:pb-32 lg:px-8">
        <motion.div
          variants={headline}
          initial={reduce ? false : "hidden"}
          animate="visible">
          <motion.p
            variants={line}
            className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.28em] text-accent-tint">
            <span className="h-px w-10 bg-accent" />
            Ha Giang Loop — Vietnam
          </motion.p>

          <motion.h1
            variants={line}
            className="mt-6 max-w-4xl font-serif text-5xl leading-[0.98] text-dark-text sm:text-7xl lg:text-8xl">
            Ride the most
            <br />
            <span className="accent-word">spectacular</span> road
            <br />
            in Vietnam.
          </motion.h1>

          <motion.p
            variants={line}
            className="mt-7 max-w-xl text-base font-light leading-8 text-dark-muted sm:text-lg">
            No licence. No fear. Just hop on — and ride. Small-group motorbike
            tours, easy rider options and private jeep adventures through Ha
            Giang&rsquo;s legendary mountain passes.
          </motion.p>

          <motion.div
            variants={line}
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/#tours"
              className="group inline-flex h-13 items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-medium text-accent-foreground shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-2xl sm:w-auto">
              Explore tours
              <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/#booking"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-dark-text/40 bg-dark-bg/30 px-8 py-4 text-sm font-medium text-dark-text backdrop-blur-sm transition-all duration-200 hover:border-accent hover:text-accent sm:w-auto">
              Book your ride
            </Link>
          </motion.div>

          <motion.div
            variants={fade}
            className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-4">
            {[
              ["4.9/5", "2,000+ reviews"],
              ["500 km", "of mountain roads"],
              ["100%", "local guides"],
            ].map(([value, label]) => (
              <div key={label} className="flex items-center gap-3">
                <span className="font-serif text-2xl text-dark-text">
                  {value}
                </span>
                <span className="max-w-[9rem] text-xs uppercase tracking-[0.14em] text-dark-muted">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.7 }}
        aria-hidden="true">
        <motion.div
          animate={reduce ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-dark-text/70">
          <span className="text-[0.65rem] uppercase tracking-[0.24em]">
            Scroll
          </span>
          <ArrowDown className="h-4 w-4" />
        </motion.div>
      </motion.div>

      <div className="absolute bottom-8 right-6 z-10 hidden flex-col gap-2 lg:flex">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === index
                ? "w-8 bg-accent"
                : "w-1.5 bg-dark-text/40 hover:bg-dark-text/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
