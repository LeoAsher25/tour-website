import { Check, Minus } from "lucide-react";

import { Container } from "@/components/container";
import { SectionHeader } from "@/components/section-header";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { formatVnd } from "@/lib/pricing";
import type { Tour } from "@/types/domain";

export function TourPricing({ tour }: { tour: Tour }) {
  return (
    <section id="pricing" className="scroll-mt-24 bg-surface py-20 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow="Pricing"
          title={
            <>
              Simple, honest{" "}
              <span className="accent-word">pricing</span>
            </>
          }
          description="Pick your riding style. Every package includes the full experience — no hidden costs at the end of the road."
          align="center"
        />

        {/* Variant options */}
        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tour.variants.map((variant, i) => (
            <StaggerItem key={variant.id}>
              <div
                className={`relative flex h-full flex-col rounded-3xl border p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  i === 0
                    ? "border-primary/30 bg-card"
                    : "border-border bg-card"
                }`}
              >
                {i === 0 && (
                  <span className="absolute -top-3 left-7 rounded-full bg-primary px-3.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.16em] text-primary-foreground">
                    Most popular
                  </span>
                )}
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {variant.name}
                </p>
                {variant.description && (
                  <p className="mt-1 text-xs font-light text-muted-foreground">
                    {variant.description}
                  </p>
                )}
                <div className="mt-5">
                  <p className="font-serif text-3xl text-accent-hover">
                    {formatVnd(variant.basePrice)}
                  </p>
                  <p className="mt-1 text-xs font-light text-muted-foreground">
                    {variant.priceType === "per_group"
                      ? "per group"
                      : "per person"}
                  </p>
                </div>
                <div className="mt-auto pt-6">
                  <a
                    href="#booking"
                    className={`inline-flex h-11 w-full items-center justify-center rounded-full px-6 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                      i === 0
                        ? "bg-accent text-accent-foreground shadow-md hover:bg-accent-hover hover:shadow-lg"
                        : "border border-border bg-background text-foreground hover:border-accent hover:text-accent"
                    }`}
                  >
                    Choose this option
                  </a>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Included / Excluded */}
        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-9">
            <h3 className="font-serif text-2xl text-foreground">
              What&rsquo;s <span className="accent-word">included</span>
            </h3>
            <ul className="mt-6 space-y-3.5">
              {tour.included.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </span>
                  <p className="text-sm font-light leading-6 text-muted-foreground">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-9">
            <h3 className="font-serif text-2xl text-foreground">
              Good to <span className="accent-word">know</span>
            </h3>
            <ul className="mt-6 space-y-3.5">
              {tour.excluded.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                    <Minus className="h-3.5 w-3.5 text-destructive" />
                  </span>
                  <p className="text-sm font-light leading-6 text-muted-foreground">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
            {tour.addOns.length > 0 && (
              <div className="mt-7 border-t border-border pt-6">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Optional extras
                </p>
                <ul className="mt-4 space-y-3">
                  {tour.addOns.map((addOn) => (
                    <li
                      key={addOn.id}
                      className="flex items-center justify-between gap-4 text-sm"
                    >
                      <span className="font-light text-muted-foreground">
                        {addOn.name}
                        <span className="block text-xs text-muted-foreground/70">
                          {addOn.description}
                        </span>
                      </span>
                      <span className="shrink-0 font-serif text-base text-accent-hover">
                        +{formatVnd(addOn.price)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-7 text-xs font-light leading-6 text-muted-foreground">
              {tour.accommodation} {tour.transportation}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
