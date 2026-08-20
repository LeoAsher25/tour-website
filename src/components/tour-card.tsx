import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, Clock, MapPin, Star } from "lucide-react";
import { Link } from "@/i18n/navigation";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatVnd } from "@/lib/pricing";

export type TourCardProps = {
  slug: string;
  title: string;
  location: string;
  duration: string;
  price: number; // integer VND
  image: string;
  description: string;
  highlight?: string;
  featured?: boolean;
  rating?: number;
  className?: string;
};

export function TourCard({
  slug,
  title,
  location,
  duration,
  price,
  image,
  description,
  highlight,
  featured = false,
  rating,
  className,
}: TourCardProps) {
  const t = useTranslations("site");

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl",
        className,
      )}>
      <Link href={`/tours/${slug}`} className="flex h-full flex-col">
        {/* Image — taller, layered gradient, hover zoom + darkening */}
        <div className="relative h-80 overflow-hidden sm:h-96">
          <Image
            src={image}
            alt={title}
            width={700}
            height={520}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/70 via-dark-bg/10 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

          {/* Top row — badges */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
            <div className="flex gap-2">
              {featured && <Badge variant="accent">Featured</Badge>}
              {highlight && (
                <Badge className="bg-dark-bg/60 text-dark-text backdrop-blur-sm">
                  {highlight}
                </Badge>
              )}
            </div>            {rating && (
              <div className="flex items-center gap-1 rounded-full bg-card/90 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                {rating}
              </div>
            )}
          </div>

          {/* Bottom overlay — location + duration, appears on hover for editorial feel */}
          <div className="absolute bottom-0 left-0 right-0 p-5 text-dark-text">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-dark-muted">
              <MapPin className="h-3.5 w-3.5 text-accent" />
              {location}
              <span className="text-dark-text/40">·</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {duration}
              </span>
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col space-y-4 p-6 sm:p-7">
          <div className="space-y-3">
            <h3 className="font-serif text-[1.65rem] leading-tight text-foreground transition-colors duration-200 group-hover:text-accent">
              {title}
            </h3>
            <p className="line-clamp-2 text-sm font-light leading-6 text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-5">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                From
              </p>
              <p className="font-serif text-2xl font-normal text-accent-hover">
                {formatVnd(price)}
              </p>
            </div>
            <span className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-medium text-foreground transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground">
              {t("tourCard.viewTour")}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
