"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowDown,
  CalendarDays,
  Clock,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import { formatVnd } from "@/lib/pricing";
import type { Tour } from "@/types/domain";

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

const line: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE },
  },
};

export function TourHero({ tour }: { tour: Tour }) {
  const reduce = useReducedMotion();

  return (
    <section className="relative flex min-h-[88svh] items-end overflow-hidden bg-dark-bg">
      {/* Cinematic image with slow zoom */}
      <div className="absolute inset-0" aria-hidden="true">
        <motion.div
          initial={reduce ? false : { scale: 1.12, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: reduce ? 0 : 2, ease: EASE }}
          className="absolute inset-0">
          <Image
            src={tour.heroImage}
            alt={tour.title}
            fill
            priority
            sizes="100vw"
            className={`object-cover ${reduce ? "" : "animate-ken-burns"}`}
          />
        </motion.div>
      </div>

      {/* Cinematic overlays */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/30 to-dark-bg/25"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-dark-bg/90 via-dark-bg/45 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-[linear-gradient(to_bottom,rgba(8,12,10,0.8),rgba(8,12,10,0.4),transparent)]"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-32 sm:px-6 sm:pb-24 lg:px-8 lg:pb-28">
        <motion.div
          variants={container}
          initial={reduce ? false : "hidden"}
          animate="visible">
          {/* Breadcrumb + location */}
          <motion.div
            variants={item}
            className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-dark-muted">
            <Link href="/" className="transition-colors hover:text-accent">
              Home
            </Link>
            <span className="text-dark-text/40">/</span>
            <Link
              href="/#tours"
              className="transition-colors hover:text-accent">
              Tours
            </Link>
            <span
              className="hidden h-px w-8 bg-accent sm:block"
              aria-hidden="true"
            />
            <span className="hidden items-center gap-1.5 sm:flex">
              <MapPin className="h-3.5 w-3.5 text-accent" />
              {tour.destination}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={line}
            className="mt-8 max-w-4xl font-serif text-5xl leading-[0.98] text-dark-text sm:text-6xl lg:text-7xl">
            {tour.title}
          </motion.h1>

          {/* Rating */}
          <motion.div
            variants={item}
            className="mt-6 flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 rounded-full border border-dark-text/25 bg-dark-bg/40 px-3.5 py-1.5 text-sm text-dark-text backdrop-blur-sm">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="font-medium">{tour.rating}</span>
              <span className="text-dark-muted">
                ({tour.reviewCount.toLocaleString()} reviews)
              </span>
            </span>
            <span className="rounded-full border border-dark-text/25 bg-dark-bg/40 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-dark-text backdrop-blur-sm">
              {tour.subtitle}
            </span>
          </motion.div>

          {/* Meta stats */}
          <motion.div
            variants={item}
            className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 text-dark-text">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dark-text/25 bg-dark-bg/40 backdrop-blur-sm">
                <Clock className="h-4 w-4 text-accent" />
              </span>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-dark-muted">
                  Duration
                </p>
                <p className="mt-0.5 font-serif text-lg">
                  {tour.durationDays}D {tour.durationNights}N
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dark-text/25 bg-dark-bg/40 backdrop-blur-sm">
                <Users className="h-4 w-4 text-accent" />
              </span>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-dark-muted">
                  Group size
                </p>
                <p className="mt-0.5 font-serif text-lg">
                  {tour.groupSize ?? "Small group"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dark-text/25 bg-dark-bg/40 backdrop-blur-sm">
                <CalendarDays className="h-4 w-4 text-accent" />
              </span>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-dark-muted">
                  From
                </p>
                <p className="mt-0.5 font-serif text-lg text-accent-tint">
                  {formatVnd(tour.fromPrice)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.p
            variants={item}
            className="mt-8 max-w-2xl text-base font-light leading-8 text-dark-muted sm:text-lg">
            {tour.description}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={item}
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <a
              href="#booking"
              className="group inline-flex h-13 items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-medium text-accent-foreground shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-2xl">
              Book this tour
              <ArrowDown className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
            </a>
            <a
              href="#itinerary"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-dark-text/40 bg-dark-bg/30 px-8 py-4 text-sm font-medium text-dark-text backdrop-blur-sm transition-all duration-200 hover:border-accent hover:text-accent">
              See the itinerary
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
