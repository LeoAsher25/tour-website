"use client";

import { Accordion } from "@base-ui/react/accordion";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";

import { Container } from "@/components/container";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeader } from "@/components/section-header";
import type { Tour } from "@/types/domain";

export function TourFaq({ tour }: { tour: Tour }) {
  const t = useTranslations("tourDetail.faq");
  if (tour.faqs.length === 0) return null;

  return (
    <section className="bg-surface py-20 lg:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <SectionHeader
              eyebrow={t("eyebrow")}
              title={
                <>
                  {t("title1")}{" "}
                  <span className="accent-word">{t("titleAccent")}</span>
                </>
              }
              description={t("description")}
            />
          </div>

          <Reveal>
            <Accordion.Root
              className="divide-y divide-border rounded-2xl border border-border bg-card"
              defaultValue={["faq-0"]}
            >
              {tour.faqs.map((faq, i) => (
                <Accordion.Item key={faq.id} value={`faq-${i}`}>
                  <Accordion.Header>
                    <Accordion.Trigger
                      className="group flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left outline-none"
                      aria-label={faq.question}
                    >
                      <span className="font-serif text-lg text-foreground transition-colors group-hover:text-accent">
                        {faq.question}
                      </span>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background transition-transform duration-300 group-data-[panel-open]:rotate-45">
                        <Plus className="h-4 w-4 text-accent" />
                      </span>
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Panel
                    render={
                      <div className="px-6 pb-5">
                        <p className="text-sm font-light leading-7 text-muted-foreground">
                          {faq.answer}
                        </p>
                      </div>
                    }
                  />
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
