import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

/**
 * Shared admin page header — consistent title + subtitle + actions across
 * all admin pages.
 */
export function PageHeader({
  title,
  subtitle,
  backHref,
  action,
}: {
  title: React.ReactNode;
  subtitle?: string;
  backHref?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Link>
        )}
        <h1 className="font-serif text-3xl text-foreground">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/** Shared primary "create" button used in page headers. */
export function CreateButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-md"
    >
      <Plus className="h-4 w-4" />
      {children}
    </Link>
  );
}

