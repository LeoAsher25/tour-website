import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { BlogPost } from "@/types/domain";

export function formatBlogDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function BlogCard({
  post,
  featured = false,
}: {
  post: BlogPost;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className={`group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        featured ? "md:grid md:grid-cols-2" : ""
      }`}
    >
      <div className={`relative overflow-hidden ${featured ? "h-64 md:h-full" : "h-56"}`}>
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          sizes={
            featured
              ? "(max-width: 768px) 100vw, 50vw"
              : "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          }
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/40 to-transparent opacity-50 transition-opacity duration-300 group-hover:opacity-70" />
        {featured && (
          <span className="absolute left-4 top-4 rounded-full bg-accent px-4 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-accent-foreground shadow-md">
            Featured
          </span>
        )}
      </div>

      <div className={`flex flex-col ${featured ? "p-6 sm:p-8" : "p-6"}`}>
        <div className="flex flex-wrap items-center gap-2">
          {post.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-accent-tint px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-accent-hover"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3
          className={`mt-4 font-serif leading-snug text-foreground transition-colors group-hover:text-accent ${
            featured ? "text-3xl sm:text-4xl" : "text-2xl"
          }`}
        >
          {post.title}
        </h3>
        <p
          className={`mt-3 font-light leading-7 text-muted-foreground ${
            featured ? "line-clamp-3 text-base" : "line-clamp-2 text-sm"
          }`}
        >
          {post.excerpt}
        </p>
        <div className="mt-auto flex items-center justify-between pt-6">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {formatBlogDate(post.publishedAt)} · {post.readingMinutes} min read
          </p>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all duration-200 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
