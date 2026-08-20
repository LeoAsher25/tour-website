import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

import { Container } from "@/components/container";
import { SectionHeader } from "@/components/section-header";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { getLatestBlogCards } from "@/lib/repository";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export async function BlogPreviewSection() {
  const t = await getTranslations("home.blogPreview");
  const posts = await getLatestBlogCards(3);

  if (posts.length === 0) return null;

  return (
    <section className="bg-surface py-24 lg:py-32">
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
          />
          <Link
            href="/blogs"
            className="group inline-flex shrink-0 items-center gap-3 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
          >
            {t("viewAll")}
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/30 bg-accent-tint transition-all duration-300 group-hover:translate-x-1 group-hover:bg-accent group-hover:text-accent-foreground">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>

        <Stagger
          gap={0.1}
          className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-3"
        >
          {posts.map((post) => (
            <StaggerItem key={post.slug} scale>
              <Link
                href={`/blogs/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div className="relative h-60 overflow-hidden">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/40 to-transparent opacity-50 transition-opacity duration-300 group-hover:opacity-70" />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-background/85 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-accent backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-1 flex-col space-y-3 p-6 sm:p-7">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {formatDate(post.publishedAt)} · {t("minRead", { minutes: post.readingMinutes })}
                  </p>
                  <h3 className="line-clamp-2 font-serif text-2xl leading-snug text-foreground transition-colors group-hover:text-accent">
                    {post.title}
                  </h3>
                  <p className="line-clamp-2 text-sm font-light leading-6 text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <span className="mt-auto flex items-center gap-2 pt-4 text-sm font-medium text-accent transition-colors group-hover:text-accent-hover">
                    {t("readStory")}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
