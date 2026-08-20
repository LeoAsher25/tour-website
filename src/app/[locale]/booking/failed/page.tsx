import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AlertTriangle, MessageCircle, RotateCcw } from "lucide-react";
import { Link } from "@/i18n/navigation";

import { Container } from "@/components/container";
import { SiteFooter } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { getZaloLink } from "@/config/site";

interface FailedPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ code?: string; reason?: string }>;
}

export async function generateMetadata({ params }: FailedPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "booking.failed" });
  return {
    title: t("title"),
    robots: { index: false, follow: false },
  };
}

export default async function BookingFailedPage({
  searchParams,
}: FailedPageProps) {
  const { code, reason } = await searchParams;
  const t = await getTranslations("booking.failed");

  const reasonText =
    reason === "invalid_signature"
      ? t("reasonInvalidSignature")
      : reason === "not_found"
        ? t("reasonNotFound")
        : reason === "cancelled" || reason === "24"
          ? t("reasonCancelled")
          : t("reasonDefault");

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
              {t("h1")} <span className="accent-word">{t("h1Accent")}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base font-light leading-8 text-muted-foreground sm:text-lg">
              {reasonText}
            </p>

            {code && (
              <p className="mt-4 text-sm text-muted-foreground">
                {t("yourCode", { code })}
              </p>
            )}

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {code && (
                <Link
                  href={`/booking/${code}`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-8 text-sm font-medium text-accent-foreground shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover">
                  <RotateCcw className="h-4 w-4" />
                  {t("retryPayment")}
                </Link>
              )}
              <Link
                href="/#tours"
                className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background px-8 text-sm font-medium text-foreground transition-colors hover:border-accent/40">
                {t("browseTours")}
              </Link>
              <a
                href={getZaloLink(
                  code
                    ? t("zaloFailed", { code })
                    : t("zaloGeneric"),
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-background px-8 text-sm font-medium text-foreground transition-colors hover:border-accent/40">
                <MessageCircle className="h-4 w-4" />
                {t("contactZalo")}
              </a>
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
