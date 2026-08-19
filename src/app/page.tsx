import { SiteFooter } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { IntroSection } from "@/components/sections/intro-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { ToursSection } from "@/components/sections/tours-section";
import { ItinerarySection } from "@/components/sections/itinerary-section";
import { BookingSectionServer } from "@/components/sections/booking-section-server";
import { ServicesSection } from "@/components/sections/services-section";
import { VideoSection } from "@/components/sections/video-section";
import { GallerySection } from "@/components/sections/gallery-section";
import { FaqSection } from "@/components/sections/faq-section";
import { BlogPreviewSection } from "@/components/sections/blog-preview-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";

export default function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <Hero />
        <IntroSection />
        <ExperienceSection />
        <ToursSection />
        <ItinerarySection />
        <BookingSectionServer />
        <ServicesSection />
        <VideoSection />
        <GallerySection />
        <BlogPreviewSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
