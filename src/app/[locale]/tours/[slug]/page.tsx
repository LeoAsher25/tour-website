import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { SiteFooter } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { TourHero } from "@/components/tour-detail/tour-hero";
import { TourOverview } from "@/components/tour-detail/tour-overview";
import { TourHighlights } from "@/components/tour-detail/tour-highlights";
import { TourItinerary } from "@/components/tour-detail/tour-itinerary";
import { TourPricing } from "@/components/tour-detail/tour-pricing";
import { TourBookingCard } from "@/components/tour-detail/tour-booking-card";
import { TourGallery } from "@/components/tour-detail/tour-gallery";
import { TourFaq } from "@/components/tour-detail/tour-faq";
import { RelatedTours } from "@/components/tour-detail/related-tours";
import { MobileBookingBar } from "@/components/tour-detail/mobile-booking-bar";
import { getPublishedTours, getTourBySlug } from "@/lib/repository";
import { buildOpenGraph, buildTwitterCard, siteUrl } from "@/lib/seo/og";
import { routing } from "@/i18n/routing";

interface TourDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: TourDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "site.notFound" });
  const tour = await getTourBySlug(slug);
  if (!tour) return { title: t("title") };

  const ogImage = tour.heroImage;
  return {
    title: tour.seoTitle ?? tour.title,
    description: tour.seoDescription ?? tour.description,
    alternates: {
      canonical: `/${locale}/tours/${tour.slug}`,
      languages: {
        en: `/en/tours/${tour.slug}`,
        vi: `/vi/tours/${tour.slug}`,
      },
    },
    openGraph: buildOpenGraph({
      title: tour.title,
      description: tour.description,
      url: `${siteUrl}/${locale}/tours/${tour.slug}`,
      images: ogImage ? [ogImage] : [],
      locale,
    }),
    twitter: buildTwitterCard({
      title: tour.title,
      description: tour.description,
      images: ogImage ? [ogImage] : [],
    }),
  };
}

export async function generateStaticParams() {
  const tours = await getPublishedTours();
  return routing.locales.flatMap((locale) =>
    tours.map((tour) => ({ locale, slug: tour.slug }))
  );
}

export default async function TourDetailPage({
  params,
}: TourDetailPageProps) {
  const { locale, slug } = await params;
  const tour = await getTourBySlug(slug, locale);
  if (!tour) notFound();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <TourHero tour={tour} />
        <TourOverview tour={tour} />
        <TourHighlights tour={tour} />
        <TourItinerary tour={tour} aside={<TourBookingCard tour={tour} />} />
        <TourPricing tour={tour} />
        <TourGallery tour={tour} />
        <TourFaq tour={tour} />
        <RelatedTours slug={tour.slug} locale={locale} />
      </main>
      <SiteFooter />
      <MobileBookingBar tour={tour} />
    </div>
  );
}
