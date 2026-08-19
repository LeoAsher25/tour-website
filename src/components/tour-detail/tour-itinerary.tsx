"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Clock, MapPin, Moon, Sunrise } from "lucide-react";

import { Container } from "@/components/container";
import { SectionHeader } from "@/components/section-header";
import { Reveal } from "@/components/motion/reveal";
import type { Tour } from "@/types/domain";

/** Day-by-day itinerary timeline with scroll progress line. */
export function TourItinerary({
  tour,
  aside,
}: {
  tour: Tour;
  aside?: ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 0.7", "end 0.55"],
  });
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="itinerary" className="scroll-mt-24 bg-background py-20 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow="The itinerary"
          title={
            <>
              {tour.durationDays} days of{" "}
              <span className="accent-word">slow</span> wonder
            </>
          }
          description="Paced so every viewpoint has time to land — day by day, village by village."
          align="center"
        />

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_380px] lg:items-start">
          <div ref={trackRef} className="relative mx-auto max-w-3xl lg:mx-0 lg:max-w-none">
          {/* Timeline rail */}
          <div
            className="absolute bottom-8 left-6 top-8 w-px bg-border"
            aria-hidden="true"
          />
          <motion.div
            className="absolute bottom-8 left-6 top-8 w-px origin-top bg-accent"
            style={{ scaleY: progress }}
            aria-hidden="true"
          />

          <div className="space-y-10">
            {tour.itinerary.map((day, i) => (
              <Reveal key={day.id} delay={0.05 * i}>
                <div className="relative flex gap-6 pl-16">
                  {/* Node */}
                  <div className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card shadow-sm">
                    <span className="font-serif text-sm text-accent">
                      {String(day.dayNumber).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex-1 rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-7">
                    {/* Day label + route */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
                        Day {day.dayNumber}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-accent" />
                        {day.title}
                      </span>
                    </div>

                    <p className="mt-4 text-sm font-light leading-7 text-muted-foreground">
                      {day.summary}
                    </p>

                    {/* Stops */}
                    {day.stops.length > 0 && (
                      <ul className="mt-5 space-y-3 border-t border-border pt-5">
                        {day.stops.map((stop, j) => (
                          <li key={stop.id} className="flex items-start gap-3">
                            {j === 0 ? (
                              <Sunrise className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            ) : stop.time ? (
                              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                            ) : (
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                            )}
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                <p className="text-sm font-medium text-foreground">
                                  {stop.title}
                                </p>
                                {stop.time && (
                                  <span className="text-xs font-light text-muted-foreground">
                                    {stop.time}
                                  </span>
                                )}
                                {stop.distanceKm && (
                                  <span className="text-xs font-light text-muted-foreground">
                                    {stop.distanceKm} km
                                  </span>
                                )}
                              </div>
                              {stop.description && (
                                <p className="mt-1 text-sm font-light leading-6 text-muted-foreground">
                                  {stop.description}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Meals + accommodation */}
                    <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4 text-xs font-light text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Moon className="h-3.5 w-3.5 text-primary" />
                        {tour.accommodation.split(".")[0]}.
                      </span>
                      {i === 0 && (
                        <span className="inline-flex items-center gap-1.5">
                          <Sunrise className="h-3.5 w-3.5 text-accent" />
                          {tour.meals.split(".")[0]}.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Sticky booking column — stacks below the timeline on mobile */}
        {aside && (
          <div
            id="booking"
            className="scroll-mt-24 lg:sticky lg:top-28 lg:self-start"
          >
            {aside}
          </div>
        )}
        </div>
      </Container>
    </section>
  );
}
