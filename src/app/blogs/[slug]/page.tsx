import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";

import { Container } from "@/components/container";
import { SiteFooter } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { getBlogPostBySlug, getLatestBlogPosts } from "@/lib/repository";
import { renderTiptap } from "@/lib/blogs/render-tiptap";
import { formatBlogDate } from "@/components/blog-card";
import { getZaloLink } from "@/config/site";
import { buildOpenGraph, buildTwitterCard, siteUrl } from "@/lib/seo/og";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Article not found" };

  const ogImage = post.coverImage;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blogs/${post.slug}` },
    openGraph: buildOpenGraph({
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `${siteUrl}/blogs/${post.slug}`,
      images: ogImage ? [ogImage] : [],
      publishedTime: post.publishedAt,
      authors: post.author ? [post.author] : [],
    }),
    twitter: buildTwitterCard({
      title: post.title,
      description: post.excerpt,
      images: ogImage ? [ogImage] : [],
    }),
  };
}

export async function generateStaticParams() {
  const posts = await getLatestBlogPosts(50);
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogDetailPage({
  params,
}: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const related = (await getLatestBlogPosts(4))
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      <SiteHeader variant="solid" />
      <main>
        {/* Article header */}
        <article>
          <header className="border-b border-border bg-surface">
            <Container className="max-w-4xl">
              <div className="py-14 pt-28 lg:py-20 lg:pt-36">
                <Link
                  href="/blogs"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
                >
                  ← All stories
                </Link>
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-accent-tint px-3.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-accent-hover"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h1 className="mt-6 font-serif text-4xl leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
                  {post.title}
                </h1>
                <p className="mt-6 max-w-2xl text-lg font-light leading-8 text-muted-foreground">
                  {post.excerpt}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-serif text-sm text-primary">
                      {post.author.charAt(0)}
                    </span>
                    {post.author}
                  </span>
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-accent" />
                    {formatBlogDate(post.publishedAt)}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent" />
                    {post.readingMinutes} min read
                  </span>
                </div>
              </div>
            </Container>
          </header>

          {/* Cover */}
          <Container className="max-w-5xl">
            <div className="relative mt-10 h-[300px] overflow-hidden rounded-3xl border border-border shadow-lg sm:h-[420px] lg:h-[520px]">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 64rem"
                className="object-cover"
              />
            </div>
          </Container>

          {/* Body — server-rendered Tiptap JSON */}
          <Container className="max-w-3xl">
            <div className="prose-jasmine py-14 lg:py-20">
              {renderTiptap(post.contentJson)}
            </div>
          </Container>
        </article>

        {/* Related */}
        {related.length > 0 && (
          <section className="border-t border-border bg-surface py-16 lg:py-20">
            <Container>
              <h2 className="font-serif text-3xl text-foreground">
                Keep <span className="accent-word">reading</span>
              </h2>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {related.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/blogs/${p.slug}`}
                    className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        src={p.coverImage}
                        alt={p.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                        {formatBlogDate(p.publishedAt)}
                      </p>
                      <h3 className="mt-2 line-clamp-2 font-serif text-xl leading-snug text-foreground transition-colors group-hover:text-accent">
                        {p.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 lg:py-20">
          <Container>
            <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-12">
              <h2 className="mx-auto max-w-xl font-serif text-3xl leading-tight text-foreground sm:text-4xl">
                Inspired? The loop is <span className="accent-word">waiting</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm font-light leading-7 text-muted-foreground">
                Group tours run daily with ~10 riders. Book now or ask us
                anything on Zalo.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/#booking"
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-accent px-8 text-sm font-medium text-accent-foreground shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-lg"
                >
                  Book a tour
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <a
                  href={getZaloLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center rounded-full border border-border bg-background px-8 text-sm font-medium text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                >
                  Chat on Zalo
                </a>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
