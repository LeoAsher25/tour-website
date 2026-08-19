import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";

import { Container } from "@/components/container";
import { SiteFooter } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { getBookingByCode } from "@/lib/bookings";
import { getZaloLink } from "@/config/site";

export const metadata: Metadata = {
  title: "Booking confirmed",
  robots: { index: false, follow: false },
};

interface SuccessPageProps {
  searchParams: Promise<{ code?: string }>;
}

export default async function BookingSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { code } = await searchParams;
  const booking = code ? await getBookingByCode(code) : null;

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
              Thank you! Your booking is{" "}
              <span className="accent-word">confirmed</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base font-light leading-8 text-muted-foreground sm:text-lg">
              {booking ? (
                <>
                  Booking <span className="font-medium text-foreground">{booking.bookingCode}</span>{" "}
                  for {booking.tourTitle} ({booking.variant}) on{" "}
                  {new Date(`${booking.departureDate}T00:00:00`).toLocaleDateString(
                    "en-GB",
                    { day: "numeric", month: "long", year: "numeric" }
                  )}{" "}
                  is confirmed. We&rsquo;ll be in touch on your phone before departure.
                </>
              ) : (
                "Your payment was received and your booking is confirmed. Check your email for details."
              )}
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {booking && (
                <Link
                  href={`/booking/${booking.bookingCode}`}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 text-sm font-medium text-accent-foreground shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover">
                  View booking details
                </Link>
              )}
              <a
                href={getZaloLink(
                  booking
                    ? `Xin chào Jasmine Tours! Tôi đã thanh toán thành công đơn ${booking.bookingCode}.`
                    : "Xin chào Jasmine Tours! Tôi vừa hoàn tất thanh toán tour."
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-background px-8 text-sm font-medium text-foreground transition-colors hover:border-accent/40">
                <MessageCircle className="h-4 w-4" />
                Contact us on Zalo
              </a>
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
