"use client";

import { useEffect, useId, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getZaloLink, siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";

type SiteHeaderProps = {
  variant?: "overlay" | "solid";
};

export function SiteHeader({ variant = "overlay" }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const titleId = useId();
  const reduce = useReducedMotion();
  const isSolid = variant === "solid";
  const t = useTranslations("site");

  const navItems = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.tours"), href: "/#tours" },
    { label: t("nav.itinerary"), href: "/#itinerary" },
    { label: t("nav.services"), href: "/#services" },
    { label: t("nav.gallery"), href: "/#gallery" },
    { label: t("nav.blog"), href: "/blogs" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 96);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4 sm:pt-4">
      <div
        className={cn(
          "pointer-events-auto flex h-14 w-full items-center justify-between gap-2 border transition-[max-width,background-color,border-color,box-shadow,backdrop-filter,padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:h-16 lg:gap-6",
          isSolid
            ? scrolled
              ? "max-w-[1120px] rounded-full border-border bg-white/90 px-4 text-foreground shadow-[0_8px_32px_rgba(31,36,33,0.10)] backdrop-blur-xl sm:px-5 lg:px-6"
              : "max-w-[1120px] rounded-full border-border/60 bg-white/80 px-4 text-foreground shadow-sm backdrop-blur-xl sm:px-5 lg:px-6"
            : scrolled
              ? "max-w-[1120px] rounded-full border-white/[0.10] bg-[rgba(18,24,21,0.6)] px-4 text-dark-text shadow-[0_10px_36px_rgba(0,0,0,0.30),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xs sm:px-5 lg:px-6"
              : "max-w-7xl rounded-full border-transparent bg-transparent px-1 text-dark-text shadow-none backdrop-blur-none sm:px-2 lg:px-2",
        )}>
        <Link
          href="/"
          className="group flex min-w-0 shrink items-center gap-2.5 sm:gap-3"
          aria-label={`${siteConfig.brand.fullName} — ${t("header.home")}`}>
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-105 sm:h-9 sm:w-9">
            <Image
              src={siteConfig.assets.logo}
              alt={`${siteConfig.brand.fullName} logo`}
              width={36}
              height={36}
              className="object-cover"
            />
          </div>
          <div className="min-w-0 leading-none">
            <p
              className={cn(
                "hidden text-[0.6rem] font-medium uppercase tracking-[0.24em] transition-colors sm:block",
                isSolid
                  ? "text-muted-foreground"
                  : scrolled
                    ? "text-white/60"
                    : "text-white/75",
              )}
              style={
                isSolid || scrolled
                  ? undefined
                  : { textShadow: "0 1px 10px rgba(0,0,0,0.35)" }
              }>
              {siteConfig.brand.businessName}
            </p>
            <p
              className={cn(
                "mt-0.5 truncate font-serif text-base tracking-wide transition-colors group-hover:text-accent sm:text-lg",
                isSolid
                  ? "text-foreground"
                  : scrolled
                    ? "text-white"
                    : "text-white/95",
              )}
              style={
                isSolid || scrolled
                  ? undefined
                  : { textShadow: "0 1px 12px rgba(0,0,0,0.38)" }
              }>
              {siteConfig.brand.location}
            </p>
          </div>
        </Link>

        <nav
          className="hidden items-center gap-7 lg:flex"
          aria-label={t("header.mainNav")}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={
                isSolid || scrolled
                  ? undefined
                  : { textShadow: "0 1px 10px rgba(0,0,0,0.35)" }
              }
              className={cn(
                "group relative text-sm font-medium transition-colors",
                isSolid
                  ? "text-foreground/70 hover:text-foreground"
                  : scrolled
                    ? "text-white/80 hover:text-white"
                    : "text-white/90 hover:text-white",
              )}>
              {item.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <a
            href={getZaloLink()}
            target="_blank"
            rel="noreferrer"
            style={
              isSolid || scrolled
                ? undefined
                : { textShadow: "0 1px 10px rgba(0,0,0,0.35)" }
            }
            className={cn(
              "hidden text-sm font-medium transition-colors lg:inline-block",
              isSolid
                ? "text-muted-foreground hover:text-foreground"
                : scrolled
                  ? "text-white/75 hover:text-white"
                  : "text-white/85 hover:text-white",
            )}>
            {siteConfig.contact.phone}
          </a>
          <Link
            href="/#booking"
            className="group"
            aria-label={t("header.bookATour")}>
            <span className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md transition-all duration-200 group-hover:-translate-y-0.5 group-hover:bg-accent-hover group-hover:shadow-lg sm:h-9 sm:w-auto sm:gap-1.5 sm:px-5 sm:text-sm">
              <MessageCircle className="h-4 w-4 sm:hidden -mt-[2px]" />
              <span className="hidden whitespace-nowrap text-[0.8rem] font-medium sm:block">
                {t("header.bookATour")}
              </span>
            </span>
          </Link>

          <LocaleSwitcher variant={isSolid ? "solid" : "overlay"} />

          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger
              render={
                <button
                  type="button"
                  aria-label={t("header.openMenu")}
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors lg:hidden",
                    isSolid
                      ? "border-border bg-white text-foreground hover:border-foreground/15"
                      : scrolled
                        ? "border-white/15 bg-white/10 text-white backdrop-blur-md hover:border-white/25 hover:bg-white/15"
                        : "border-white/25 bg-white/10 text-white backdrop-blur-md hover:border-white/35 hover:bg-white/15",
                  )}>
                  <Menu className="h-4.5 w-4.5" />
                </button>
              }
            />
            <AnimatePresence>
              {open && (
                <Dialog.Portal>
                  <Dialog.Backdrop
                    className="fixed inset-0 z-[60] bg-dark-bg/40 backdrop-blur-sm"
                    render={
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduce ? 0 : 0.25 }}
                      />
                    }
                  />
                  <Dialog.Popup
                    className="fixed inset-y-0 right-0 z-[70] flex w-[86vw] max-w-sm flex-col bg-surface shadow-2xl"
                    aria-labelledby={titleId}
                    render={
                      <motion.div
                        initial={reduce ? false : { x: "100%" }}
                        animate={{ x: 0 }}
                        exit={reduce ? undefined : { x: "100%" }}
                        transition={{
                          duration: reduce ? 0 : 0.35,
                          ease: [0.22, 1, 0.36, 1],
                        }}>
                        <div className="flex items-center justify-between border-b border-border px-6 py-5">
                          <p
                            id={titleId}
                            className="font-serif text-xl text-foreground">
                            {t("header.menu")}
                          </p>
                          <Dialog.Close
                            render={
                              <button
                                type="button"
                                aria-label={t("header.closeMenu")}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background transition-colors hover:border-accent/40">
                                <X className="h-5 w-5 text-foreground" />
                              </button>
                            }
                          />
                        </div>

                        <nav
                          className="flex flex-1 flex-col gap-1 px-4 py-6"
                          aria-label={t("header.mobileNav")}>
                          {navItems.map((item, i) => (
                            <motion.div
                              key={item.href}
                              initial={reduce ? false : { opacity: 0, x: 16 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: reduce ? 0 : 0.08 + i * 0.05,
                                ease: [0.22, 1, 0.36, 1],
                              }}>
                              <Link
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className="flex items-center justify-between rounded-2xl px-4 py-4 font-serif text-2xl text-foreground transition-colors hover:bg-background hover:text-accent">
                                {item.label}
                                <span className="text-muted-foreground/40">
                                  →
                                </span>
                              </Link>
                            </motion.div>
                          ))}
                        </nav>

                        <div className="border-t border-border px-6 py-6">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            {t("header.hotlineZalo")}
                          </p>
                          <a
                            href={getZaloLink()}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 block font-serif text-xl text-foreground transition-colors hover:text-accent">
                            {siteConfig.contact.phone}
                          </a>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {siteConfig.contact.hours}
                          </p>
                        </div>
                      </motion.div>
                    }
                  />
                </Dialog.Portal>
              )}
            </AnimatePresence>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
