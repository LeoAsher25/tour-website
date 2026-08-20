"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, CalendarDays, Minus, Plus, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";

import { Container } from "@/components/container";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeader } from "@/components/section-header";
import { formatVnd } from "@/lib/pricing";
import { siteConfig } from "@/config/site";
import type { HomepageTourSectionData } from "@/types/domain";

export function BookingSection({ data }: { data: HomepageTourSectionData }) {
  const t = useTranslations("home.booking");
  const tours = data.booking;
  const tourOptions = useMemo(
    () =>
      tours
        .filter((t) => t.variants.length > 0)
        .map((t) => ({ id: t.id, title: t.title, tour: t })),
    [tours],
  );

  const [tourId, setTourId] = useState(tourOptions[0]?.id ?? "");
  const [variantId, setVariantId] = useState(
    tourOptions[0]?.tour.variants[0].id ?? "",
  );
  const [guests, setGuests] = useState(1);
  const [date, setDate] = useState("");

  const selected = useMemo(
    () => tourOptions.find((o) => o.id === tourId)?.tour,
    [tourId, tourOptions],
  );

  const selectedVariant = useMemo(
    () => selected?.variants.find((v) => v.id === variantId),
    [selected, variantId],
  );

  const subtotal = useMemo(() => {
    if (!selectedVariant || selectedVariant.priceType === "per_group") {
      return selectedVariant?.basePrice ?? 0;
    }
    return selectedVariant.basePrice * guests;
  }, [selectedVariant, guests]);

  return (
    <section id="booking" className="scroll-mt-24 py-24 lg:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <SectionHeader
              eyebrow={t("eyebrow")}
              title={
                <>
                  {t("title1")} <span className="accent-word">{t("titleAccent")}</span>
                  {t("question")}
                </>
              }
              description={t("description")}
            />
            <div className="mt-9 space-y-5">
              {[
                t("points.freeDorm", { location: siteConfig.brand.location }),
                t("points.privateRoom"),
                t("points.twoPerBike"),
                t("points.payOptions"),
              ].map((point, i) => (
                <Reveal key={point} delay={0.1 + i * 0.07}>
                  <div className="group flex items-start gap-4">
                    <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-accent transition-transform duration-300 group-hover:scale-125" />
                    <p className="text-sm font-light leading-7 text-muted-foreground">
                      {point}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Booking card */}
          <Reveal delay={0.12} y={18}>
            <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl sm:p-9">
              <div className="space-y-7">
                {/* Tour select */}
                <div>
                  <label
                    htmlFor="tour"
                    className="mb-2.5 block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {t("chooseTour")}
                  </label>
                  <select
                    id="tour"
                    value={tourId}
                    onChange={(e) => {
                      const t = tourOptions.find(
                        (o) => o.id === e.target.value,
                      );
                      setTourId(e.target.value);
                      if (t) setVariantId(t.tour.variants[0].id);
                    }}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm text-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-ring/40">
                    {tourOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Variant select */}
                {selected && (
                  <div>
                    <label
                      htmlFor="variant"
                      className="mb-2.5 block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {t("ridingOption")}
                    </label>
                    <div className="grid gap-2.5 sm:grid-cols-3">
                      {selected.variants.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setVariantId(v.id)}
                          aria-pressed={variantId === v.id}
                          className={`rounded-xl border px-3 py-3.5 text-left transition-all duration-200 ${
                            variantId === v.id
                              ? "border-accent bg-accent-tint text-accent-hover shadow-sm"
                              : "border-border bg-background text-muted-foreground hover:-translate-y-0.5 hover:border-accent/40"
                          }`}>
                          <span className="block text-xs font-medium">
                            {v.name}
                          </span>
                          <span className="mt-1 block text-[0.7rem] font-light">
                            {formatVnd(v.basePrice)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date + guests */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="date"
                      className="mb-2.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {t("startDate")}
                    </label>
                    <input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm text-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-ring/40"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="guests"
                      className="mb-2.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {t("guests")}
                    </label>
                    <div className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2">
                      <button
                        type="button"
                        aria-label={t("removeGuest")}
                        onClick={() => setGuests((g) => Math.max(1, g - 1))}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-90">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-serif text-xl text-foreground">
                        {guests}
                      </span>
                      <button
                        type="button"
                        aria-label={t("addGuest")}
                        onClick={() => setGuests((g) => Math.min(12, g + 1))}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-90">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-3 rounded-2xl bg-background p-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {selectedVariant?.name} × {guests}{" "}
                      {guests === 1 ? t("rider") : t("riders")}
                    </span>
                    <span className="text-foreground">
                      {selectedVariant?.priceType === "per_group"
                        ? t("groupPrice")
                        : formatVnd(selectedVariant?.basePrice ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-sm font-medium text-foreground">
                      {t("estimatedTotal")}
                    </span>
                    <span className="font-serif text-2xl text-accent-hover">
                      {formatVnd(subtotal)}
                    </span>
                  </div>
                  <p className="text-xs font-light text-muted-foreground">
                    {t("finalPriceNote")}
                  </p>
                </div>

                <Link
                  href={`/checkout/${selected?.slug}?variant=${selectedVariant?.id ?? ""}`}
                  className="group flex h-13 w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-medium text-accent-foreground shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-xl">
                  {t("bookThisTour")}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
