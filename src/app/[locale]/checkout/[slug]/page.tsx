import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/container";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { SiteFooter } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { getTourBySlug } from "@/lib/repository";

interface CheckoutPageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ variant?: string }>;
}

export async function generateMetadata({
  params,
}: CheckoutPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "checkout.page" });
  const tour = await getTourBySlug(slug);
  if (!tour) return {};
  return {
    title: t("metaTitle", { title: tour.title }),
    description: t("metaDescription", { title: tour.title }),
  };
}

export default async function CheckoutPage({
  params,
  searchParams,
}: CheckoutPageProps) {
  const { locale, slug } = await params;
  const { variant } = await searchParams;
  const t = await getTranslations("checkout.page");
  const tour = await getTourBySlug(slug, locale);
  if (!tour) return notFound();

  const initialVariantId = tour.variants.find((v) => v.id === variant)?.id;

  return (
    <div className="min-h-screen">
      <SiteHeader variant="solid" />
      <main className="pt-32 lg:pt-40">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-accent">
              {t("eyebrow")}
            </p>
            <h1 className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl">
              {t("title1")} <span className="accent-word">{t("titleAccent")}</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base font-light leading-8 text-muted-foreground sm:text-lg">
              {t("description")}
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
