import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

import { Container } from "@/components/container";
import { SectionHeader } from "@/components/section-header";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { TourCard } from "@/components/tour-card";
import { getHomepageTours } from "@/lib/repository";

export async function ToursSection({
  locale = "en",
}: {
  locale?: string;
} = {}) {
  const t = await getTranslations("home.tours");
  const { featured } = await getHomepageTours(locale);

  return (
    <section id="tours" className="scroll-mt-24 py-24 lg:py-32">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            eyebrow={t("eyebrow")}
            title={
              <>
                {t("title1")}{" "}
                <span className="accent-word">{t("titleAccent")}</span>
              </>
            }
            description={t("description")}
          />
          <div className="hidden shrink-0 rounded-full border border-border bg-surface px-6 py-3 text-sm font-medium text-muted-foreground lg:block">
            {t("groupBadge")}
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
                duration={t("duration", { days: tour.durationDays, nights: tour.durationNights })}
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
            {t("checkAvailability")}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
