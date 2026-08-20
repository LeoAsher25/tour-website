import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";

import { Container } from "@/components/container";
import { SiteFooter } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { getBookingByCode } from "@/lib/bookings";
import { getZaloLink } from "@/config/site";

interface SuccessPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ code?: string }>;
}

export async function generateMetadata({ params }: SuccessPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "booking.success" });
  return {
    title: t("title"),
    robots: { index: false, follow: false },
  };
}

export default async function BookingSuccessPage({
  params,
  searchParams,
}: SuccessPageProps) {
  const { locale } = await params;
  const { code } = await searchParams;
  const t = await getTranslations("booking.success");
  const booking = code ? await getBookingByCode(code) : null;

  const dateStr = booking
    ? new Date(`${booking.departureDate.slice(0, 10)}T00:00:00`).toLocaleDateString(
        locale === "vi" ? "vi-VN" : "en-GB",
        { day: "numeric", month: "long", year: "numeric" }
      )
    : "";

  return (
    <div className="min-h-screen">
      <SiteHeader variant="solid" />
      <main className="pt-32 lg:pt-40">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-10 w-10" />
            </span>
            <h1 className="mt-8 font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">
              {t("h1")}{" "}
              <span className="accent-word">{t("h1Accent")}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base font-light leading-8 text-muted-foreground sm:text-lg">
              {booking ? (
                <>
                  {t("confirmedWith", {
                    code: booking.bookingCode,
                    title: booking.tourTitle,
                    variant: booking.variant,
                    date: dateStr,
                  })}
                </>
              ) : (
                t("noBooking")
              )}
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {booking && (
                <Link
                  href={`/booking/${booking.bookingCode}`}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 text-sm font-medium text-accent-foreground shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover">
                  {t("viewDetails")}
                </Link>
              )}
              <Link
                href={getZaloLink(
                  booking
                    ? t("zaloPaid", { code: booking.bookingCode })
                    : t("zaloGeneric"),
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border bg-background px-8 text-sm font-medium text-foreground transition-all border-accent/40 duration-200 hover:-translate-y-0.5  hover:text-accent-foreground hover:bg-accent-hover">
                <MessageCircle className="h-4 w-4" />
                {t("contactZalo")}
              </Link>
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
