import type { Metadata } from "next";
import Image from "next/image";

import { BlogCard } from "@/components/blog-card";
import { Container } from "@/components/container";
import { SiteFooter } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { getBlogPosts } from "@/lib/repository";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Travel Stories & Guides",
  description:
    `Guides, stories and practical advice from the Ha Giang Loop — seasons, packing, passes, villages and more from the ${siteConfig.brand.businessName} team.`,
};

export default async function BlogsPage() {
  const posts = await getBlogPosts();
  const [featured, ...rest] = posts;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        {/* Page hero */}
        <section className="relative overflow-hidden bg-dark-bg py-24 text-dark-text lg:py-32">
          <div className="absolute inset-0" aria-hidden="true">
            <Image
              src="/images/intro/z3791965260038_94e777e6d75cfdf1cec5e7f55a559093-1-1110x7501_1680112915.png.webp"
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-dark-bg/70 to-dark-bg" />
          </div>

          <Container className="relative">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-accent-tint">
              Stories from the road
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">
              Notes from the{" "}
              <span className="accent-word">highlands</span>
            </h1>
            <p className="mt-6 max-w-xl text-base font-light leading-8 text-dark-muted sm:text-lg">
              Seasons, packing lists, the passes that stop you cold, and the
              villages that keep you. Everything we know about riding the Ha
              Giang Loop.
            </p>
          </Container>
        </section>

        {/* Featured post */}
        {featured && (
          <section className="py-16 lg:py-20">
            <Container>
              <BlogCard post={featured} featured />
            </Container>
          </section>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <section className="pb-20 lg:pb-28">
            <Container>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            </Container>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
