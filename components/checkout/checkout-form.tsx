"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Loader2,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

import { formatVnd } from "@/lib/pricing";
import { getZaloLink } from "@/src/config/site";
import type { Tour } from "@/types/domain";

type PayMethod = "vnpay" | "zalo";

interface QuoteResult {
  booking: {
    bookingCode: string;
    tourTitle: string;
    variant: string;
    departureDate: string;
    guestCount: number;
    customer: { fullName: string };
    totalAmount: number;
  };
  price: {
    lineItems: { label: string; amount: number; meta?: string }[];
    subtotal: number;
    discount: number;
    vat: number;
    cardFee: number;
    total: number;
  };
}

export function CheckoutForm({
  tour,
  initialVariantId,
}: {
  tour: Tour;
  initialVariantId?: string;
}) {
  const router = useRouter();
  const [variantId, setVariantId] = useState(
    initialVariantId ?? tour.variants[0]?.id ?? ""
  );
  const [guests, setGuests] = useState(1);
  const [date, setDate] = useState("");
  const [addOnIds, setAddOnIds] = useState<string[]>([]);
  const [payMethod, setPayMethod] = useState<PayMethod>("vnpay");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [zaloPhone, setZaloPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<QuoteResult | null>(null);

  const variant = useMemo(
    () => tour.variants.find((v) => v.id === variantId) ?? tour.variants[0],
    [tour, variantId]
  );

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const toggleAddOn = (id: string) =>
    setAddOnIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourId: tour.id,
          variantId,
          startDate: date,
          guestCount: guests,
          addOnIds,
          paymentPlan: "full",
          payByCard: payMethod === "vnpay",
          paymentMethod: payMethod === "vnpay" ? "vnpay" : "zalo/manual",
          customer: {
            fullName,
            phone,
            email: email || undefined,
            zaloPhone: zaloPhone || undefined,
            nationality: nationality || undefined,
            note: note || undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setQuote(data);

      if (payMethod === "vnpay") {
        // Create the VNPay payment URL and send the user to the gateway.
        const payRes = await fetch("/api/payments/vnpay/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingCode: data.booking.bookingCode }),
        });
        const payData = await payRes.json();
        if (!payRes.ok || !payData.url) {
          setError(
            payData.error ??
              "Booking created but the payment gateway could not be reached. Use your booking code to pay later."
          );
          return;
        }
        window.location.href = payData.url;
        return;
      }

      // Zalo: open Zalo with a prefilled message.
      const message = [
        `Xin chào Jasmine Tours! Tôi muốn đặt tour:`,
        `- Mã đặt tour: ${data.booking.bookingCode}`,
        `- Tour: ${data.booking.tourTitle} (${data.booking.variant})`,
        `- Ngày khởi hành: ${data.booking.departureDate}`,
        `- Số khách: ${data.booking.guestCount}`,
        `- Tên khách: ${data.booking.customer.fullName}`,
        `- Tổng tiền: ${formatVnd(data.booking.totalAmount)}`,
        "",
        "Vui lòng xác nhận giúp tôi. Cảm ơn!",
      ].join("\n");
      window.open(getZaloLink(message), "_blank", "noopener,noreferrer");

      // Show the booking summary + code on the same page.
      router.replace(`/booking/${data.booking.bookingCode}`);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ---- After a successful booking (quote set), show confirmation ----
  if (quote) {
    return (
      <div className="rounded-[1.75rem] border border-border bg-card p-8 shadow-lg sm:p-10">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Check className="h-6 w-6" />
          </span>
          <div>
            <p className="font-serif text-2xl text-foreground">
              Booking {quote.booking.bookingCode}
            </p>
            <p className="text-sm text-muted-foreground">
              {quote.booking.tourTitle} · {quote.booking.variant} ·{" "}
              {quote.booking.departureDate}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3 rounded-2xl bg-background p-6">
          {quote.price.lineItems.map((li) => (
            <div
              key={li.label}
              className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{li.label}</span>
              <span className="text-foreground">{formatVnd(li.amount)}</span>
            </div>
          ))}
          {quote.price.discount > 0 && (
            <div className="flex items-center justify-between text-sm text-primary">
              <span>Discount</span>
              <span>-{formatVnd(quote.price.discount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-medium text-foreground">Total</span>
            <span className="font-serif text-2xl text-accent-hover">
              {formatVnd(quote.price.total)}
            </span>
          </div>
        </div>

        {payMethod === "zalo" && (
          <p className="mt-6 rounded-2xl bg-accent-tint p-5 text-sm font-light leading-7 text-accent-hover">
            We&rsquo;ve opened Zalo with your booking details. Our team will
            confirm within a few hours. Keep your booking code — you can check
            status any time.
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/booking/${quote.booking.bookingCode}`}
            className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-7 text-sm font-medium text-accent-foreground shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover">
            View booking
          </Link>
          {payMethod === "vnpay" && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background px-7 text-sm font-medium text-foreground transition-colors hover:border-accent/40">
              Try payment again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.75rem] border border-border bg-card p-6 shadow-lg sm:p-8">
      {/* Summary header */}
      <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="font-serif text-2xl text-foreground">{tour.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {tour.durationDays} days · {tour.durationNights} nights ·{" "}
            {tour.destination}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-accent-tint px-3 py-1 text-xs font-medium text-accent-hover">
          From {formatVnd(tour.fromPrice)}
        </span>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-6">
        {/* Variant */}
        <div>
          <label className="mb-2.5 block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Riding option
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
                }`}>
                <span>
                  <span
                    className={`block text-sm font-medium ${
                      variant?.id === v.id
                        ? "text-accent-hover"
                        : "text-foreground"
                    }`}>
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
                  }`}>
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
              className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              Start date
            </label>
            <input
              id="date"
              type="date"
              required
              min={minDate}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              Guests
            </label>
            <div className="flex items-center justify-between rounded-xl border border-border bg-background px-2 py-1.5">
              <button
                type="button"
                aria-label="Remove a guest"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <Minus className="h-4 w-4" />
              </button>
              <span className="font-serif text-lg text-foreground">{guests}</span>
              <button
                type="button"
                aria-label="Add a guest"
                onClick={() => setGuests((g) => Math.min(12, g + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Add-ons */}
        {tour.addOns.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Optional extras
            </p>
            <div className="space-y-2">
              {tour.addOns.map((a) => (
                <label
                  key={a.id}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all duration-200 ${
                    addOnIds.includes(a.id)
                      ? "border-accent bg-accent-tint"
                      : "border-border bg-background hover:border-accent/40"
                  }`}>
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

        {/* Customer info */}
        <div className="rounded-2xl bg-background p-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Your information
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <input
                type="text"
                required
                placeholder="Full name *"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <input
              type="tel"
              required
              placeholder="Phone *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-ring/40"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-ring/40"
            />
            <input
              type="tel"
              placeholder="Zalo number (optional)"
              value={zaloPhone}
              onChange={(e) => setZaloPhone(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-ring/40"
            />
            <input
              type="text"
              placeholder="Nationality (optional)"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-ring/40"
            />
            <div className="sm:col-span-2">
              <textarea
                placeholder="Note (optional)"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-ring/40"
              />
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div>
          <p className="mb-2.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            How would you like to pay?
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPayMethod("vnpay")}
              aria-pressed={payMethod === "vnpay"}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200 ${
                payMethod === "vnpay"
                  ? "border-accent bg-accent-tint"
                  : "border-border bg-background hover:border-accent/40"
              }`}>
              <Wallet
                className={`h-5 w-5 ${
                  payMethod === "vnpay" ? "text-accent-hover" : "text-muted-foreground"
                }`}
              />
              <span>
                <span
                  className={`block text-sm font-medium ${
                    payMethod === "vnpay" ? "text-accent-hover" : "text-foreground"
                  }`}>
                  Pay now with VNPay
                </span>
                <span className="block text-xs font-light text-muted-foreground">
                  Online card / bank transfer
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPayMethod("zalo")}
              aria-pressed={payMethod === "zalo"}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200 ${
                payMethod === "zalo"
                  ? "border-accent bg-accent-tint"
                  : "border-border bg-background hover:border-accent/40"
              }`}>
              <MessageCircle
                className={`h-5 w-5 ${
                  payMethod === "zalo" ? "text-accent-hover" : "text-muted-foreground"
                }`}
              />
              <span>
                <span
                  className={`block text-sm font-medium ${
                    payMethod === "zalo" ? "text-accent-hover" : "text-foreground"
                  }`}>
                  Contact via Zalo
                </span>
                <span className="block text-xs font-light text-muted-foreground">
                  Confirm with our team first
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* Price summary */}
        <div className="space-y-2 rounded-2xl bg-background p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {variant?.name} × {guests} {guests === 1 ? "rider" : "riders"}
            </span>
            <span className="font-medium text-foreground">
              {variant?.priceType === "per_group"
                ? formatVnd(variant?.basePrice ?? 0)
                : `${formatVnd(variant?.basePrice ?? 0)} / person`}
            </span>
          </div>
          {addOnIds.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Extras</span>
              <span className="font-medium text-foreground">
                {formatVnd(
                  tour.addOns
                    .filter((a) => addOnIds.includes(a.id))
                    .reduce(
                      (sum, a) =>
                        sum + (a.perPerson ? a.price * guests : a.price),
                      0
                    )
                )}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-medium text-foreground">
              Estimated total
            </span>
            <span className="font-serif text-2xl text-accent-hover">
              {formatVnd(
                (variant?.priceType === "per_group"
                  ? variant?.basePrice ?? 0
                  : (variant?.basePrice ?? 0) * guests) +
                  tour.addOns
                    .filter((a) => addOnIds.includes(a.id))
                    .reduce(
                      (sum, a) =>
                        sum + (a.perPerson ? a.price * guests : a.price),
                      0
                    )
              )}
            </span>
          </div>
          <p className="pt-1 text-[0.7rem] font-light leading-5 text-muted-foreground">
            Final price confirmed on the server. VNPay online payment includes
            a 4% card fee.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="group flex h-13 w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-medium text-accent-foreground shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating booking…
            </>
          ) : payMethod === "vnpay" ? (
            <>
              <Wallet className="h-4 w-4" />
              Book & pay now
            </>
          ) : (
            <>
              <MessageCircle className="h-4 w-4" />
              Book via Zalo
            </>
          )}
        </button>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs font-light text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          Free cancellation · No payment needed now for Zalo bookings
        </p>

        <Link
          href={`/tours/${tour.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-accent">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to tour details
        </Link>
      </div>
    </form>
  );
}
