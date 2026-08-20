"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Check, ChevronDown } from "lucide-react";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LOCALE_META = {
  en: { label: "EN", name: "English", flag: "/images/en-flag.webp" },
  vi: { label: "VI", name: "Tiếng Việt", flag: "/images/vn-flag.webp" },
} as const;

/**
 * Language switcher — a compact flag + code trigger that opens a dropdown
 * with both languages. Keeps the current page (pathname) when switching
 * between /en and /vi. Closes on outside click or Escape.
 */
export function LocaleSwitcher({
  className,
  variant = "solid",
}: {
  className?: string;
  variant?: "overlay" | "solid";
}) {
  const pathname = usePathname();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current =
    LOCALE_META[locale as keyof typeof LOCALE_META] ?? LOCALE_META.en;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Language: ${current.name}`}
        className={cn(
          "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-2.5 transition-colors",
          variant === "overlay"
            ? "border-white/25 bg-white/10 text-white backdrop-blur-md hover:border-white/40 hover:bg-white/15"
            : "border-border bg-background text-foreground hover:border-foreground/20",
        )}>
        <Image
          src={current.flag}
          alt=""
          width={20}
          height={14}
          className="h-3.5 w-5 rounded-[2px] object-cover"
        />
        <span className="text-xs font-semibold uppercase tracking-wider">
          {current.label}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 opacity-60 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-[70] mt-2 w-44 overflow-hidden rounded-xl border border-border bg-card py-1.5 shadow-xl"
        >
          {routing.locales.map((loc) => {
            const meta = LOCALE_META[loc as keyof typeof LOCALE_META];
            const isActive = loc === locale;
            return (
              <a
                key={loc}
                role="menuitem"
                href={`/${loc}${pathname}`}
                onClick={() => setOpen(false)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-accent-tint font-medium text-accent-hover"
                    : "text-foreground hover:bg-muted",
                )}>
                <Image
                  src={meta.flag}
                  alt=""
                  width={20}
                  height={14}
                  className="h-3.5 w-5 rounded-[2px] object-cover"
                />
                <span className="flex-1">{meta.name}</span>
                {isActive && <Check className="h-4 w-4 text-accent" />}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
