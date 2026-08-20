import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";

import { Container } from "@/components/container";
import { MaskReveal } from "@/components/motion/reveal";
import { getZaloLink } from "@/config/site";

export async function FinalCtaSection() {
  const t = await getTranslations("home.finalCta");
  return (
    <section className="py-24 lg:py-32">
      <Container>
        <MaskReveal>
          <div className="group relative overflow-hidden rounded-[2rem] border border-border shadow-xl">
            <div className="absolute inset-0" aria-hidden="true">
              <Image
                src="/images/tours/bong-bang-homestay-20220401080328_1680436382.jpg.webp"
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-dark-bg/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-dark-bg/60 to-transparent" />

            <div className="relative px-6 py-20 sm:px-12 sm:py-24 lg:px-16">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-accent-tint">
                {t("eyebrow")}
              </p>
              <h2 className="mt-5 max-w-2xl font-serif text-5xl leading-[1.02] text-dark-text sm:text-6xl">
                {t("title1")}{" "}
                <span className="accent-word">{t("titleAccent")}</span>{" "}
                {t("title2")}
              </h2>
              <p className="mt-7 max-w-xl text-base font-light leading-8 text-dark-muted sm:text-lg">
                {t("text")}
              </p>
              <div className="mt-11 flex flex-wrap gap-4">
                <Link
                  href="/#booking"
                  className="group inline-flex h-13 items-center gap-2 rounded-full bg-accent px-9 py-4 text-sm font-medium text-accent-foreground shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-2xl">
                  {t("bookYourRide")}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <a
                  href={getZaloLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-dark-text/30 px-9 py-4 text-sm font-medium text-dark-text backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:text-accent">
                  <MessageCircle className="h-4 w-4" />
                  {t("talkToGuide")}
                </a>
              </div>
            </div>
          </div>
        </MaskReveal>
      </Container>
    </section>
  );
}
