"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function RouteScrollReset() {
  const pathname = usePathname();
  const firstRef = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
    } catch {}

    if (firstRef.current) {
      firstRef.current = false;
      return;
    }

    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });

    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        html.style.scrollBehavior = prev;
      });
    });

    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
