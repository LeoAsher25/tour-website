import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

import { Container } from "@/components/container";
import { SectionHeader } from "@/components/section-header";
import { TourCard } from "@/components/tour-card";
import { getRelatedTours } from "@/lib/repository";

export async function RelatedTours({
  slug,
  locale = "en",
}: {
  slug: string;
  locale?: string;
}) {
  const t = await getTranslations("tourDetail.related");
  const related = await getRelatedTours(slug, 3, locale);

  if (related.length === 0) return null;

  return (
    <section className="border-t border-border bg-background py-20 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={
            <>
              {t("title1")}{" "}
              <span className="accent-word">{t("titleAccent")}</span>
            </>
          }
          description={t("description")}
          align="center"
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {related.map((tour) => (
            <TourCard
              key={tour.slug}
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
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/#tours"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg"
          >
            {t("viewAll")}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
