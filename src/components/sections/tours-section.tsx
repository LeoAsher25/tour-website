import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/container";
import { SectionHeader } from "@/components/section-header";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { TourCard } from "@/components/tour-card";
import { getHomepageTours } from "@/lib/repository";

export async function ToursSection() {
  const { featured } = await getHomepageTours();

  return (
    <section id="tours" className="scroll-mt-24 py-24 lg:py-32">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            eyebrow="Our tours"
            title={
              <>
                Simple and flexible{" "}
                <span className="accent-word">pricing</span>
              </>
            }
            description="Motorbike loops, jeep adventures and private SUV experiences — every tour is a small group with local guides, homestays and all meals included."
          />
          <div className="hidden shrink-0 rounded-full border border-border bg-surface px-6 py-3 text-sm font-medium text-muted-foreground lg:block">
            Group tours run daily · ~10 people
          </div>
        </div>

        <Stagger
          gap={0.12}
          className="mt-14 grid gap-7 md:grid-cols-2 xl:grid-cols-3"
        >
          {featured.map((tour) => (
            <StaggerItem key={tour.slug} scale>
              <TourCard
                slug={tour.slug}
                title={tour.title}
                location={tour.destination}
                duration={`${tour.durationDays}D ${tour.durationNights}N`}
                price={tour.fromPrice}
                image={tour.heroImage}
                description={tour.description}
                highlight={tour.subtitle}
                featured={tour.featured}
                rating={tour.rating}
              />
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-14 text-center">
          <Link
            href="/#booking"
            className="group inline-flex h-13 items-center gap-2 rounded-full bg-primary px-9 text-sm font-medium text-primary-foreground shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg"
          >
            Check availability &amp; book
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
