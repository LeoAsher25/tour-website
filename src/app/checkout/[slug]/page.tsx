import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { SiteFooter } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { getTourBySlug } from "@/lib/repository";

interface CheckoutPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string }>;
}

export async function generateMetadata({
  params,
}: CheckoutPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) return {};
  return {
    title: `Book ${tour.title}`,
    description: `Book your ${tour.title} in Ha Giang — instant online booking with VNPay or contact via Zalo.`,
  };
}

export default async function CheckoutPage({
  params,
  searchParams,
}: CheckoutPageProps) {
  const { slug } = await params;
  const { variant } = await searchParams;
  const tour = await getTourBySlug(slug);
  if (!tour) return notFound();

  const initialVariantId = tour.variants.find((v) => v.id === variant)?.id;

  return (
    <div className="min-h-screen">
      <SiteHeader variant="solid" />
      <main className="pt-32 lg:pt-40">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-accent">
              Checkout
            </p>
            <h1 className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl">
              Book your <span className="accent-word">adventure</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base font-light leading-8 text-muted-foreground sm:text-lg">
              Choose your option, pick a date, and tell us who&rsquo;s riding.
              Pay securely online with VNPay, or contact us via Zalo and we&rsquo;ll
              confirm your booking.
            </p>

            <div className="mt-10">
              <CheckoutForm
                tour={tour}
                initialVariantId={initialVariantId}
              />
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
