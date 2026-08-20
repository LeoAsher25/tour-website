"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

import { Container } from "@/components/container";
import { SectionHeader } from "@/components/section-header";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import type { Tour } from "@/types/domain";

const EASE = [0.22, 1, 0.36, 1] as const;

export function TourHighlights({ tour }: { tour: Tour }) {
  const reduce = useReducedMotion();
  const t = useTranslations("tourDetail.highlights");

  return (
    <section className="bg-surface py-20 lg:py-28">
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

        <Stagger className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-2">
          {tour.highlights.map((highlight, i) => (
            <StaggerItem key={highlight}>
              <motion.div
                whileHover={reduce ? undefined : { y: -4 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="group flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Check className="h-4 w-4 text-primary group-hover:text-primary-foreground" />
                </span>
                <div>
                  <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-accent">
                    {t("experience", { number: String(i + 1).padStart(2, "0") })}
                  </p>
                  <p className="mt-1.5 font-serif text-lg leading-snug text-foreground">
                    {highlight}
                  </p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
