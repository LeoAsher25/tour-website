"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function scrollToHash(hash: string) {
  const id = hash.startsWith("#") ? hash : `#${hash}`;
  const el = document.querySelector(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
  }
  return false;
}

export function RouteScrollReset() {
  const pathname = usePathname();
  const firstRef = useRef(true);

  useEffect(() => {
    try {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
    } catch {}

    if (firstRef.current) {
      firstRef.current = false;
      const hash = window.location.hash;
      if (hash) {
        requestAnimationFrame(() => {
          if (!scrollToHash(hash)) {
            setTimeout(() => scrollToHash(hash), 120);
          }
        });
      }
      return;
    }

    const hash = window.location.hash;

    if (hash) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!scrollToHash(hash)) {
            const t = setTimeout(() => scrollToHash(hash), 120);
            void t;
          }
        });
      });
      return () => cancelAnimationFrame(raf);
    }

    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });

    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        html.style.scrollBehavior = prev;
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash;
      if (hash) scrollToHash(hash);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return null;
}
