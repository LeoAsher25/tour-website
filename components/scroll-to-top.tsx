"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.7, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.7, y: 25 }}
          transition={{
            duration: reduce ? 0.3 : 0.6,
            ease: "linear",
          }}
          className={cn(
            "fixed bottom-6 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-all duration-200 hover:-translate-y-1 hover:bg-accent-hover hover:shadow-xl sm:bottom-8 sm:right-8 sm:h-14 sm:w-14",
          )}>
          <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
