"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, CalendarDays, Minus, Plus, ShieldCheck, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";

import { formatVnd } from "@/lib/pricing";
import type { Tour } from "@/types/domain";

/**
 * Sticky booking card for tour detail.
 * Desktop: sticky sidebar. Mobile: bottom action bar.
 * Links to the checkout flow (server-side pricing + VNPay / Zalo).
 */
export function TourBookingCard({ tour }: { tour: Tour }) {
  const t = useTranslations("tourDetail.bookingCard");
  const [variantId, setVariantId] = useState(tour.variants[0]?.id ?? "");
  const [guests, setGuests] = useState(1);
  const [date, setDate] = useState("");
  const [addOnIds, setAddOnIds] = useState<string[]>([]);

  const variant = useMemo(
    () => tour.variants.find((v) => v.id === variantId) ?? tour.variants[0],
    [tour, variantId]
  );

  const subtotal = useMemo(() => {
    if (!variant) return 0;
    const base =
      variant.priceType === "per_group"
        ? variant.basePrice
        : variant.basePrice * guests;
    const addOns = tour.addOns
      .filter((a) => addOnIds.includes(a.id))
      .reduce((sum, a) => sum + (a.perPerson ? a.price * guests : a.price), 0);
    return base + addOns;
  }, [variant, guests, addOnIds, tour.addOns]);

  const toggleAddOn = (id: string) =>
    setAddOnIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    );

  return (
    <>
      {/* Desktop sticky card */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-lg sm:p-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {t("from")}
            </p>
            <p className="font-serif text-3xl text-accent-hover">
              {formatVnd(variant?.basePrice ?? tour.fromPrice)}
            </p>
            <p className="text-xs font-light text-muted-foreground">
              {t(variant?.priceType === "per_group" ? "perGroup" : "perPerson")}
            </p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-accent-tint px-3 py-1 text-xs font-medium text-accent-hover">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t("freeCancellation")}
          </span>
        </div>

        <div className="mt-6 space-y-5">
          {/* Variant selector */}
          <div>
            <label
              htmlFor="variant"
              className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground"
            >
              {t("ridingOption")}
            </label>
            <div className="grid gap-2">
              {tour.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariantId(v.id)}
                  aria-pressed={variant?.id === v.id}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                    variant?.id === v.id
                      ? "border-accent bg-accent-tint"
                      : "border-border bg-background hover:border-accent/40"
                  }`}
                >
                  <span>
                    <span
                      className={`block text-sm font-medium ${
                        variant?.id === v.id
                          ? "text-accent-hover"
                          : "text-foreground"
                      }`}
                    >
                      {v.name}
                    </span>
                    <span className="mt-0.5 block text-xs font-light text-muted-foreground">
                      {v.description}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 font-serif text-sm ${
                      variant?.id === v.id
                        ? "text-accent-hover"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formatVnd(v.basePrice)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date + guests */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="date"
                className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                {t("startDate")}
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <div>
              <label
                htmlFor="guests"
                className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground"
              >
                <Users className="h-3.5 w-3.5" />
                {t("guests")}
              </label>
              <div className="flex items-center justify-between rounded-xl border border-border bg-background px-2 py-1.5">
                <button
                  type="button"
                  aria-label={t("removeGuest")}
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-serif text-lg text-foreground">
                  {guests}
                </span>
                <button
                  type="button"
                  aria-label={t("addGuest")}
                  onClick={() => setGuests((g) => Math.min(12, g + 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Add-ons */}
          {tour.addOns.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {t("optionalExtras")}
              </p>
              <div className="space-y-2">
                {tour.addOns.map((a) => (
                  <label
                    key={a.id}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all duration-200 ${
                      addOnIds.includes(a.id)
                        ? "border-accent bg-accent-tint"
                        : "border-border bg-background hover:border-accent/40"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={addOnIds.includes(a.id)}
                        onChange={() => toggleAddOn(a.id)}
                        className="h-4 w-4 accent-[var(--accent)]"
                      />
                      <span>
                        <span className="block text-sm font-medium text-foreground">
                          {a.name}
                        </span>
                        <span className="block text-xs font-light text-muted-foreground">
                          {a.description}
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 font-serif text-sm text-accent-hover">
                      +{formatVnd(a.price)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="space-y-2 rounded-2xl bg-background p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {variant?.name} × {guests}{" "}
                {guests === 1 ? t("rider") : t("riders")}
              </span>
              <span className="font-medium text-foreground">
                {formatVnd(subtotal)}
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
            <p className="pt-1 text-[0.7rem] font-light leading-5 text-muted-foreground">
              {t("finalPriceNote")}
            </p>
          </div>

          <Link
            href={`/checkout/${tour.slug}?variant=${variant?.id ?? ""}`}
            className="group flex h-13 w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-medium text-accent-foreground shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-xl"
          >
            {t("bookThisTour")}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <p className="text-center text-xs font-light text-muted-foreground">
            {t("instantBooking")}
          </p>
        </div>
      </div>
    </>
  );
}
