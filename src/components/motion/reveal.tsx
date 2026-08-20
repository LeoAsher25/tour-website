"use client";

import {
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from "framer-motion";
import { type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

type Viewport = NonNullable<
  React.ComponentProps<typeof motion.div>["viewport"]
>;

/** Scroll-triggered fade-in-up reveal. Respects prefers-reduced-motion. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 18,
  once = true,
  viewport,
  transition,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
  viewport?: Viewport;
  transition?: Transition;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport ?? { once, amount: 0.5 }}
      transition={transition ?? { duration: 0.6, delay, ease: EASE }}>
      {children}
    </motion.div>
  );
}

/** Container that staggers its `<StaggerItem>` children on scroll. Parent owns viewport. */
export function Stagger({
  children,
  className,
  delay = 0,
  gap = 0.08,
  viewport,
  transition,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  gap?: number;
  viewport?: Viewport;
  transition?: Transition;
}) {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    visible: {
      transition: transition ?? { staggerChildren: gap, delayChildren: delay },
    },
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial={reduce ? false : "hidden"}
      whileInView="visible"
      viewport={viewport ?? { once: true, amount: 0.5 }}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 16,
  scale: _scale = undefined,
  transition,
  viewport,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  scale?: boolean;
  transition?: Transition;
  viewport?: Viewport;
}) {
  void _scale;
  const reduce = useReducedMotion();

  const item: Variants = {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: transition ?? { duration: 0.6, ease: EASE },
    },
  };

  return (
    <motion.div
      className={className}
      variants={reduce ? undefined : item}
      viewport={viewport}>
      {children}
    </motion.div>
  );
}

/** Cinematic clip-path mask reveal — image wipes into place on scroll. */
export function MaskReveal({
  children,
  className,
  delay = 0,
  duration = 0.65,
  viewport,
  transition,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  viewport?: Viewport;
  transition?: Transition;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={{ willChange: "clip-path" }}
      initial={
        reduce
          ? false
          : { clipPath: "inset(16% 12% 16% 12% round 2rem)", opacity: 0 }
      }
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 2rem)", opacity: 1 }}
      viewport={viewport ?? { once: true, amount: 0.3 }}
      transition={
        (transition as unknown as Transition) ??
        ({
          clipPath: { duration, ease: "linear", delay, type: "tween" as const },
          opacity: { duration, ease: "linear", delay, type: "tween" as const },
        } as unknown as Transition)
      }>
      {children}
    </motion.div>
  );
}
