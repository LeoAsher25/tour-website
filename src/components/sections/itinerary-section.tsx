"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Mountain, MapPin, Moon, Sun } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

import { Container } from "@/components/container";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeader } from "@/components/section-header";
import { siteConfig } from "@/config/site";

export function ItinerarySection() {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("home.itinerary");

  const itinerary = [
    {
      day: t("days.day1.day"),
      title: t("days.day1.title"),
      distance: t("days.day1.distance"),
      text: t("days.day1.text", { hostel: siteConfig.brand.shortName }),
      icon: Sun,
      stops: [
        t("days.day1.stops.0"),
        t("days.day1.stops.1"),
        t("days.day1.stops.2"),
      ],
    },
    {
      day: t("days.day2.day"),
      title: t("days.day2.title"),
      distance: t("days.day2.distance"),
      text: t("days.day2.text"),
      icon: Mountain,
      stops: [
        t("days.day2.stops.0"),
        t("days.day2.stops.1"),
        t("days.day2.stops.2"),
      ],
    },
    {
      day: t("days.day3.day"),
      title: t("days.day3.title"),
      distance: t("days.day3.distance"),
      text: t("days.day3.text"),
      icon: Moon,
      stops: [
        t("days.day3.stops.0"),
        t("days.day3.stops.1"),
        t("days.day3.stops.2"),
      ],
    },
  ];

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 0.75", "end 0.6"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <section id="itinerary" className="scroll-mt-24 bg-surface py-24 lg:py-32">
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

        <div ref={trackRef} className="relative mx-auto mt-16 max-w-3xl">
          {/* Vertical line — scroll-linked fill */}
          <div
            className="absolute bottom-8 left-6 top-8 w-px bg-border lg:left-1/2 lg:-translate-x-1/2"
            aria-hidden="true"
          />
          <motion.div
            className="absolute bottom-8 left-6 top-8 w-px origin-top bg-accent lg:left-1/2 lg:-translate-x-1/2"
            style={{ scaleY: reduce ? 1 : progress }}
            aria-hidden="true"
          />

          <div className="space-y-12">
            {itinerary.map((item, i) => {
              const Icon = item.icon;
              const isLeft = i % 2 === 0;
              return (
                <Reveal key={item.day} delay={0.05 * i} y={18}>
                  <div
                    className={`relative flex gap-6 pl-16 lg:w-1/2 lg:pl-0 ${
                      isLeft
                        ? "lg:mr-auto lg:pr-14 lg:text-right"
                        : "lg:ml-auto lg:pl-14"
                    }`}
                  >
                    {/* Node */}
                    <div
                      className={`absolute left-0 flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-background shadow-sm lg:top-1 ${
                        isLeft
                          ? "lg:-right-6 lg:left-auto"
                          : "lg:-left-6"
                      }`}
                    >
                      <Icon className="h-5 w-5 text-accent" />
                    </div>

                    <div className="group flex-1 rounded-2xl border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-md">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
                          {item.day}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent-tint px-2.5 py-0.5 text-xs font-medium text-accent-hover">
                          <MapPin className="h-3 w-3" />
                          {item.distance}
                        </span>
                      </div>
                      <h3 className="mt-3 font-serif text-2xl text-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm font-light leading-7 text-muted-foreground">
                        {item.text}
                      </p>
                      <ul className="mt-5 flex flex-wrap gap-2">
                        {item.stops.map((stop) => (
                          <li
                            key={stop}
                            className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors duration-200 hover:border-accent/40 hover:text-accent-hover"
                          >
                            {stop}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
