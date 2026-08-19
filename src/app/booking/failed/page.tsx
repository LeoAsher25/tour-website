import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, MessageCircle, RotateCcw } from "lucide-react";

import { Container } from "@/components/container";
import { SiteFooter } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { getZaloLink } from "@/config/site";

export const metadata: Metadata = {
  title: "Payment not completed",
  robots: { index: false, follow: false },
};

interface FailedPageProps {
  searchParams: Promise<{ code?: string; reason?: string }>;
}

export default async function BookingFailedPage({
  searchParams,
}: FailedPageProps) {
  const { code, reason } = await searchParams;

  const reasonText =
    reason === "invalid_signature"
      ? "The payment response could not be verified. Your card was not charged."
      : reason === "not_found"
        ? "We couldn't find this booking. It may have expired."
        : reason === "cancelled" || reason === "24"
          ? "You cancelled the payment before it completed."
          : "The payment did not complete. Your card was not charged.";

  return (
    <div className="min-h-screen">
      <SiteHeader variant="solid" />
      <main className="pt-32 lg:pt-40">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle className="h-10 w-10" />
            </span>
            <h1 className="mt-8 font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">
              Payment not <span className="accent-word">completed</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base font-light leading-8 text-muted-foreground sm:text-lg">
              {reasonText}
            </p>

            {code && (
              <p className="mt-4 text-sm text-muted-foreground">
                Your booking code is{" "}
                <span className="font-medium text-foreground">{code}</span>. You
                can retry payment from your booking page.
              </p>
            )}

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {code && (
                <Link
                  href={`/booking/${code}`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-8 text-sm font-medium text-accent-foreground shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover">
                  <RotateCcw className="h-4 w-4" />
                  Retry payment
                </Link>
              )}
              <Link
                href="/#tours"
                className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background px-8 text-sm font-medium text-foreground transition-colors hover:border-accent/40">
                Browse tours
              </Link>
              <a
                href={getZaloLink(
                  code
                    ? `Xin chào Jasmine Tours! Thanh toán đơn ${code} chưa thành công, tôi cần hỗ trợ.`
                    : "Xin chào Jasmine Tours! Tôi cần hỗ trợ thanh toán."
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-background px-8 text-sm font-medium text-foreground transition-colors hover:border-accent/40">
                <MessageCircle className="h-4 w-4" />
                Contact via Zalo
              </a>
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
