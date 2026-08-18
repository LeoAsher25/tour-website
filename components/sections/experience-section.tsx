import Image from "next/image";

import { Container } from "@/components/container";
import { Reveal } from "@/components/motion/reveal";
import { strengths } from "@/lib/data/tours";

export function ExperienceSection() {
  return (
    <section className="relative overflow-hidden bg-dark-bg py-24 text-dark-text lg:py-32">
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/images/intro/ha-giang1_1680113533.jpg.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-25"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-dark-bg/60 to-dark-bg" />

      <Container className="relative">
        <div className="grid gap-16 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <Reveal>
            <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.24em] text-accent-tint">
              <span className="h-px w-8 bg-accent" />
              The Ha Giang Experience
            </p>
            <h2 className="mt-5 max-w-xl font-serif text-5xl leading-[1.02] sm:text-6xl">
              Conquer your own fear after conquering legendary{" "}
              <span className="accent-word">hairpin</span> turns
            </h2>
            <p className="mt-7 max-w-lg text-base font-light leading-8 text-dark-muted sm:text-lg">
              The Ha Giang Loop is like something out of a movie — steep passes,
              winding bends and hairpin turns that may create a rush of
              adrenaline or even fear. But with our expert guides, you will
              overcome this fear and conquer the &ldquo;North Pole&rdquo;,
              earning the respect of your friends and family.
            </p>
          </Reveal>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-dark-text/10 bg-dark-text/10 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {strengths.map((s, i) => (
              <Reveal
                key={s.title}
                delay={0.2 + i * 0.2}
                className="bg-dark-bg/80">
                <div className="group h-full p-7 backdrop-blur-sm">
                  <p className="font-serif text-5xl text-accent transition-transform duration-300 group-hover:-translate-y-0.5">
                    {s.value}
                  </p>
                  <p className="mt-3 text-sm font-medium uppercase tracking-[0.16em] text-dark-text">
                    {s.title}
                  </p>
                  <p className="mt-2 text-sm font-light leading-6 text-dark-muted">
                    {s.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
