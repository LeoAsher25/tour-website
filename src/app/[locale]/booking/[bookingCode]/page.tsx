import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  MessageCircle,
  Phone,
  Users,
  Wallet,
} from "lucide-react";

import { Container } from "@/components/container";
import { BookingPayButton } from "@/components/booking/booking-pay-button";
import { SiteFooter } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { getBookingByCode } from "@/lib/bookings";
import { formatVnd } from "@/lib/pricing";
import { getPhoneLink, getZaloLink, siteConfig } from "@/config/site";

interface BookingPageProps {
  params: Promise<{ locale: string; bookingCode: string }>;
}

export async function generateMetadata({
  params,
}: BookingPageProps): Promise<Metadata> {
  const { locale, bookingCode } = await params;
  const t = await getTranslations({ locale, namespace: "booking.page" });
  return {
    title: t("title", { code: bookingCode }),
    robots: { index: false, follow: false },
  };
}

function statusPill(
  bookingStatus: string,
  t: {
    (key: "confirmed" | "cancelled" | "pendingConfirmation"): string;
  }
) {
  switch (bookingStatus) {
    case "confirmed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <CheckCircle2 className="h-3.5 w-3.5" /> {t("confirmed")}
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
          {t("cancelled")}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-tint px-3 py-1 text-xs font-medium text-accent-hover">
          {t("pendingConfirmation")}
        </span>
      );
  }
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { locale, bookingCode } = await params;
  const t = await getTranslations("booking.page");
  const booking = await getBookingByCode(bookingCode);

  if (!booking) return notFound();

  const paymentStatus = booking.payment.status;
  const isPaid = paymentStatus === "paid";

  const zaloMessage = [
    t("zaloMessage.greeting"),
    t("zaloMessage.code").replace("{code}", booking.bookingCode),
    t("zaloMessage.tour").replace("{title}", booking.tourTitle).replace("{variant}", booking.variant),
    t("zaloMessage.date").replace("{date}", booking.departureDate),
    t("zaloMessage.guests").replace("{count}", String(booking.guestCount)),
    t("zaloMessage.name").replace("{name}", booking.customer.fullName),
    t("zaloMessage.total").replace("{total}", formatVnd(booking.totalAmount)),
  ].join("\n");

  return (
    <div className="min-h-screen">
      <SiteHeader variant="solid" />
      <main className="pt-32 lg:pt-40">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="rounded-[1.75rem] border border-border bg-card p-8 shadow-lg sm:p-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-accent">
                    {t("booking")}
                  </p>
                  <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
                    {booking.bookingCode}
                  </h1>
                </div>
                {statusPill(booking.bookingStatus, t)}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-background p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {t("tour")}
                  </p>
                  <p className="mt-2 font-serif text-lg text-foreground">
                    {booking.tourTitle}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {booking.variant}
                  </p>
                </div>
                <div className="rounded-2xl bg-background p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {t("departure")}
                  </p>
                  <p className="mt-2 flex items-center gap-2 font-serif text-lg text-foreground">
                    <CalendarDays className="h-4 w-4 text-accent" />
                    {new Date(
                      `${booking.departureDate.slice(0, 10)}T00:00:00`
                    ).toLocaleDateString(
                      locale === "vi" ? "vi-VN" : "en-GB",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4 text-accent" />
                    {booking.guestCount}{" "}
                    {booking.guestCount === 1 ? t("guest") : t("guests")}
                  </p>
                </div>
              </div>

              {/* Customer */}
              <div className="mt-4 rounded-2xl bg-background p-5">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {t("customer")}
                </p>
                <p className="mt-2 font-serif text-lg text-foreground">
                  {booking.customer.fullName}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-accent" />
                    {booking.customer.phone}
                  </span>
                  {booking.customer.email && (
                    <span>{booking.customer.email}</span>
                  )}
                  {booking.customer.nationality && (
                    <span>{booking.customer.nationality}</span>
                  )}
                </p>
              </div>

              {/* Price */}
              <div className="mt-4 space-y-2 rounded-2xl bg-background p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {booking.variant} × {booking.guestCount}
                  </span>
                  <span className="text-foreground">
                    {formatVnd(booking.subtotal)}
                  </span>
                </div>
                {booking.discount > 0 && (
                  <div className="flex items-center justify-between text-sm text-primary">
                    <span>{t("discount")}</span>
                    <span>-{formatVnd(booking.discount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("vat")}</span>
                  <span className="text-foreground">{formatVnd(booking.vat)}</span>
                </div>
                {booking.cardFee > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("cardFee")}</span>
                    <span className="text-foreground">{formatVnd(booking.cardFee)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-sm font-medium text-foreground">
                    {t("total")}
                  </span>
                  <span className="font-serif text-2xl text-accent-hover">
                    {formatVnd(booking.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Payment status */}
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-background p-5">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Wallet className="h-4 w-4 text-accent" />
                  {t("payment")}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                    isPaid
                      ? "bg-primary/10 text-primary"
                      : "bg-accent-tint text-accent-hover"
                  }`}>
                  <CreditCard className="h-3.5 w-3.5" />
                  {paymentStatus === "paid"
                    ? t("paid")
                    : paymentStatus === "failed"
                      ? t("paymentFailed")
                      : paymentStatus === "refunded"
                        ? t("refunded")
                        : t("paymentPending")}
                </span>
              </div>

              {/* Next steps */}
              <div className="mt-6 rounded-2xl bg-accent-tint p-5">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-hover">
                  {t("nextSteps")}
                </p>
                <p className="mt-2 text-sm font-light leading-7 text-accent-hover">
                  {isPaid ? t("nextStepsPaid") : t("nextStepsPending")}
                </p>
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap gap-3">
                {!isPaid && booking.bookingStatus !== "cancelled" && (
                  <BookingPayButton bookingCode={booking.bookingCode} locale={locale} />
                )}
                <a
                  href={getZaloLink(zaloMessage)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-background px-7 text-sm font-medium text-foreground transition-colors hover:border-accent/40">
                  <MessageCircle className="h-4 w-4" />
                  {t("contactZalo")}
                </a>
                <a
                  href={getPhoneLink()}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-background px-7 text-sm font-medium text-foreground transition-colors hover:border-accent/40">
                  <Phone className="h-4 w-4" />
                  {siteConfig.contact.phone}
                </a>
              </div>
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
