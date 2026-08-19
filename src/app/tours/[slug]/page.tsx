import type { Metadata } from "next";
import { notFound } from "next/navigation";

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

interface TourDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: TourDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) return { title: "Tour not found" };

  return {
    title: tour.seoTitle ?? tour.title,
    description: tour.seoDescription ?? tour.description,
    alternates: { canonical: `/tours/${tour.slug}` },
    openGraph: {
      title: tour.title,
      description: tour.description,
      type: "website",
      images: [{ url: tour.heroImage }],
    },
  };
}

export async function generateStaticParams() {
  const tours = await getPublishedTours();
  return tours.map((tour) => ({ slug: tour.slug }));
}

export default async function TourDetailPage({
  params,
}: TourDetailPageProps) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
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
        <RelatedTours slug={tour.slug} />
      </main>
      <SiteFooter />
      <MobileBookingBar tour={tour} />
    </div>
  );
}
