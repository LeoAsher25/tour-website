"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Container } from "@/components/container";
import { MaskReveal } from "@/components/motion/reveal";

export function VideoSection() {
  const reduce = useReducedMotion();

  return (
    <section className="relative py-24 lg:py-32">
      <Container>
        <MaskReveal duration={0.75}>
          <div className="group relative overflow-hidden rounded-[2rem] border border-border shadow-xl transition-shadow duration-300 hover:shadow-2xl">
            <div className="relative h-[420px] sm:h-[520px] lg:h-[620px]">
              <Image
                src="/images/videos/maxresdefault-2-_1678809870.jpg.webp"
                alt="Video preview — riders on the Ha Giang Loop"
                fill
                sizes="100vw"
                className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-dark-bg/20 to-transparent" />

              {/* Play button — pulsing halo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  aria-label="Play the Ha Giang Loop video"
                  className="group/play relative flex h-20 w-20 items-center justify-center rounded-full border border-dark-text/40 bg-dark-bg/30 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-accent sm:h-24 sm:w-24">
                  {!reduce && (
                    <motion.span
                      className="absolute inset-0 rounded-full border border-accent/50"
                      animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                      aria-hidden="true"
                    />
                  )}
                  <Play className="ml-1 h-8 w-8 text-dark-text transition-colors group-hover/play:text-accent-foreground" />
                </button>
              </div>

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-accent-tint">
                  Watch the loop
                </p>
                <h2 className="mt-3 max-w-xl font-serif text-3xl text-dark-text sm:text-4xl">
                  One of the best locations to travel in Vietnam
                </h2>
              </div>
            </div>
          </div>
        </MaskReveal>
      </Container>
    </section>
  );
}
