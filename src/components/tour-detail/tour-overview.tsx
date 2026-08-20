"use client";

import { useTranslations } from "next-intl";
import {
  Clock,
  Gauge,
  MapPin,
  Mountain,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import type { Tour } from "@/types/domain";

/** Quick-fact cards (duration, difficulty, group, vehicle, etc.) */
export function TourOverview({ tour }: { tour: Tour }) {
  const t = useTranslations("tourDetail.overview");

  const facts = [
    { icon: Clock, label: t("facts.duration"), value: t("durationValue", { days: tour.durationDays, nights: tour.durationNights }) },
    { icon: MapPin, label: t("facts.destination"), value: tour.destination },
    { icon: Gauge, label: t("facts.difficulty"), value: tour.difficulty },
    { icon: Users, label: t("facts.groupSize"), value: tour.groupSize ?? "Small group" },
    { icon: Mountain, label: t("facts.vehicle"), value: tour.vehicle ?? tour.transportation },
    { icon: ShieldCheck, label: t("facts.suitableFor"), value: tour.suitableFor },
  ];

  return (
    <section className="border-b border-border bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          {/* Overview narrative */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                {t("eyebrow")}
              </p>
              <h2 className="mt-4 font-serif text-4xl leading-[1.05] text-foreground sm:text-5xl">
                {t("title1")}{" "}
                <span className="accent-word">{t("titleAccent")}</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-8 max-w-xl text-lg font-light leading-8 text-muted-foreground">
                {tour.overview}
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border bg-surface p-5">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <p className="text-sm font-light leading-7 text-muted-foreground">
                  <span className="font-medium text-foreground">{t("whyRideWithUs")}</span>{" "}
                  {t("whyRideText")}
                </p>
              </div>
            </Reveal>
          </div>

          {/* Quick facts grid */}
          <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {facts.map((fact) => {
              const Icon = fact.icon;
              return (
                <StaggerItem key={fact.label}>
                  <div
                    className="group flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-tint transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-foreground">
                      <Icon className="h-5 w-5 text-accent group-hover:text-accent-foreground" />
                    </span>
                    <div>
                      <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        {fact.label}
                      </p>
                      <p className="mt-1.5 font-serif text-lg leading-snug text-foreground">
                        {fact.value}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
