"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, Camera, Compass, Home } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/container";

const EASE = [0.22, 1, 0.36, 1] as const;

const copyGroup: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.04,
    },
  },
};

const copyItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: EASE },
  },
};

const featureGroup: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.06,
    },
  },
};

const featureItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

export function IntroSection() {
  const reduce = useReducedMotion();
  const t = useTranslations("home.intro");

  const features = [
    { icon: Compass, title: t("features.guide.title"), text: t("features.guide.text") },
    { icon: Home, title: t("features.locals.title"), text: t("features.locals.text") },
    { icon: Camera, title: t("features.media.title"), text: t("features.media.text") },
  ];

  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
          <motion.div
            className="relative"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: reduce ? 0 : 0.75, ease: EASE }}>
            <div className="overflow-hidden rounded-[2rem] border border-border shadow-lg bg-black">
              <Image
                src="/images/intro/1.webp"
                alt={t("imgAlt1")}
                width={880}
                height={1100}
                className="h-[560px] w-full object-cover"
              />
            </div>

            <div className="absolute -bottom-8 -right-4 hidden w-48 overflow-hidden rounded-3xl border-4 border-background shadow-xl sm:block lg:-right-8 bg-black">
              <Image
                src="/images/intro/2.webp"
                alt={t("imgAlt2")}
                width={480}
                height={600}
                className="h-56 w-full object-cover"
              />
            </div>

            <div className="absolute -top-5 -left-3 hidden rounded-full bg-accent px-5 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-accent-foreground shadow-lg md:block">
              {t("badge")}
            </div>
          </motion.div>

          <div>
            {/* One viewport observer for the main copy instead of multiple independent reveals. */}
            <motion.div
              variants={copyGroup}
              initial={reduce ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              transition={{
                duration: reduce ? 0 : 0.75,
                ease: EASE,
              }}>
              <motion.div variants={copyItem}>
                <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.24em] text-accent">
                  <span className="h-px w-8 bg-accent/60" />
                  {t("eyebrow")}
                </p>

                <h2 className="mt-5 font-serif text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">
                  {t("title1")}
                  <br />
                  {t("title2")} <span className="accent-word">{t("titleAccent")}</span>
                </h2>
              </motion.div>

              <motion.p
                variants={copyItem}
                className="mt-7 max-w-xl text-base font-light leading-8 text-muted-foreground sm:text-lg">
                {t("text")}
              </motion.p>
            </motion.div>

            {/* Feature cards share one observer and only stagger slightly. */}
            <motion.div
              className="mt-12 space-y-5"
              variants={featureGroup}
              initial={reduce ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}>
              {features.map(({ icon: Icon, title, text }) => (
                <motion.div key={title} variants={featureItem}>
                  <div className="group flex gap-5 rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md">
                    <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-accent-tint text-accent-hover transition-transform duration-300 group-hover:scale-105">
                      <Icon className="h-5.5 w-5.5" />
                    </div>

                    <div>
                      <h3 className="font-serif text-xl text-foreground">
                        {title}
                      </h3>
                      <p className="mt-1.5 text-sm font-light leading-6 text-muted-foreground">
                        {text}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              <motion.div variants={featureItem}>
                <Link
                  href="/#tours"
                  className="group mt-11 inline-flex items-center gap-3 text-sm font-medium text-accent transition-colors hover:text-accent-hover">
                  {t("exploreTours")}
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/30 bg-accent-tint transition-all duration-300 group-hover:translate-x-1 group-hover:bg-accent group-hover:text-accent-foreground">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
