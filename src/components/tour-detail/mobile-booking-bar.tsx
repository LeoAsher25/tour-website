import { getTranslations } from "next-intl/server";
import { formatVnd } from "@/lib/pricing";
import type { Tour } from "@/types/domain";

/** Mobile-only sticky bottom booking bar. */
export async function MobileBookingBar({ tour }: { tour: Tour }) {
  const t = await getTranslations("tourDetail.mobileBar");
  const cheapest = tour.variants[0];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 p-3 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 pl-1">
          <p className="truncate font-serif text-lg text-foreground">
            {tour.title}
          </p>
          <p className="text-xs font-light text-muted-foreground">
            {t("from")}{" "}
            <span className="font-medium text-accent-hover">
              {formatVnd(cheapest?.basePrice ?? tour.fromPrice)}
            </span>{" "}
            {t("perPerson")}
          </p>
        </div>
        <a
          href="#booking"
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground shadow-lg transition-all duration-200 hover:bg-accent-hover"
        >
          {t("bookNow")}
        </a>
      </div>
    </div>
  );
}
