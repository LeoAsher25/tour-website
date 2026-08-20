import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Fraunces, Inter } from "next/font/google";
import { RouteScrollReset } from "@/components/route-scroll-reset";
import { ScrollToTop } from "@/components/scroll-to-top";
import { siteConfig } from "@/config/site";
import { buildOpenGraph, buildTwitterCard, siteUrl } from "@/lib/seo/og";
import { routing } from "@/i18n/routing";
import "@/app/globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  axes: ["opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site.seo" });

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t("title"),
      template: `%s | ${siteConfig.brand.fullName}`,
    },
    description: t("description"),
    openGraph: buildOpenGraph({
      title: t("title"),
      description: t("description"),
      url: `${siteUrl}/${locale}`,
      locale,
    }),
    twitter: buildTwitterCard({
      title: t("title"),
      description: t("description"),
    }),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          <RouteScrollReset />
          {children}
          <ScrollToTop />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
