"use client";

import { Accordion } from "@base-ui/react/accordion";
import { useTranslations } from "next-intl";
import { MessageCircle, Plus } from "lucide-react";

import { Container } from "@/components/container";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeader } from "@/components/section-header";
import { getZaloLink, siteConfig } from "@/config/site";

export function FaqSection() {
  const t = useTranslations("home.faq");

  const faqs = [
    {
      q: t("items.solo.q"),
      a: t("items.solo.a"),
    },
    {
      q: t("items.luggage.q"),
      a: t("items.luggage.a", { brand: siteConfig.brand.shortName }),
    },
    {
      q: t("items.automatic.q"),
      a: t("items.automatic.a"),
    },
    {
      q: t("items.licence.q"),
      a: t("items.licence.a"),
    },
    {
      q: t("items.card.q"),
      a: t("items.card.a"),
    },
    {
      q: t("items.office.q", { brand: siteConfig.brand.shortName }),
      a: t("items.office.a", { brand: siteConfig.brand.shortName }),
    },
  ];

  return (
    <section className="py-24 lg:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
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
            <Reveal delay={0.2}>
              <a
                href={getZaloLink()}
                target="_blank"
                rel="noreferrer"
                className="group mt-8 inline-flex items-center gap-3 text-sm font-medium text-accent transition-colors hover:text-accent-hover">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-accent/30 bg-accent-tint transition-all duration-300 group-hover:translate-x-1 group-hover:bg-accent group-hover:text-accent-foreground">
                  <MessageCircle className="h-5 w-5" />
                </span>
                {t("messageUs")}
              </a>
            </Reveal>
          </div>

          <Reveal>
            <Accordion.Root
              className="divide-y divide-border rounded-[1.75rem] border border-border bg-card shadow-sm"
              defaultValue={["faq-0"]}>
              {faqs.map((faq, i) => (
                <Accordion.Item key={i} value={`faq-${i}`}>
                  <Accordion.Header>
                    <Accordion.Trigger
                      className="group flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-6 text-left outline-none sm:px-8"
                      aria-label={faq.q}>
                      <span className="font-serif text-lg text-foreground transition-colors group-hover:text-accent sm:text-xl">
                        {faq.q}
                      </span>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background transition-all duration-300 group-data-[panel-open]:rotate-45 group-data-[panel-open]:border-accent group-data-[panel-open]:bg-accent group-data-[panel-open]:text-accent-foreground">
                        <Plus className="h-4 w-4 text-accent transition-colors group-data-[panel-open]:text-accent-foreground" />
                      </span>
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Panel
                    render={
                      <div className="px-6 pb-6 sm:px-8">
                        <p className="max-w-2xl text-sm font-light leading-7 text-muted-foreground">
                          {faq.a}
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
